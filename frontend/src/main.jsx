import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Bag from './Bag.jsx';
import Shop, { podsDefault, shopItems } from './Shop.jsx';
import './style.css';

const waterQualityUrl=(import.meta.env.VITE_WATER_QUALITY_URL||'').trim();
const AccountDialog=React.lazy(()=>import('./auth/AccountDialog.jsx'));

function VideoDemo({videoUrl='/assets/website-demo.mp4'}){
 const [playing,setPlaying]=useState(false);
 const videoRef=useRef(null);
 const play=async()=>{try{await videoRef.current?.play();setPlaying(true)}catch{setPlaying(false)}};
 return <section className="video-demo" id="video-demo" aria-label="Website design reference video">
 <div className={'demo-player'+(playing?' is-playing':'')}><video ref={videoRef} controls={playing} playsInline preload="none" poster="/assets/website-demo-poster.jpg" aria-label="Website design reference video" onEnded={()=>setPlaying(false)}><source src={videoUrl} type={videoUrl.toLowerCase().includes('.webm')?'video/webm':'video/mp4'} />Your browser does not support video playback.</video>{!playing&&<button className="demo-play" onClick={play} aria-label="Play website design reference video"><span aria-hidden="true">▶</span></button>}</div>
 </section>
}

function Hero({ paused, setPaused, heroImage, onJoin }) {
 const scene = useRef(null);
 useEffect(() => {
  const element = scene.current;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  const update = () => {
   frame = 0;
   if (paused) return;
   const box = element.getBoundingClientRect();
   const travel = Math.max(1, element.offsetHeight - element.querySelector('.hero').offsetHeight);
   const progress = preference.matches ? 0 : Math.max(0, Math.min(1, -box.top / travel));
   element.style.setProperty('--hero-scale', String(1 + progress * (innerWidth <= 760 ? .28 : .48)));
   element.style.setProperty('--hero-turn', `${-5 + progress * 10}deg`);
   element.style.setProperty('--hero-rise', `${progress * -10}px`);
   element.style.setProperty('--hero-word-offset', `${progress * -35}px`);
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  update();
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  preference.addEventListener('change', schedule);
  return () => { cancelAnimationFrame(frame); removeEventListener('scroll', schedule); removeEventListener('resize', schedule); preference.removeEventListener('change', schedule); };
 }, [paused]);
 return <div className="hero-scroll" ref={scene}><section className="hero hero-lifestyle" id="home">
 <div className="hero-top"><span>HYDROID / SMART HYDRATION</span><span>A little smarter. Every sip.</span></div>
 <div className="hero-word" aria-hidden="true">Hydroid</div><div className="hero-aura"></div>
 <div className="hero-person-scene"><img className="hero-person" src={heroImage} alt="Hydroid hero artwork" width="848" height="1264" fetchPriority="high" decoding="async" /></div>
 <div className="hero-copy"><h1>Hydration.<br/>A little smarter.</h1><button className="pill light" onClick={onJoin}>Join The Revolution <span>↗</span></button></div>
 <div className="hero-note"><span className="line"></span>YOUR EVERYDAY COMPANION<br/>BY VEIDS VENTURES</div>
 <button className="motion-toggle" aria-label={paused ? "Play animations" : "Pause animations"} onClick={() => setPaused(!paused)}>{paused ? "▷" : "Ⅱ"}</button>
 <a className="scroll-cue" href="#intro" aria-label="Scroll to introduction">↓</a></section></div>;
}

function JoinForm({onClose}){
 const [form,setForm]=useState({name:'',contactNumber:'',email:'',city:'',company:''});
 const [status,setStatus]=useState({type:'',message:''});
 const [submitting,setSubmitting]=useState(false);
 const [firstName,setFirstName]=useState('');
 const modal=useRef(null);
 const onCloseRef=useRef(onClose);
 useEffect(()=>{onCloseRef.current=onClose},[onClose]);
 useEffect(()=>{
  const before=document.body.style.overflow;
  document.body.style.overflow='hidden';
  modal.current?.querySelector('input')?.focus();
  const closeOnEscape=event=>{if(event.key==='Escape')onCloseRef.current()};
  addEventListener('keydown',closeOnEscape);
  return()=>{document.body.style.overflow=before;removeEventListener('keydown',closeOnEscape)};
 },[]);
 const update=event=>setForm(current=>({...current,[event.target.name]:event.target.value}));
 const submit=async event=>{
  event.preventDefault();setSubmitting(true);setStatus({type:'',message:''});
  try{
   const apiBase=(import.meta.env.VITE_API_URL||'').replace(/\/$/,'');
   const response=await fetch(`${apiBase}/api/inquiries`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(data.error||'We could not submit your details. Please try again.');
   setFirstName(form.name.split(' ')[0]||'Friend');
   setStatus({type:'success',message:'Thank you!'});
   setForm({name:'',contactNumber:'',email:'',city:'',company:''});
  }catch(error){setStatus({type:'error',message:error.message})}
  finally{setSubmitting(false)}
 };
 return <div className="join-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}><section ref={modal} className="join-modal" role="dialog" aria-modal="true" aria-labelledby="join-title">
  <button className="join-close" onClick={onClose} aria-label="Close form">×</button>
  <div className="join-heading"><span>HYDROID / EARLY ACCESS</span><h2 id="join-title">Join the<br/>revolution.</h2><p>Be among the first to experience a smarter everyday hydration ritual.</p></div>
  {status.type==='success'?(
   <div className="join-success-view">
    <div className="join-success-badge">✨</div>
    <span className="account-kicker">APPLICATION CONFIRMED</span>
    <h2>Thank You, {firstName}! 🎉</h2>
    <p className="join-success-lead">You're officially on the VIP early-access list for <strong>Hydroid</strong>.</p>
    <div className="join-surprise-card">
     <span className="join-surprise-icon">🎁</span>
     <div>
      <strong>Surprise Awaits! We'll Connect Soon.</strong>
      <p>Our team will reach out to you very soon on your email & contact number with exclusive early access perks & launch gifts!</p>
     </div>
    </div>
    <button className="pill" onClick={onClose} style={{marginTop:'24px',width:'100%',justifyContent:'center'}}>
     Explore Hydroid <span>↗</span>
    </button>
   </div>
  ):(
   <form onSubmit={submit} className="join-form">
    <label>Full name <em>*</em><input autoComplete="name" name="name" value={form.name} onChange={update} placeholder="Enter your full name" minLength="2" maxLength="80" required/></label>
    <label>Contact number <input autoComplete="tel" inputMode="tel" name="contactNumber" value={form.contactNumber} onChange={update} placeholder="Your phone number" maxLength="24"/></label>
    <label>Email address <em>*</em><input autoComplete="email" type="email" name="email" value={form.email} onChange={update} placeholder="you@example.com" maxLength="254" required/></label>
    <label>City <em>*</em><input autoComplete="address-level2" name="city" value={form.city} onChange={update} placeholder="Where do you live?" minLength="2" maxLength="80" required/></label>
    <label className="join-honeypot" aria-hidden="true">Company<input tabIndex="-1" autoComplete="off" name="company" value={form.company} onChange={update}/></label>
    <button className="join-submit" type="submit" disabled={submitting}>{submitting?'Sending…':'Join The Revolution'} <span>↗</span></button>
    {status.message&&<p className={`join-status ${status.type}`} role="status">{status.message}</p>}
    <small>By submitting, you agree to receive Hydroid launch updates from Veids Ventures.</small>
   </form>
  )}
 </section></div>;
}

function ScrollText({text}){
 const ref=useRef(null);const [progress,setProgress]=useState(0);const words=text.split(' ');
 useEffect(()=>{const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let frame;
 const update=()=>{const top=ref.current.getBoundingClientRect().top;setProgress(reduced?1:Math.max(0,Math.min(1,(innerHeight*.88-top)/(innerHeight*.75))))};
 const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update)};addEventListener('scroll',schedule,{passive:true});update();return()=>{removeEventListener('scroll',schedule);cancelAnimationFrame(frame)}},[]);
 return <p ref={ref} className="reading">{words.map((word,i)=><React.Fragment key={i}><span className={i/words.length<progress?'read':''}>{word}</span>{' '}</React.Fragment>)}</p>
}
function Intro({eyebrow,text}) { return (<section id="intro" className="intro"><span className="eyebrow reveal">{eyebrow}</span><ScrollText text={text} /><div className="intro-bottom"><span>Designed around your day.</span><span>01 / DISCOVER</span></div></section>); }

