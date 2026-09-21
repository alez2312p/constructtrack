'use server';

import { cookies } from 'next/headers';
import { verifyAccessToken } from './tokens-edge';

export type Session = {
  user: {
    id: string;
    role: string;
    isDemo?: boolean;
    demoSessionId?: string;
  };
};

/**
 * Asserts that the request contains a valid access token.
 * Throws an error if the token is missing, invalid, or expired.
 * Use at the start of any Server Action that requires authentication.
 */
export async function assertSession(): Promise<Session> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    throw new Error('Unauthenticated: missing access token');
  }

  const payload = await verifyAccessToken(token);
  if (!payload) {
    throw new Error('Unauthenticated: invalid or expired access token');
  }

  const demoSessionId = payload.demoSessionId || cookieStore.get('demoSessionId')?.value;

  return {
    user: {
      id: payload.id,
      role: payload.role,
      isDemo: payload.isDemo,
      demoSessionId,
    },
  };
}