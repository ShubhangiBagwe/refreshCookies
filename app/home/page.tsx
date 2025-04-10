"use client"
import { getUserDetails } from "@/lib/actions/user.action";
import Logoutbutton from "../components/logoutbutton";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [userDetails,setUserDetails] = useState()
  const [loading,setLoading] = useState(true)

  console.log(userDetails,"userDetailsuserDetailsuserDetails")

  const userData = async()=>{
    const userRes = await getUserDetails()
    setUserDetails(userRes)
    setLoading(false)
  }

  useEffect(()=>{
    userData()
  },[])

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {JSON.stringify(userDetails)}</h1>
      <Logoutbutton/>
    </div>
  );
}