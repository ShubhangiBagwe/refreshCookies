// app/lib/actions/refreshTokens.ts
'use server';

import { cookies } from 'next/headers';
import { logout } from '@/lib/actions/auth.action';
import { signToken, verifyToken } from '@/utils/token';

export async function refreshTokens() {
  const cookieStore = cookies();
  const signedRefreshToken = cookieStore.get('refresh_token')?.value;

  if (!signedRefreshToken) {
    return {
      success: false,
      message: 'No refresh token found',
      status: 401,
    };
  }

  try {
    // Verify signed refresh token
    const refreshToken = verifyToken(signedRefreshToken);

    // Call backend refresh endpoint
    const response = await fetch(`${process.env.NEXT_BACKEND_API_URL}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (response.status === 200) {
      // Set cookies on server action response
      cookieStore.set('access_token', signToken(data.accessToken), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60, // 1 hour
        path: '/',
      });
      return {
        success: true,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        message: 'Token refreshed successfully',
      };
    } else {
      await logout();
      return {
        success: false,
        message: 'Failed to refresh token',
        status: 401,
      };
    }
  } catch (error) {
    console.error('Refresh error:', error);
    await logout();
    return {
      success: false,
      message: 'Invalid refresh token',
      status: 401,
    };
  }
}
