import {supabase} from './lib/supabase.js';

const apiBase=(import.meta.env.VITE_API_URL||'').replace(/\/$/,'');

async function accessToken(){
 const {data:{session}}=await supabase.auth.getSession();
 return session?.access_token||'';
}

export async function api(path,options={}){
 const token=await accessToken();
 const response=await fetch(`${apiBase}/api${path}`,{
  ...options,
  headers:{
   'Content-Type':'application/json',
   ...(token?{Authorization:`Bearer ${token}`}:{}),
   ...options.headers
  }
 });
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.error||'Request failed.');
 return data;
}

async function applySession(session){
 if(!session)return;
 const {error}=await supabase.auth.setSession({
  access_token:session.access_token,
  refresh_token:session.refresh_token
 });
 if(error)throw error;
}

export const getCurrentUser=async()=> (await api('/auth/me')).user;

export async function signUp(name,email,password){
 const data=await api('/auth/signup',{
  method:'POST',
  body:JSON.stringify({name:name.trim(),email:email.trim(),password})
 });
 await applySession(data.session);
 return data;
}

export async function signIn(email,password){
 const data=await api('/auth/login',{
  method:'POST',
  body:JSON.stringify({email:email.trim(),password})
 });
 await applySession(data.session);
 return data;
}

export async function signInWithGoogle(){
 const {error}=await supabase.auth.signInWithOAuth({
  provider:'google',
  options:{redirectTo:`${window.location.origin}/#home`}
 });
 if(error)throw error;
}

export async function signOut(){
 try{
  await api('/auth/logout',{method:'POST'});
 }catch(_){}
 const {error}=await supabase.auth.signOut();
 if(error)throw error;
}

export const notifyAuth=()=>window.dispatchEvent(new Event('hydroid-auth-changed'));
