import { cookies } from 'next/headers';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin';
const AUTH_COOKIE = 'ristorante_auth';

export function verifyCredentials(username: string, password: string): boolean {
  return username === ADMIN_USER && password === ADMIN_PASS;
}

export function isAuthenticated(): boolean {
  const cookieStore = cookies();
  return cookieStore.get(AUTH_COOKIE)?.value === 'authenticated';
}