const bottleFeatures=[
 {icon:'uv',title:'Medical-grade UV-C',detail:'275 nm purification'},
 {icon:'ph',title:'pH Management',detail:'Balances alkalinity & water pH'},
 {icon:'mineral',title:'Mineral Balance',detail:'Infuses essential minerals'},
 {icon:'tracking',title:'Smart Tracking',detail:'Monitors daily water intake'},
 {icon:'battery',title:'800 mAh battery',detail:'Rechargeable with USB-C'},
 {icon:'temperature',title:'18h cold · 12h hot',detail:'Triple-wall vacuum insulation'}
];
const products=[
 {name:'Hydroid Smart Hydration Bottle',label:'INTRODUCING HYDROID',image:'/assets/hydroid.webp',alt:'Midnight blue Hydroid smart hydration bottle',price:'₹1,999',finish:'Midnight blue',description:'A fresh perspective on hydration. A distinctive blue finish, an easy-carry handle, and an illuminated detail that makes Hydroid unmistakable.'},
 {name:'Hydroid Midday Glass',label:'MEET MIDDAY GLASS',image:'/assets/hydroid-midday-glass.webp',alt:'Clear Hydroid Midday Glass bottle with black handle and illuminated base',price:'₹2,499',finish:'Clear glass',description:'A clear take on your everyday companion, with an easy-carry handle and Hydroid’s signature illuminated detail.'}
];
const featureIconPaths={
 uv:<><circle cx="24" cy="25" r="9"/><path d="M24 5v6M24 39v5M4 25h6M38 25h6M10 11l4 4M34 35l4 4M38 11l-4 4M14 35l-4 4"/></>,
 ph:<><path d="M24 6c-6 8-12 15-12 22a12 12 0 0 0 24 0C36 21 30 14 24 6Z"/><path d="M17 26h14M24 20v11"/></>,
 mineral:<><path d="M24 6 38 16v16L24 42 10 32V16L24 6Z"/><path d="M24 6v36M10 16l28 16M38 16 10 32"/></>,
 tracking:<><path d="M6 38l9-13 8 7 12-19 7 9"/><circle cx="35" cy="13" r="4"/><path d="M6 42h36"/></>,
 battery:<><rect x="9" y="10" width="28" height="30" rx="4"/><path d="M18 6h10M37 19h3v12h-3M16 33h14M16 27h14M16 21h14"/></>,
 temperature:<><path d="M8 13h16M16 5v16M10 7l12 12M22 7 10 19"/><circle cx="34" cy="32" r="7"/><path d="M34 20v3M34 41v3M22 32h3M43 32h3M26 24l2 2M40 38l2 2M42 24l-2 2M28 38l-2 2"/></>,
 glass:<><path d="M14 6h20l-2 34H16L14 6ZM14 16h20M19 23c3-3 7 3 10 0"/></>,
 handle:<><path d="M13 17V11a11 11 0 0 1 22 0v6M11 17h26v25H11V17Z"/></>,
 light:<><circle cx="24" cy="24" r="10"/><circle cx="24" cy="24" r="17"/><path d="M24 2v3M24 43v3M2 24h3M43 24h3"/></>
};
function FeatureIcon({type}){return <span className="feature-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{featureIconPaths[type]??featureIconPaths.uv}</svg></span>}

function Product({items=products,features=bottleFeatures,activeProduct,setActiveProduct,onJoin,autoAdvance}) {
 const product=items[activeProduct]??items[0];
 useEffect(()=>{
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  if(!autoAdvance||preference.matches)return;
  const timer=setInterval(()=>{if(document.visibilityState==='visible')setActiveProduct(current=>(current+1)%items.length)},3600);
  return()=>clearInterval(timer);
 },[autoAdvance,setActiveProduct,items.length]);
 return <section id="product" className="product-section" aria-label="Hydroid bottles">
  <div className="product-card reveal"><span className="product-label">{product.label}</span><button className="product-image-button" onClick={()=>{location.hash=`#shop/item/bottle-${activeProduct}`}} aria-label={'View '+product.name+' details'}>{items.map((item,index)=><img key={index} className={'product-bottle'+(index===activeProduct?' is-active':'')} src={item.image} alt={index===activeProduct?item.alt:''} aria-hidden={index!==activeProduct} loading="eager" fetchPriority={index===activeProduct?'high':'auto'} />)}</button><div className="product-card-copy" aria-live="polite"><h3>{product.name}</h3><p className="price">{product.price}<span className="purchase-tag"><span className="pulse-dot"></span>Purchase Coming Soon</span></p><p>By Veids Ventures</p><div className="color-row"><span className={'swatch'+(activeProduct===1?' glass-swatch':'')} aria-hidden="true"/><span>{product.finish}</span></div></div><div className="product-switcher" aria-label="Choose a Hydroid bottle">{items.map((item,index)=><button key={index} className={index===activeProduct?'is-active':''} onClick={()=>setActiveProduct(index)} aria-label={'Show '+item.name} aria-pressed={index===activeProduct}/>)}</div><button className="text-button" onClick={()=>{location.hash=`#shop/item/bottle-${activeProduct}`}}>View product details <span>↗</span></button></div>
  <div className="product-info reveal"><div><div className="section-pill-tag"><span className="pulse-dot"></span> Purchase Coming Soon</div><span className="eyebrow">MEET YOUR NEW EVERYDAY</span><h2>Hydroid.</h2><p>A fresh perspective on hydration. A distinctive blue finish, an easy-carry handle, and an illuminated detail that makes Hydroid unmistakable.</p><button className="pill" onClick={onJoin}>Join The Revolution <span>↗</span></button></div><div className="feature-grid">{features.map(feature=><article key={feature.title}><FeatureIcon type={feature.icon}/><h3>{feature.title}</h3><p>{feature.detail}</p></article>)}</div></div>
 </section>;
}

function Difference({whyBottleImage,onDiscover}) { return (<section className="difference" id="difference"><div className="section-heading reveal"><div className="section-pill-tag" style={{margin:'0 auto 16px',display:'inline-flex'}}><span className="pulse-dot"></span> Purchase Coming Soon</div><span className="eyebrow">A FRESH PERSPECTIVE</span><h2>Why choose<br/>Hydroid?</h2><p>A more considered everyday companion.</p></div><div className="compare-grid"><article className="compare-card side reveal"><span className="compare-number">01</span><h3>Make it a habit.</h3><p>Keep your bottle within reach. Make a little space for hydration in the rhythm of your day.</p><span className="compare-footer">AT YOUR DESK</span></article><article className="compare-card best reveal"><span className="best-tag">MEET HYDROID</span><img src={whyBottleImage} alt="Hydroid smart bottle" loading="eager" fetchPriority="high" decoding="async" /><h3>Your bottle. Your rhythm.</h3><ul><li>Distinctive midnight blue finish</li><li>Integrated carry handle</li><li>Signature illuminated detail</li></ul><span className="coming-soon-pill">✦ Purchase Coming Soon</span><button onClick={onDiscover} className="pill">Discover Hydroid <span>↗</span></button></article><article className="compare-card side reveal"><span className="compare-number">02</span><h3>Take it with you.</h3><p>A day out, your commute, the next adventure. Keep your everyday companion close.</p><span className="compare-footer">ON THE MOVE</span></article></div><div className="app-feature reveal"><div className="app-feature-copy"><span className="eyebrow">HYDROID APP PREVIEW</span><h3>Your hydration,<br/>at a glance.</h3><p>See your daily intake, stay close to your goal, and make every sip part of your routine.</p><div className="app-feature-tags"><span>Daily progress</span><span>Drink reminders</span><span>Activity insights</span></div></div><div className="app-feature-visual"><img src="/assets/hydroid-app-preview.webp" alt="Hydroid app preview showing daily water intake, goal progress, a drink reminder, and activity insights" loading="eager" decoding="async" /></div></div></section>); }

const communityNotes=[
 {title:'Your stories will live here.',body:'Real Hydroid customer experiences will appear here after launch.',label:'CUSTOMER STORIES · COMING SOON'},
 {title:'Everyday moments, shared by you.',body:'We look forward to hearing how Hydroid fits into your routine.',label:'THE HYDROID COMMUNITY · COMING SOON'},
 {title:'A new chapter starts with a sip.',body:'This space is reserved for verified experiences from Hydroid owners.',label:'VERIFIED REVIEWS · COMING SOON'}
];
function Testimonials(){
 const [active,setActive]=useState(0);const note=communityNotes[active];
 const step=(delta)=>setActive(current=>(current+delta+communityNotes.length)%communityNotes.length);
 return <section className="testimonials" id="testimonials" aria-labelledby="testimonial-title">
  <div className="testimonial-header"><div><span className="eyebrow">THE HYDROID COMMUNITY</span><h2 id="testimonial-title">Testimonials</h2></div><div className="testimonial-controls"><button onClick={()=>step(-1)} aria-label="Previous community note">‹</button><button onClick={()=>step(1)} aria-label="Next community note">›</button></div></div>
  <div className="testimonial-stage"><div className="testimonial-circle circle-one" aria-hidden="true"/><div className="testimonial-circle circle-two" aria-hidden="true"/><div className="testimonial-circle circle-three" aria-hidden="true"/><div className="testimonial-circle circle-four" aria-hidden="true"/><div className="testimonial-circle circle-five" aria-hidden="true"/>
   <div className="testimonial-card" key={active} aria-live="polite"><span>{note.label}</span><h3>{note.title}</h3><p>{note.body}</p><small>{String(active+1).padStart(2,'0')} / {String(communityNotes.length).padStart(2,'0')}</small></div>
  </div>
 </section>;
}

const journalArticles=[
 {title:'Small sips, steady routines',category:'EVERYDAY HABITS',summary:'A few simple ways to make room for water throughout your day.',body:['The easiest routines often begin with something you can see. Keep your bottle near the place where your day starts: beside your notebook, on the kitchen counter, or next to your keys.','A sip between tasks can become a small moment to pause. Give yourself room to adjust the routine until it feels natural.'],image:'desk'},
 {title:'A bottle that goes where you go',category:'ON THE MOVE',summary:'From your desk to the next stop, make hydration part of the journey.',body:['A day rarely happens in one place. Packing your bottle before you head out makes it easier to carry the habit along with you.','Think about the moments when you tend to forget to pause: the commute, an errand, or the time between meetings. Those moments can become gentle reminders.'],image:'commute'},
 {title:'The art of taking a pause',category:'LIVING WELL',summary:'A more considered way to take a moment for yourself.',body:['A pause does not need to be a big event. Step away from the screen, stretch, and take a sip of water when your schedule gives you an opening.','Little breaks can help your day feel less rushed. Start with one moment that is already part of your routine.'],image:'cafe'},
 {title:'Everyday moments, together',category:'COMMUNITY',summary:'The small rituals we share with the people around us.',body:['Good routines can be easier to remember when they are part of shared moments. A walk with a friend or a quick catch-up can be a chance to take your bottle along.','Find a rhythm that works for you and the people you spend time with.'],image:'friends'},
 {title:'A calmer start to the morning',category:'ROUTINES',summary:'Simple ways to make your first moments of the day feel intentional.',body:['Before the rush begins, take a minute to set out what you need. A filled bottle by your bag can make the rest of the day feel a little more prepared.','There is no perfect morning routine. Choose one small step you can repeat comfortably.'],image:'morning'},
 {title:'Keep your rhythm going',category:'ACTIVE DAYS',summary:'Bring your bottle along as your day picks up pace.',body:['Whether you are heading to a class, a walk, or a busy afternoon, a bottle within reach helps keep the habit close.','Build your routine around the day you actually have, not an ideal schedule. Small, repeatable steps are easier to return to.'],image:'active'}
];
function Journal({onOpen,articles=journalArticles}){return <section className="journal" id="journal" aria-labelledby="journal-title"><div className="journal-header"><h2 id="journal-title">Our journals</h2><a href="#journal-grid">Read Blogs <span>↗</span></a></div><div className="journal-grid" id="journal-grid">{articles.map((article,index)=><button className="journal-card" key={index} onClick={()=>onOpen(article)}><span className={'journal-thumb journal-'+(article.image||'desk')} style={article.coverUrl?{backgroundImage:`url(${article.coverUrl})`,backgroundSize:'cover',backgroundPosition:'center'}:undefined} role="img" aria-label={article.category.toLowerCase()+' photograph'}/><span className="journal-category">{article.category}</span><strong>{article.title}</strong><span className="journal-summary">{article.summary}</span><span className="journal-more">Read article ↗</span></button>)}</div></section>}

function Faq({items=products}) { return (<section className="faq"><div className="reveal"><span className="eyebrow">GOOD TO KNOW</span><h2>A little more<br/>about Hydroid.</h2></div><div className="faq-list"><details><summary>What is Hydroid?<span>+</span></summary><p>Hydroid is the smart hydration bottle range from Veids Ventures.</p></details><details><summary>Where can I buy Hydroid?<span>+</span></summary><p>{items.map(item=>`${item.name} is ${item.price}`).join('; ')}. Ordering details will be announced here. Online checkout is not open yet.</p></details><details><summary>Where can I find the specifications?<span>+</span></summary><p>Confirmed capacity, technical specifications, care instructions, and warranty information will be added before orders open.</p></details><details><summary>Is Hydroid available for corporate gifting?<span>+</span></summary><p>Corporate gifting details will be shared by Veids Ventures when ordering opens.</p></details></div></section>); }
function Dialog({kind,onClose,article,activeProduct,setActiveProduct,items=products,waterAgentUrl=waterQualityUrl}){
 const ref=useRef(null);const [query,setQuery]=useState('');
 useEffect(()=>{const d=ref.current;d.showModal();const before=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{d.close();document.body.style.overflow=before}},[]);
 const go=(id=`bottle-${activeProduct}`)=>{onClose();location.hash=`#shop/item/${id}`};
 const matchingProducts=items.map((product,index)=>({...product,index})).filter(product=>!query.trim()||`${product.name} ${product.finish} veids ventures`.toLowerCase().includes(query.trim().toLowerCase()));
 const selectedProduct=items[activeProduct]??items[0];
 const content={gifting:['A thoughtful everyday gift.','Discover Hydroid for your team, partners, or next occasion.','Corporate gifting options and contact details will be available when ordering opens.'],contact:['Let’s stay connected.','Hydroid’s home is veids.in.','Official support and contact details will be published here before orders open.'],availability:['Something fresh is coming.',items.map(item=>`${item.name}: ${item.price}`).join(' · '),'Online ordering is not open yet. Shipping information and availability will be announced here.']};
 return <dialog ref={ref} className={['bag','menu'].includes(kind)?'drawer':''} onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose()}}}>
 <button className="close" onClick={onClose} aria-label="Close dialog">×</button>
 {kind==='product'&&<><img className="dialog-product" src={selectedProduct.image} alt={selectedProduct.alt}/><span className="eyebrow">HYDROID · VEIDS VENTURES</span><h2>{selectedProduct.name}</h2><p>{selectedProduct.description}</p><p><strong>{selectedProduct.price}</strong></p><p>Ordering details will be announced before launch.</p></>}
 {kind==='article'&&article&&<><span className="eyebrow">HYDROID JOURNAL · {article.category}</span><h2>{article.title}</h2>{(Array.isArray(article.body)?article.body:[article.body]).map((paragraph,index)=><p key={index}>{paragraph}</p>)}</>}
 {content[kind]&&<><span className="eyebrow">VEIDS VENTURES</span><h2>{content[kind][0]}</h2><p>{content[kind][1]}</p><p>{content[kind][2]}</p></>}
 {kind==='search'&&<><h2>Find your everyday.</h2><form onSubmit={e=>e.preventDefault()}><label htmlFor="search-input">Search Hydroid</label><div className="search-field"><input autoFocus id="search-input" type="search" placeholder="Search for your thing…" value={query} onChange={e=>setQuery(e.target.value)}/><button aria-label="Search products">⌕</button></div></form>{matchingProducts.length?matchingProducts.map(product=><button className="search-item" key={product.name} onClick={()=>go(product.id)}><img src={product.image} alt=""/><span><strong>{product.name}</strong><small>{product.finish} · {product.price}</small></span></button>):<p>No matching products. Try “Hydroid” or “bottle”.</p>}</>}
 {kind==='bag'&&<><h2>Your bag <span>0</span></h2><div className="empty-bag"><span>◡</span><h3>Your bag is empty</h3><p>Get to know your new everyday companion.</p><button className="pill" onClick={()=>go()}>Discover Hydroid →</button><small>Online ordering is not open yet.</small></div></>}
 {kind==='menu'&&<div className="react-menu"> <span className="eyebrow">VEIDS VENTURES</span><a href="#home" onClick={onClose}>Home</a><a href={waterAgentUrl||"#"} target={waterAgentUrl?"_blank":undefined} rel={waterAgentUrl?"noopener noreferrer":undefined} onClick={event=>{if(!waterAgentUrl)event.preventDefault();onClose()}}>Water Quality Check ↗</a>{[['shop','Products'],['video-demo','Video demo'],['difference','Why Hydroid'],['journal','Our journals'],['contact','Reach us']].map(([id,label])=><a key={id} href={'#'+id} onClick={onClose}>{label}</a>)}</div>}
 </dialog>
}
const defaultContent={
 heroImage:'/assets/hydroid-hero-person-upload.png',
 introEyebrow:'THE FUTURE OF WATER STARTS WITH KNOWING WHAT’S INSIDE.',
 introText:'Your water shouldn’t be a mystery. Veids analyses and purifies your water, balances essential minerals, and guides your hydration—making every fill smarter, healthier, and better.',
 products,pods:podsDefault,features:bottleFeatures,videoUrl:'/assets/website-demo.mp4',whyBottleImage:'/assets/hydroid.webp',blogs:journalArticles,
 logoUrl:'/assets/veids-logo.webp',waterAgentUrl:waterQualityUrl,
 socialLinks:{
  x:import.meta.env.VITE_SOCIAL_X||'https://x.com/',
  instagram:import.meta.env.VITE_SOCIAL_INSTAGRAM||'https://www.instagram.com/',
  youtube:import.meta.env.VITE_SOCIAL_YOUTUBE||'https://www.youtube.com/',
  linkedin:import.meta.env.VITE_SOCIAL_LINKEDIN||'https://www.linkedin.com/'
 },
 officialWebsite:import.meta.env.VITE_OFFICIAL_WEBSITE||'https://veids.in'
};
function App(){
 const [dialog,setDialog]=useState(null);const [paused,setPaused]=useState(false);const [article,setArticle]=useState(null);const [activeProduct,setActiveProduct]=useState(0);
 const content=defaultContent;
 const [shopView,setShopView]=useState(location.hash.startsWith('#shop'));
 const [shopRoute,setShopRoute]=useState(location.hash);
 const [user,setUser]=useState(null);
 const [accountFromBag,setAccountFromBag]=useState(false);
 const [joinOpen,setJoinOpen]=useState(false);
 const [cart,setCart]=useState(()=>{try{return JSON.parse(localStorage.getItem('hydroid-bag')||'{}')}catch{return {}}});
 const cartCount=Object.values(cart).reduce((sum,value)=>sum+Number(value||0),0);
 const changeCart=(id,quantity)=>setCart(current=>{const next={...current};if(quantity<=0)delete next[id];else next[id]=Math.min(99,quantity);return next});
 const refreshUser=()=>import('./api.js').then(({getCurrentUser})=>getCurrentUser()).then(setUser).catch(()=>setUser(null));
 const openBag=()=>{setDialog('bag');refreshUser()};
 const addToBag=(id,quantity)=>{setCart(current=>({...current,[id]:Math.min(99,(current[id]||0)+quantity)}));openBag()};
 useEffect(()=>{const update=()=>{setShopView(location.hash.startsWith('#shop'));setShopRoute(location.hash);if(location.hash.startsWith('#shop')){setDialog(null);window.scrollTo(0,0)}};addEventListener('hashchange',update);return()=>removeEventListener('hashchange',update)},[]);
 useEffect(()=>{try{localStorage.setItem('hydroid-bag',JSON.stringify(cart))}catch{}},[cart]);
 useEffect(()=>{
  refreshUser();
  let unsub=()=>{};
  import('./lib/supabase.js').then(({supabase})=>{
   const {data:{subscription}}=supabase.auth.onAuthStateChange(()=>refreshUser());
   unsub=()=>subscription.unsubscribe();
  });
  const refresh=()=>refreshUser();
  addEventListener('hydroid-auth-changed',refresh);
  return()=>{unsub();removeEventListener('hydroid-auth-changed',refresh)};
 },[]);
 useEffect(()=>{document.body.classList.toggle('paused',paused);return()=>document.body.classList.remove('paused')},[paused]);
 useEffect(()=>{const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(!reduced)document.body.classList.add('js-motion');
 if(shopView)return;
 const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:0.01,rootMargin:'0px 0px 80px 0px'});
 const timer=setTimeout(()=>{
  document.querySelectorAll('.reveal').forEach(el=>{
   const rect=el.getBoundingClientRect();
   if(rect.top<window.innerHeight+120){
    el.classList.add('visible');
   }else{
    observer.observe(el);
   }
  });
 },30);
 const header=document.querySelector('header');
 const scroll=()=>{const initialOffset=innerWidth<=760?32:36;const offset=Math.max(0,initialOffset-Math.max(0,scrollY));header.style.setProperty('--header-offset',`${offset}px`);header.classList.toggle('fixed',scrollY>70)};
 addEventListener('scroll',scroll,{passive:true});addEventListener('resize',scroll);scroll();
 return()=>{clearTimeout(timer);observer.disconnect();removeEventListener('scroll',scroll);removeEventListener('resize',scroll);document.body.classList.remove('js-motion')}
 },[shopView]);
 return <>
