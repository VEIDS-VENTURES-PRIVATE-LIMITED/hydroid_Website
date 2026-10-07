import {createClient} from '@supabase/supabase-js';

function config(){
 const url=process.env.SUPABASE_URL;
 const key=process.env.SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)throw new Error('SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required.');
 return {url,key};
}

export function createPublicSupabaseClient(accessToken=''){
 const {url,key}=config();
 return createClient(url,key,{
  auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},
  global:{headers:accessToken?{Authorization:`Bearer ${accessToken}`}:{}}
 });
}

export function bearerToken(req){
 const match=/^Bearer\s+(.+)$/i.exec(req.headers.authorization||'');
 return match?.[1]||'';
}
