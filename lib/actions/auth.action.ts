"use server";
import { LoginUserResponse } from "@/types/auth";
import { signToken } from "@/utils/token";
import { cookies } from "next/headers";

export async function login(
  username: string,
  password: string,
  expiresInMins: number
): Promise<LoginUserResponse> {
  try {
    const cookieStore = await cookies();
    const response = await fetch(`${process.env.NEXT_BACKEND_API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, expiresInMins }),
      credentials: "include",
    });

    const data = await response.json();
    console.log(data, "login response");

    if (response.status === 200) {
      const accessToken = signToken(data.accessToken); // Sign the original access token
      const refreshToken = signToken(data.refreshToken); // Sign the original refresh token
      console.log("accessToken", accessToken);
      console.log("refreshToken", refreshToken);
      cookieStore.set("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60, // 1 minute
        path: "/",
      });
      cookieStore.set("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });

      console.log("Cookies set - access_token:", accessToken);
      console.log("Cookies set - refresh_token:", refreshToken);
      console.log("All cookies after login:", cookieStore.toString());

      return {
        success: true,
        message: "Login successful",
        accessToken,
        refreshToken,
      };
    } else {
      await logout();
      return { success: false, message: "Login failed" };
    }
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "An error occurred while logging in" };
  }
}

export async function logout(): Promise<{ success: boolean; message: string }> {
  const cookieStore = cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  return { success: true, message: "Logged out successfully" };
}
