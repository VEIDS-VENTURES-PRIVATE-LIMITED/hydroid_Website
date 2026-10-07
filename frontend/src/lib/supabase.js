import {createClient} from '@supabase/supabase-js';

const url=import.meta.env.VITE_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if(!url||!key)throw new Error('Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to frontend/.env.local.');

export const supabase=createClient(url,key,{
 auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
});
