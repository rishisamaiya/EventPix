import { createClient } from '@supabase/supabase-js';

// Configuration (Pulled from .env.local)
const SUPABASE_URL = 'https://adjmqigspkwmjdztibel.supabase.co';
const SERVICE_ROLE_KEY = 'YOUR_SERVICE_ROLE_KEY_HERE'; // I will replace this in the command

async function updateAdminPhone() {
  const email = 'rishi.samaiya@gmail.com';
  const phone = '918983121201'; 

  console.log(`🔍 Finding user: ${email}...`);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // 1. Get user by email
  const { data: users, error: fetchError } = await supabase.auth.admin.listUsers();
  
  if (fetchError) {
    console.error('❌ Error fetching users:', fetchError);
    return;
  }

  const user = users.users.find(u => u.email === email);

  if (!user) {
    console.error('❌ Admin user not found!');
    return;
  }

  console.log(`✅ Found user: ${user.id}`);

  // 2. Update metadata
  const { data, error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { 
      user_metadata: { 
        ...user.user_metadata, 
        phone_number: phone,
        phone_verified: true 
      } 
    }
  );

  if (updateError) {
    console.error('❌ Error updating metadata:', updateError);
  } else {
    console.log(`🎉 SUCCESS! Admin phone updated to ${phone}. You can now login with WhatsApp.`);
  }
}

updateAdminPhone();
