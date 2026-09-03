/**
 * Client-side password hashing using SHA-256.
 *
 * This provides an extra security layer by ensuring the raw password
 * never leaves the browser. The SHA-256 hash is sent to the server,
 * where it's bcrypt-hashed again for storage.
 *
 * Flow:
 * 1. User enters password in browser
 * 2. Client hashes with SHA-256 → sends hash to server
 * 3. Server bcrypt-hashes the SHA-256 hash for storage
 * 4. On login: client SHA-256 hashes → server bcrypt-compares with stored hash
 */

/**
 * Hash a password using SHA-256 in the browser.
 * Returns a hex-encoded hash string.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
