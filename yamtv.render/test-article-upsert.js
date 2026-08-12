import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ajinaxtxgyiyaaqstegn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaW5heHR4Z3lpeWFhcXN0ZWduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNjg2OTIsImV4cCI6MjA5ODg0NDY5Mn0.MNOl246tA6kjcE7BHq1A1xH7kulQZGuOqJs1ExDdGBU';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase
    .from('articles')
    .select('id')
    .eq('slug', 'global-translations')
    .single();
  
  if (error && error.code !== 'PGRST116') {
     console.error(error);
     return;
  }

  const payload = {
    title_fr: 'Traductions Globales',
    title_en: 'Global Translations',
    slug: 'global-translations',
    category: 'System',
    content_en: JSON.stringify({ hello: 'world' }),
    content_fr: '{}',
    excerpt_en: '',
    excerpt_fr: '',
    is_published: false,
    featured_image_url: ''
  };

  let res;
  if (data) {
     res = await supabase.from('articles').update(payload).eq('id', data.id);
  } else {
     res = await supabase.from('articles').insert([payload]);
  }
  console.log(res.data, res.error);
}
test();
