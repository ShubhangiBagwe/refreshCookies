import { logout } from "@/lib/actions/auth.action";
import { signToken, verifyToken } from "./token";
import { cookies } from "next/headers";

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
  console.log("Signed access token:", signedAccessToken);

  let accessToken;
  let response;

  // Step 1: Try with existing access token
  try {
    accessToken = verifyToken(signedAccessToken!);
    console.log("Decoded access token:", accessToken);

    options = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };

    response = await fetch(
      `${process.env.NEXT_BACKEND_API_URL}${url}`,
      options
    );
    console.log("Initial fetch status:", response.status);
  } catch (error) {
    console.error("Access token verification failed:", error);
  }

  // Step 2: Refresh if needed
  if (!response?.ok) {
    console.log("401 to refreshh tokennn", response);
    console.log("response.status", response?.status);
    const signedRefreshToken = cookieStore.get("refresh_token")?.value;
    console.log("signedRefreshToken", signedRefreshToken);
    if (!signedRefreshToken) {
      await logout();
      return new Response(
        JSON.stringify({ success: false, message: "No refresh token" }),
        { status: 401 }
      );
    }

    console.log(
      "Before refresh - access_token:",
      cookieStore.get("access_token")?.value
    );
    console.log(
      "Before refresh - refresh_token:",
      cookieStore.get("refresh_token")?.value
    );
    const refreshResponse = await fetch(
      `${process.env.NEXT_API_BASE_URL}/api/refresh`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieStore.toString(),
        },
      }
    );
    console.log("Refresh response status:", refreshResponse.status);
    console.log(
      "Refresh response cookies:",
      refreshResponse.headers.get("Set-Cookie")
    );
    const refreshData = await refreshResponse.json();
    console.log("Refresh data:", refreshData);
    console.log(
      "After refresh - access_token:",
      cookieStore.get("access_token")?.value
    );

    if (refreshData.success) {
      const newSignedAccessToken = signToken(refreshData.accessToken, 60);
      accessToken = verifyToken(newSignedAccessToken); // Decoded token
      console.log("New signed access token:", newSignedAccessToken);
      console.log("New decoded access token:", accessToken);

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
        console.log("Retry fetch status:", response.status);
      } catch (error) {
        console.error("Retry fetch failed:", error);
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
