import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://ajinaxtxgyiyaaqstegn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaW5heHR4Z3lpeWFhcXN0ZWduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNjg2OTIsImV4cCI6MjA5ODg0NDY5Mn0.MNOl246tA6kjcE7BHq1A1xH7kulQZGuOqJs1ExDdGBU');
async function test() {
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'editor@yamtv.com',
    password: 'password'
  });
  if (authErr) {
    console.log("Auth Error:", authErr);
    // try to login with a created user if possible? I can't guess the password.
    return;
  }
}
test();
