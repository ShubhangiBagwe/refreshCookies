
import { getUserDetails } from "@/lib/actions/user.action";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Logoutbutton from "../components/logoutbutton";

export default async function HomePage() {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;
  const userDetails = await getUserDetails()

  if (!refreshToken) {
    redirect("/login");
  } 

  return (
    <div>
      <h1>Welcome, {userDetails.username}</h1>
      <Logoutbutton/>
    </div>
  );
}