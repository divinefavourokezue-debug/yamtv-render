import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ajinaxtxgyiyaaqstegn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaW5heHR4Z3lpeWFhcXN0ZWduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNjg2OTIsImV4cCI6MjA5ODg0NDY5Mn0.MNOl246tA6kjcE7BHq1A1xH7kulQZGuOqJs1ExDdGBU';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.from('settings').upsert({ id: 'global', about_text: 'hello' }).select();
  console.log(data, error);
}
test();
