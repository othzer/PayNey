import crypto from "crypto";

const DEVICE_TOKEN_BYTES = 32;

export function generateDeviceToken() {
  return crypto.randomBytes(DEVICE_TOKEN_BYTES).toString("base64url");
}

// A device token is high-entropy (32 random bytes) and not user-chosen, so a fast
// keyed HMAC is sufficient — no need for bcrypt's deliberately slow cost factor.
export function hashDeviceToken(rawToken) {
  const secret = process.env.DEVICE_TOKEN_SECRET;
  if (!secret) {
    throw new Error("DEVICE_TOKEN_SECRET is not configured");
  }
  return crypto.createHmac("sha256", secret).update(rawToken).digest("hex");
}
