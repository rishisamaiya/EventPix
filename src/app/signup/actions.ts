"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { gateway } from "@/lib/gateway";
import crypto from "crypto";

// Admin client for secure user creation
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Server Action to request an OTP from the Gateway
 */
export async function requestSignupOTP(phone: string) {
  try {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const result = await gateway.requestOTP(cleanPhone);
    return result;
  } catch (error) {
    console.error("OTP Request Error:", error);
    return { success: false, error: "Failed to connect to Gateway" };
  }
}

/**
 * Server Action to verify OTP and Finalize Signup
 */
export async function finalizeSignup(formData: any) {
  try {
    const { name, email, phone, password, otp } = formData;
    
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    // 1. Verify OTP with Gateway
    const verifyResult = await gateway.verifyOTP(cleanPhone, otp);
    if (!verifyResult.success) return verifyResult;

    // 2. Create User via Admin API (Marks email as confirmed)
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Phone is verified, so we can trust the user
      user_metadata: { 
        full_name: name,
        phone_number: cleanPhone,
        phone_verified: true
      }
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return { success: false, error: "An account with this email already exists." };
      }
      throw authError;
    }

    // 3. AUTO-LOGIN
    // Generate a Magic Link token to establish the session
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: authUser.user.email!
    });

    if (linkError) throw linkError;

    // Verify on the server to set session cookies
    const supabase = await createServerClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: 'magiclink'
    });

    if (verifyError) throw verifyError;

    return { success: true, redirect: '/dashboard' };

  } catch (error: any) {
    console.error("Signup Finalization Error:", error);
    return { success: false, error: error.message || "Failed to create account" };
  }
}
