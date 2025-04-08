"use client"
import { logout } from "@/lib/actions/auth.action";
import { Button } from "antd";
import {  useRouter } from "next/navigation";
import React from "react";

const Logoutbutton = () => {
    const router = useRouter()
    const handleLogout = async () => {
        const result = await logout();
        if (result.success) {
          router.push("/login");
        }
      };
  return (
    <div>
      {" "}
      <Button onClick={() => handleLogout()}>Logout</Button>
    </div>
  );
};

export default Logoutbutton;
