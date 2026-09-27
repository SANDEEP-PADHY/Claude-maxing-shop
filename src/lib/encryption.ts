import crypto from "crypto";

const SECRET = process.env.AUTH_SECRET || "claude-storefront-super-secure-production-secret-token-32-chars-min";
const ENCRYPTION_KEY = crypto.createHash("sha256").update(SECRET).digest(); // 32 bytes for aes-256-gcm
const ALGORITHM = "aes-256-gcm";

/**
 * Encrypts an access key for secure storage at rest.
 * Output format: iv_hex:auth_tag_hex:ciphertext_hex
 */
export function encryptAccessKey(plaintext: string): string {
  if (!plaintext) return "";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an encrypted access key from storage.
 */
export function decryptAccessKey(encryptedString: string): string {
  if (!encryptedString) return "";
  // Check if it matches iv:tag:content format
  const parts = encryptedString.split(":");
  if (parts.length !== 3) {
    // If not encrypted in this format, return as is (fallback during migration/dev)
    return encryptedString;
  }

  try {
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Failed to decrypt access key:", error);
    return "[DECRYPTION_ERROR]";
  }
}

/**
 * Generates a masked representation of a key (e.g., sk-••••••••••••••••94f2)
 */
export function maskAccessKey(key: string): string {
  if (!key) return "••••••••••••••••••••";
  if (key.length <= 8) return "••••••••";
  const start = key.slice(0, 6);
  const end = key.slice(-4);
  return `${start}••••••••••••••••${end}`;
}
