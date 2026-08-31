import { query, queryOne } from "./index";

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  password_hash: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  name?: string | null;
  email: string;
  password_hash?: string | null;
  image?: string | null;
}

export async function getUserById(id: string): Promise<User | null> {
  return queryOne<User>("SELECT * FROM users WHERE id = $1", [id]);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return queryOne<User>("SELECT * FROM users WHERE email = $1", [email]);
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const result = await queryOne<User>(
    `INSERT INTO users (name, email, password_hash, image)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [input.name ?? null, input.email, input.password_hash ?? null, input.image ?? null]
  );
  if (!result) throw new Error("Failed to create user");
  return result;
}

export async function updateUser(
  id: string,
  input: Partial<Pick<User, "name" | "email" | "image">>
): Promise<User> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (input.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(input.name);
  }
  if (input.email !== undefined) {
    fields.push(`email = $${paramIndex++}`);
    values.push(input.email);
  }
  if (input.image !== undefined) {
    fields.push(`image = $${paramIndex++}`);
    values.push(input.image);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await queryOne<User>(
    `UPDATE users SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  if (!result) throw new Error("Failed to update user");
  return result;
}

export async function deleteUser(id: string): Promise<void> {
  await query("DELETE FROM users WHERE id = $1", [id]);
}
