

// import { logout } from "@/lib/actions/auth.action";
// import { cookies } from "next/headers";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//     const cookieStore = await cookies();
//     const refreshToken = cookieStore.get("refresh_token")?.value;
//     console.log("Refresh token:", refreshToken);


//   if (!refreshToken) {
//     return NextResponse.json(
//       {
//         success: false,
//         message: "No refresh token found. Please log in again.",
//       },
//       { status: 401 }
//     );
//   }

//   try {
//     const response = await fetch(
//       `${process.env.NEXT_BACKEND_API_URL}/refresh`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ refreshToken }),
//       }
//     );

//     const data = await response.json();
//     console.log(data, "datadata");
//     if (response.status === 200) {
//       const newAccessToken = data.accessToken;
//       const newRefreshToken = data.refreshToken;
//        cookieStore.set("access_token", newAccessToken, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         maxAge: 60,
//         path: "/",
//       });
//       cookieStore.set("refresh_token", newRefreshToken, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         maxAge: 7 * 24 * 60 * 60,
//         path: "/",
//       });

//       console.log("Cookies after set - access_token:", newAccessToken);
//       console.log("Cookies after set - refresh_token:", newRefreshToken);
//       console.log("All cookies after set:", cookieStore.toString());
//       return NextResponse.json({
//         success: true,
//         accessToken: data.accessToken,
//         refreshToken: data.refreshToken,
//         message: "Token refreshed successfully done",
//       });
//     } else {
//       await logout();
//       return NextResponse.json(
//         { success: false, message: data.message || "Failed to refresh token" },
//         { status: 401 }
//       );
//     }
//   } catch (error) {
//     console.error("Refresh token error:", error);
//     await logout();
//     return NextResponse.json(
//       {
//         success: false,
//         message: "An error occurred while refreshing the token",
//       },
//       { status: 500 }
//     );
//   }
// }




import { logout } from "@/lib/actions/auth.action";
import { signToken, verifyToken } from "@/utils/token";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const signedRefreshToken = cookieStore.get("refresh_token")?.value;

  if (!signedRefreshToken) {
    return NextResponse.json(
      { success: false, message: "No refresh token found" },
      { status: 401 }
    );
  }

  try {
    // Verify the signed refresh token
    const refreshToken = verifyToken(signedRefreshToken);

    // Call your backend refresh endpoint
    const response = await fetch(`${process.env.NEXT_BACKEND_API_URL}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (response.status === 200) {
      // Create response with new cookies
      const res = NextResponse.json({
        success: true,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        message: "Token refreshed successfully",
      });

      // Set cookies on the response
      res.cookies.set("access_token", signToken(data.accessToken, "1m"), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60, // 1 minute
        path: "/",
      });

      res.cookies.set("refresh_token", signToken(data.refreshToken, "7d"), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });

      return res;
    } else {
      await logout();
      return NextResponse.json(
        { success: false, message: "Failed to refresh token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Refresh error:", error);
    await logout();
    return NextResponse.json(
      { success: false, message: "Invalid refresh token" },
      { status: 401 }
    );
  }
}