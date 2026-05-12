"use server";

import { createClient } from "@supabase/supabase-js";
import { gateway } from "@/lib/gateway";

// Admin client for user lookup and link generation
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Request a Login OTP via WhatsApp
 */
export async function requestLoginOTP(phone: string) {
  try {
    // 1. Clean phone
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    // 2. Check if user exists with this phone number
    // Note: We search in raw_user_meta_data as that's where we saved it during signup
    const { data: users, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (searchError) throw searchError;

    const user = users.users.find(u => u.user_metadata?.phone_number === cleanPhone);

    if (!user) {
      return { success: false, error: "No account found with this phone number." };
    }

    // 3. Trigger OTP via Gateway
    const result = await gateway.requestOTP(cleanPhone);
    return result;
  } catch (error: any) {
    console.error("Login OTP Request Error:", error);
    return { success: false, error: error.message || "Failed to send OTP" };
  }
}

/**
 * Verify Login OTP and Generate Session
 */
export async function verifyLoginAndGetLink(phone: string, code: string) {
  try {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    // 1. Verify OTP with Gateway
    const verifyResult = await gateway.verifyOTP(cleanPhone, code);
    if (!verifyResult.success) return verifyResult;

    // 2. OTP is valid! Now find the user again
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const user = users.users.find(u => u.user_metadata?.phone_number === cleanPhone);

    if (!user || !user.email) {
      return { success: false, error: "User session could not be created." };
    }

    // 3. Generate a Magic Link for this user
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email,
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard` }
    });

    if (error) throw error;

    return { success: true, hashedToken: data.hashed_token, loginUrl: data.properties.action_link };

  } catch (error: any) {
    console.error("Login Verification Error:", error);
    return { success: false, error: "Verification failed" };
  }
}
