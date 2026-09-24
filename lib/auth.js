import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;
if (!SECRET || SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters');
const COOKIE_NAME = 'rbms_session';

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

// Reads and verifies the session cookie. Returns the decoded payload
// ({ role: 'admin' | 'restaurant', id, ... }) or null if absent/invalid.
export async function getSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET);
  } catch (e) {
    return null;
  }
}

// Call only from a Route Handler (not a plain Server Component).
export async function setSessionCookie(token) {
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearSessionCookie() {
  (await cookies()).set(COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 });
}
