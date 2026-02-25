import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

// 🔐 Login Token
export function generateAuthToken(userId: string, email: string, role: string) {
  return jwt.sign(
    { userId, email, role, type: 'auth' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// 🔐 Password Reset Token (Short lived)
export function generatePasswordResetToken(userId: string) {
  return jwt.sign(
    { userId, type: 'password_reset' },
    JWT_SECRET,
    { expiresIn: '10m' }
  );
}

// 🔎 Verify Token
export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}