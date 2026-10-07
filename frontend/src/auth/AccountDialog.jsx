import React,{useEffect,useState} from 'react';
import {signIn,signOut,signUp,signInWithGoogle,notifyAuth} from '../api.js';
import {supabase} from '../lib/supabase.js';

function Field({label,value,onChange,type='text',autoComplete}){
 return <label className="account-field"><span>{label}</span><input type={type} value={value} autoComplete={autoComplete} required onChange={event=>onChange(event.target.value)}/></label>;
}

export default function AccountDialog({onClose}){
 const [mode,setMode]=useState('signin');
 const [name,setName]=useState('');
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [message,setMessage]=useState('');
 const [busy,setBusy]=useState(false);
 const [user,setUser]=useState(null);

 useEffect(()=>{
  supabase.auth.getUser().then(({data})=>setUser(data.user));
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{setUser(session?.user??null);notifyAuth()});
  return()=>subscription.unsubscribe();
 },[]);

 const submit=async event=>{
  event.preventDefault();setBusy(true);setMessage('');
  try{
   const data=mode==='signup'?await signUp(name,email,password):await signIn(email,password);
   if(data.session){
    setUser(data.user);
    notifyAuth();
    setMessage('You are signed in.');
   }else{
    setMessage(data.message||(mode==='signup'?'Check your email to confirm your account, then sign in.':'You are signed in.'));
   }
  }catch(error){setMessage(error.message)}finally{setBusy(false)}
 };
 const google=async()=>{setBusy(true);setMessage('');try{await signInWithGoogle()}catch(error){setMessage(error.message);setBusy(false)}};
 const logout=async()=>{try{await signOut();setUser(null);notifyAuth()}catch(error){setMessage(error.message)}};

 return <div className="account-backdrop" onClick={onClose}><section className="account-card" role="dialog" aria-modal="true" aria-label="Hydroid account" onClick={event=>event.stopPropagation()}><button className="account-close" onClick={onClose} aria-label="Close">×</button><span className="account-kicker">HYDROID ACCOUNT</span><h2>{user?'Your account':mode==='signup'?'Create your account':'Welcome back'}</h2>{user?<><p>{(user.user_metadata?.full_name||user.name)&&<strong>{user.user_metadata?.full_name||user.name}<br/></strong>}Signed in as {user.email}</p><button className="account-secondary" onClick={logout}>Sign out</button></>:<><form onSubmit={submit}>{mode==='signup'&&<Field label="Name" value={name} onChange={setName} autoComplete="name"/>}<Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email"/><Field label="Password" type="password" value={password} onChange={setPassword} autoComplete={mode==='signup'?'new-password':'current-password'}/>{mode==='signup'&&<small>Use at least 8 characters.</small>}<button className="account-primary" disabled={busy||!email||!password||(mode==='signup'&&!name.trim())}>{busy?'Please wait…':mode==='signup'?'Create account':'Sign in'}</button></form><div className="account-divider"><span>or</span></div><button className="account-google" onClick={google} disabled={busy}><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.4 2.9-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2.1 1-3.4 1a5.9 5.9 0 0 1-5.5-4.1H3.1v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.5 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9.1L6.5 14Z"/><path fill="#EA4335" d="M12 6c1.5 0 2.9.5 4 1.6l3-3A10 10 0 0 0 3.1 7.5l3.4 2.6A5.9 5.9 0 0 1 12 6Z"/></svg>Continue with Google</button><button className="account-mode" onClick={()=>{setMode(mode==='signup'?'signin':'signup');setMessage('')}}>{mode==='signup'?'Already have an account? Sign in':'New here? Create an account'}</button></>}{message&&<p className="account-message" role="status">{message}</p>}</section></div>;
}
