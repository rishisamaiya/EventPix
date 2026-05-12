"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateTicket(
  ticketId: string,
  status: string,
  reply: string | null
) {
  const admin = createAdminClient();

  const { error } = await admin
    .from("support_tickets")
    .update({
      status,
      admin_reply: reply,
      replied_at: reply ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ticketId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/admin/tickets");
  return { success: true };
}
