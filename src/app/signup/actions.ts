"use server";

import { gateway } from "@/lib/gateway";

/**
 * Server Action to request an OTP from the Gateway
 * This keeps our BIZSUITE_GATEWAY_KEY safe on the server.
 */
export async function requestSignupOTP(phone: string) {
  try {
    const result = await gateway.requestOTP(phone);
    return result;
  } catch (error) {
    console.error("OTP Request Error:", error);
    return { success: false, error: "Failed to connect to Gateway" };
  }
}

/**
 * Server Action to verify an OTP
 */
export async function verifySignupOTP(phone: string, code: string) {
  try {
    const result = await gateway.verifyOTP(phone, code);
    return result;
  } catch (error) {
    console.error("OTP Verify Error:", error);
    return { success: false, error: "Verification failed" };
  }
}
