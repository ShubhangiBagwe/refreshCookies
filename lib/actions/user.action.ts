"use server";

import { fetchWithAuth } from "@/utils/fetchInstance";


export async function getUserDetails() {
  try {
    const response = await fetchWithAuth("/me", { method: "GET" });
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      return {
        success: false,
        message: data.message,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "An error occurred while fetching user data",
    };
  }
}