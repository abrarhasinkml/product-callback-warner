# User Profiles, Auth & Product Catalog — Implementation Plan

## Goal
Add user registration/login, per-user favorite products lists, and a product search with autocomplete powered by OpenFoodFacts (German grocery data).

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth library | **Auth.js v5 (`next-auth@5`)** | Standard for Next.js, `@auth/pg-adapter` fits existing Postgres, native middleware |
| Sessions | **Database sessions** | Revocable, more secure for a food safety app |
| Password hashing | **bcryptjs** | Pure JS, works on Vercel without native compilation |
| Product catalog | **OpenFoodFacts API** | Free, no API key, German products, JSON search/autocomplete |
| Catalog caching | **Local `product_catalog` table** | Reduces API dependency, enables offline autocomplete |

---

## Data Model (new migration: `002_auth_and_favorites.sql`)

### New tables

**`users`** — Auth.js compatible
- `id` UUID PK, `name`, `email` (UNIQUE), `emailVerified`, `image`, `password_hash`, `created_at`, `updated_at`

**`accounts`** — OAuth accounts (Auth.js)
- `id` UUID PK, `userId` FK→users, `type`, `provider`, `providerAccountId`, tokens, UNIQUE(provider, providerAccountId)

**`sessions`** — Database sessions (Auth.js)
- `id` UUID PK, `sessionToken` UNIQUE, `userId` FK→users, `expires`

**`verification_tokens`** — Email verification (Auth.js)
- `identifier`, `token`, `expires`, UNIQUE(identifier, token)

**`favorite_products`** — Per-user saved products
- `id` UUID PK, `user_id` FK→users CASCADE, `name`, `manufacturer`, `barcode`, `category`, `image_url`, `created_at`, UNIQUE(user_id, name, manufacturer)

**`product_catalog`** — Cached OpenFoodFacts data
- `id` UUID PK, `barcode` UNIQUE, `name`, `brand`, `categories TEXT[]`, `image_url`, `country_tags TEXT[]`, `fetched_at`
- GIN indexes on `name` and `brand` with `pg_trgm` for fuzzy search

### Modified tables

**`receipts`** — Add `user_id UUID REFERENCES users(id) ON DELETE SET NULL` (nullable, backward-compatible)

---

## API Routes

### New

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/register` | Public | Email/password registration |
| GET/POST | `/api/auth/[...nextauth]` | Public | Auth.js handlers (login/logout/session) |
| GET | `/api/user/profile` | Protected | Get current user profile |
| PATCH | `/api/user/profile` | Protected | Update name/email |
| DELETE | `/api/user/profile` | Protected | Delete account + cascade |
| GET | `/api/favorites` | Protected | List user's favorite products |
| POST | `/api/favorites` | Protected | Add favorite product |
| DELETE | `/api/favorites/[id]` | Protected | Remove favorite product |
| GET | `/api/catalog/search?q=milch&limit=10` | Public | Product autocomplete |

### Modified

| Route | Change |
|-------|--------|
| `POST /api/products` | If session exists, scope to user |
| `POST /api/receipts` | If session exists, set `user_id` on receipt |

---

## UI Components

### New pages
- `/login` — Email/password form + OAuth buttons
- `/register` — Registration form with validation
- `/profile` — Edit name, email, delete account
- `/favorites` — Grid of saved products, "Check all for recalls" button, remove

### New components
- `AuthProvider` — Wraps app with `SessionProvider`
- `LoginForm` / `RegisterForm` — Auth forms
- `ProfileDropdown` — Navbar dropdown (profile, favorites, logout)
- `ProductSearchInput` — Debounced autocomplete dropdown from `/api/catalog/search`
- `FavoriteButton` — Heart toggle on product cards
- `FavoriteCard` — Product card in favorites grid

### Modified components
- `Navbar` — Login/Register links when anonymous, ProfileDropdown when authenticated
- `ManualEntry` — Replace plain text input with `ProductSearchInput`
- `Root Layout` — Wrap with `AuthProvider`

---

## Implementation Phases

### Phase 1: Auth Infrastructure
- Install `next-auth@beta`, `@auth/pg-adapter`, `bcryptjs`
- Create migration `002_auth_and_favorites.sql`
- Auth.js config (`src/lib/auth/config.ts`) with Credentials provider + pg adapter
- Registration endpoint (`/api/auth/register`)
- Session provider (`src/lib/auth/provider.tsx`)
- Middleware (`src/middleware.ts`) — protect `/profile`, `/favorites`

### Phase 2: Auth UI
- Login page + Register page (with i18n)
- Profile dropdown in Navbar
- Profile page (edit/delete)
- Navbar conditional rendering (anonymous vs authenticated)

### Phase 3: Product Catalog & Search
- OpenFoodFacts client (`src/lib/catalog/openfoodfacts.ts`)
- Local catalog cache (`product_catalog` table + CRUD)
- Catalog search API (`/api/catalog/search`) — local first, OpenFoodFacts fallback
- `ProductSearchInput` component with debounced autocomplete
- Integrate into `ManualEntry` (autocomplete replaces plain input)

### Phase 4: Favorite Products
- Favorites DB operations (`src/lib/db/favorites.ts`)
- Favorites API routes (GET, POST, DELETE)
- Favorites page with grid view
- `FavoriteButton` component
- "Check all for recalls" action from favorites

### Phase 5: Data Scoping & Polish
- Scope `POST /api/products` and `POST /api/receipts` to user
- I18n updates for all new strings
- Update RULES.md, DECISION_LOGS.md, ARCHITECTURE.md
- Tests for auth, catalog search, favorites CRUD

---

## File Structure (new files)

```
src/
├── lib/
│   ├── auth/
│   │   ├── config.ts
│   │   └── provider.tsx
│   ├── catalog/
│   │   ├── openfoodfacts.ts
│   │   └── sync.ts
│   └── db/
│       ├── favorites.ts
│       ├── catalog.ts
│       └── migrations/002_auth_and_favorites.sql
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts
│   │   │   └── register/route.ts
│   │   ├── catalog/search/route.ts
│   │   ├── favorites/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   └── user/profile/route.ts
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── profile/page.tsx
│   └── favorites/page.tsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProfileDropdown.tsx
│   ├── favorites/
│   │   ├── FavoriteButton.tsx
│   │   └── FavoriteCard.tsx
│   └── ProductSearchInput.tsx
└── middleware.ts
```

---

## Decisions (confirmed)

1. **OAuth providers**: Google only
2. **Email verification**: Required before login
3. **Product search scope**: German products only (`country_tags=en:germany`)
4. **Existing anonymous data**: Leave orphaned as-is
5. **Credentials**: Include setup instructions for `NEXTAUTH_SECRET` and Google OAuth in Vercel
