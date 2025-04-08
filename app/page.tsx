"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const Page = async () => {
  const cookieStore = cookies();
  const refreshToken =  cookieStore.get("refresh_token")?.value

  if (!refreshToken) {
    redirect("/login");
  } else {
    redirect("/home");
  }
};

export default Page;