<div className="announcement">A fresh way to hydrate. Introducing Hydroid by Veids Ventures <span>↗</span></div>
<header><a href="#home" aria-label="Veids Ventures home"><img className="logo" src={content.logoUrl} alt="Veids Ventures" width="800" height="608" decoding="async" /></a><nav aria-label="Main navigation"><a href="#home">Home</a><a href={content.waterAgentUrl||"#"} target={content.waterAgentUrl?"_blank":undefined} rel={content.waterAgentUrl?"noopener noreferrer":undefined} onClick={event=>{if(!content.waterAgentUrl)event.preventDefault()}}>Water Quality Check ↗</a><a href="#shop">Products</a><a href="#difference">Why Hydroid</a><a href="#journal">Our journals</a><button onClick={() => setDialog("contact")}>Reach us</button></nav><div className="tools"><button aria-label="Account" onClick={() => {setAccountFromBag(false);setDialog("account")}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="3.4"/><path d="M5.3 20c.3-3.7 2.7-6 6.7-6s6.4 2.3 6.7 6"/></svg></button><button aria-label="Search" id="search-open" onClick={() => setDialog("search")}>⌕</button><button aria-label="Open shopping bag" id="bag-open" onClick={openBag}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 7h14l1 14H4L5 7Z M8 8V6a4 4 0 0 1 8 0v2"/></svg><span className="count">{cartCount}</span></button><button id="menu-open" onClick={() => setDialog("menu")} aria-label="Open menu" aria-expanded={dialog === "menu"}>☰</button></div></header>
<main>{shopView?<Shop key={shopRoute} bottles={content.products} pods={content.pods||podsDefault} onAdd={addToBag} onBuy={addToBag}/>:<><Hero paused={paused} setPaused={setPaused} heroImage={content.heroImage} onJoin={()=>setJoinOpen(true)} />
<Intro eyebrow={content.introEyebrow} text={content.introText} />
<Product items={content.products} features={content.features} activeProduct={activeProduct} setActiveProduct={setActiveProduct} onJoin={()=>setJoinOpen(true)} autoAdvance={!paused&&!dialog} />
<VideoDemo videoUrl={content.videoUrl} />
<Difference whyBottleImage={content.whyBottleImage} onDiscover={()=>{location.hash='#shop'}} />
<Testimonials />
<Journal articles={content.blogs} onOpen={item=>{setArticle(item);setDialog('article')}} />
<div className="marquee" aria-hidden="true"><div>SMART HYDRATION <span>✳</span> MAKE EVERY SIP COUNT <span>✳</span> HYDROID <span>✳</span> SMART HYDRATION <span>✳</span> MAKE EVERY SIP COUNT <span>✳</span> HYDROID <span>✳</span></div></div>
<Faq items={content.products} />
</>}</main><footer id="contact"><div className="footer-top"><div><span className="footer-brand">Hydroid.</span><p>Smart hydration. Every day.</p><img src={content.logoUrl} alt="Veids Ventures" className="footer-logo" loading="lazy" /><div className="footer-socials" aria-label="Social platforms"><a href={content.socialLinks.x} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.5 3h3.1l-6.8 7.8L21.8 21h-6.3l-4.9-6.4L5 21H1.9l7.3-8.4L1.5 3h6.5l4.4 5.9L17.5 3Zm-1.1 16.2h1.7L7 4.7H5.2l11.2 14.5Z" fill="currentColor"/></svg></a><a href={content.socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg></a><a href={content.socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.5 7.2a2.8 2.8 0 0 0-2-2C17.7 4.7 12 4.7 12 4.7s-5.7 0-7.5.5a2.8 2.8 0 0 0-2 2A30 30 0 0 0 2 12a30 30 0 0 0 .5 4.8 2.8 2.8 0 0 0 2 2c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a2.8 2.8 0 0 0 2-2A30 30 0 0 0 22 12a30 30 0 0 0-.5-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" fill="currentColor"/></svg></a><a href={content.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.8 8.8H8V20H4.8V8.8ZM6.4 3.5a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8ZM10 8.8h3.1v1.5c.5-.9 1.5-1.8 3.3-1.8 3.5 0 4.1 2.2 4.1 5.1V20h-3.2v-5.7c0-1.4 0-3.2-2-3.2s-2.2 1.5-2.2 3.1V20H10V8.8Z" fill="currentColor"/></svg></a></div></div><div><h3>Explore</h3><a href="#home">Home</a><a href="#shop">All products</a><a href="#difference">Why Hydroid</a><a href="#journal">Our journals</a></div><div><h3>Get in touch</h3><button onClick={() => { setAccountFromBag(false); setDialog("account"); }}>Your account</button><button onClick={() => setDialog("gifting")}>Corporate gifting</button><button onClick={() => setDialog("contact")}>Reach us</button><button onClick={() => setDialog("availability")}>Ordering & availability</button><button onClick={() => setJoinOpen(true)}>Join early access</button></div><div className="footer-callout"><span>YOUR NEXT DAILY RITUAL.</span><a href="#shop">Shop Hydroid ↗</a></div></div><div className="footer-bottom"><span>© 2026 Veids Ventures. Hydroid.</span><a href={content.officialWebsite} target="_blank" rel="noopener noreferrer">veids.in ↗</a><a href="#home">Back to top ↑</a></div></footer>
<a className="water-agent" href={content.waterAgentUrl||"#"} target={content.waterAgentUrl?"_blank":undefined} rel={content.waterAgentUrl?"noopener noreferrer":undefined} onClick={event=>{if(!content.waterAgentUrl)event.preventDefault()}} aria-label="Check your city water quality in a new tab"><span className="water-agent-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M16 3C13.8 7.1 7 14.4 7 20.2a9 9 0 0 0 18 0C25 14.4 18.2 7.1 16 3Z" fill="url(#waterDrop)"/><path d="M11 20.5c.2 2.5 1.5 4.2 3.7 5" stroke="#EAF9FF" strokeWidth="1.8" strokeLinecap="round" opacity=".9"/><path d="M13 14.5c.7-1.2 1.7-2.6 2.6-3.8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity=".65"/><defs><linearGradient id="waterDrop" x1="9" y1="7" x2="24" y2="27" gradientUnits="userSpaceOnUse"><stop stopColor="#B7F0FF"/><stop offset=".48" stopColor="#52C5F1"/><stop offset="1" stopColor="#1770CC"/></linearGradient></defs></svg></span><span className="water-agent-label">Check your city<br/>water quality</span><span className="water-agent-arrow" aria-hidden="true">↗</span></a>
{dialog==="account"&&<React.Suspense fallback={<div className="account-backdrop"><section className="account-card"><p>Loading your account…</p></section></div>}><AccountDialog onClose={()=>{setDialog(accountFromBag?"bag":null);setAccountFromBag(false)}}/></React.Suspense>}{dialog==="bag"&&<Bag bottles={content.products} pods={content.pods||podsDefault} cart={cart} onChange={changeCart} onClose={()=>setDialog(null)} onAccount={()=>{setAccountFromBag(true);setDialog("account")}} user={user}/>}{dialog&&dialog!=="account"&&dialog!=="bag"&&<Dialog key={dialog} kind={dialog} article={article} activeProduct={activeProduct} setActiveProduct={setActiveProduct} items={shopItems(content.products,content.pods||podsDefault)} waterAgentUrl={content.waterAgentUrl} onClose={()=>setDialog(null)}/>} {joinOpen&&<JoinForm onClose={()=>setJoinOpen(false)}/>}</>;
}
createRoot(document.getElementById('root')).render(<App/>);
