"use server";

import { logout } from "@/lib/actions/auth.action";
import { signToken, verifyToken } from "./token";
import { cookies } from "next/headers";
import { refreshTokens } from "@/lib/actions/refresh.action";

export const fetchWithAuth = async (
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    cache?: RequestCache;
    next?: { tags: string[]; revalidate?: number };
  } = {}
): Promise<Response> => {
  const cookieStore = cookies();
  let signedAccessToken = cookieStore.get("access_token")?.value;
  let accessToken;
  let response;

  try {
    accessToken = verifyToken(signedAccessToken!);

    options = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };

    response = await fetch(`${process.env.NEXT_BACKEND_API_URL}${url}`, options);
  } catch (err) {
    console.log("Initial token verification failed:", err);
  }

  // If no response or failed response, try to refresh
  if (!response || !response.ok) {
    console.log("Refreshing token...");

    const refreshData = await refreshTokens(); // use server action

    if (refreshData.success) {
      // Get new access token
      const newSignedAccessToken = signToken(refreshData.accessToken);
      accessToken = verifyToken(newSignedAccessToken);

      // Update request options with refreshed token
      options = {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      };

      try {
        response = await fetch(
          `${process.env.NEXT_BACKEND_API_URL}${url}`,
          options
        );
      } catch (retryErr) {
        console.error("Retry fetch failed:", retryErr);
        return new Response(
          JSON.stringify({ success: false, message: "Retry request failed" }),
          { status: 500 }
        );
      }
    } else {
      await logout();
      return new Response(
        JSON.stringify({ success: false, message: "Unable to refresh token" }),
        { status: 401 }
      );
    }
  }

  return response;
};
