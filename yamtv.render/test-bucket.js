import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://ajinaxtxgyiyaaqstegn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaW5heHR4Z3lpeWFhcXN0ZWduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNjg2OTIsImV4cCI6MjA5ODg0NDY5Mn0.MNOl246tA6kjcE7BHq1A1xH7kulQZGuOqJs1ExDdGBU');
async function test() {
  const { data, error } = await supabase.storage.listBuckets();
  console.log("Buckets:", data?.map(b => b.name), error);
}
test();
