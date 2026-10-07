import React,{useEffect,useRef} from 'react';
import {money,shopItems,podsDefault} from './Shop.jsx';
import './shop.css';

export default function Bag({bottles,pods,cart,onChange,onClose,onAccount,user}){
 const ref=useRef(null);
 useEffect(()=>{const dialog=ref.current;dialog.showModal();const before=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{dialog.close();document.body.style.overflow=before}},[]);
 const products=shopItems(bottles,pods);
 const entries=Object.entries(cart).map(([id,quantity])=>{const product=products.find(item=>item.id===id)||products.find(item=>item.isPod&&id.startsWith('pods-'));if(!product||quantity<1)return null;const pack=product.isPod?(product.packs||podsDefault.packs).find(item=>`pods-${item.quantity}`===id):null;return {id,quantity,product,pack,price:money(pack?.price||product.price)}}).filter(Boolean);
 const total=entries.reduce((sum,item)=>sum+item.price*item.quantity,0);
 const count=entries.reduce((sum,item)=>sum+item.quantity,0);
 return <dialog ref={ref} className="drawer bag-drawer" onCancel={onClose}><button className="close" onClick={onClose} aria-label="Close bag">×</button><h2>Your bag <span>{count}</span></h2>
 {!user&&<div className="bag-account"><strong>Your Hydroid account</strong><p>Sign in or create an account before checkout.</p><button onClick={onAccount}>Sign up / Log in ↗</button></div>}
 {entries.length?<div className="bag-items">{entries.map(({id,quantity,product,pack,price})=><div className="bag-line" key={id}><a href={`#shop/item/${product.id}`} onClick={onClose}><img src={product.image} alt=""/></a><div><a href={`#shop/item/${product.id}`} onClick={onClose}><strong>{product.name}</strong></a><small>{pack?.label||product.finish}</small><span>₹{(price*quantity).toLocaleString('en-IN')}</span><div className="bag-line-controls"><button onClick={()=>onChange(id,quantity-1)} aria-label={`Remove one ${product.name}`}>−</button><output>{quantity}</output><button onClick={()=>onChange(id,quantity+1)} aria-label={`Add one ${product.name}`}>+</button><button className="bag-remove" onClick={()=>onChange(id,0)}>Remove</button></div></div></div>)}</div>:<div className="empty-bag"><span>◡</span><h3>Your bag is empty</h3><p>Find your next everyday companion.</p></div>}
 <div className="bag-bottom">{entries.length>0&&<div className="bag-subtotal"><span>Subtotal</span><strong>₹{total.toLocaleString('en-IN')}</strong></div>}<p>Shipping and payment will be available when online ordering opens.</p><a className="bag-shop-button" href="#shop" onClick={onClose}>{entries.length?'Continue shopping':'Explore all products'} ↗</a>{entries.length>0&&<button className="bag-checkout" type="button" disabled>Checkout coming soon</button>}</div>
 </dialog>
}
