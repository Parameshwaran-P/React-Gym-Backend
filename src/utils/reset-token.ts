import crypto from 'crypto';

// Generate raw token (sent to user)
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Hash token before saving in DB
export function hashResetToken(token: string): string {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}