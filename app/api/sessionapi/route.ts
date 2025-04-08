import { cookies } from "next/headers";

export async function GET(){
    const cook = cookies()
    console.log(cook,"cokkkk")
    const refreshToken = cook.get("refresh_token")?.value;
    console.log("Refresh token:", refreshToken);
}