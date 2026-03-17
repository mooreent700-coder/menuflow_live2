document.addEventListener('DOMContentLoaded', async ()=>{
 try{
   const qsSlug = new URLSearchParams(location.search).get('slug');
   const pathSlug = location.pathname.split('/').filter(Boolean).pop();
   const reserved = new Set(['site','index.html','login.html','dashboard','assets']);
   const slug = qsSlug || (!reserved.has(pathSlug) ? pathSlug : '') || '';
   if(!slug){
     document.body.innerHTML='<div class="container"><div class="card"><h1>Website not found</h1><p class="muted">Missing restaurant slug.</p></div></div>';
     return;
   }

   const b=await MF.businessBySlug(slug);
   if(!b){
     document.body.innerHTML='<div class="container"><div class="card"><h1>Website not found</h1><p class="muted">This client link does not match any live MenuFlow website.</p></div></div>';
     return;
   }

   const hero=document.getElementById('hero'), logo=document.getElementById('logoWrap'), title=document.getElementById('heroTitle'), sub=document.getElementById('heroSub'), biz=document.getElementById('bizTitle'), pickup=document.getElementById('pickup'), menu=document.getElementById('menu');
   if(b.hero) hero.src=b.hero;
   if(b.logo) logo.innerHTML=`<img src="${b.logo}">`;
   title.textContent=b.heroTitle||b.name;
   sub.textContent=b.heroSubtitle||b.description||'';
   biz.textContent=b.name;
   pickup.textContent=b.pickupMessage||'Pickup available';
   menu.innerHTML=b.categories.map(c=>`<section><h2>${c.name}</h2><div class="menu-grid">${b.items.filter(i=>i.categoryId===c.id).map(i=>`<div class="menu-card"><div class="ph">${i.image?`<img src="${i.image}">`:''}</div><div class="body"><div class="row"><strong>${i.name}</strong><strong>${MF.money(i.price)}</strong></div><div class="muted" style="margin:8px 0 12px">${i.description||''}</div><button class="btn btn-primary" ${!i.available?'disabled':''}>${i.available?'Add to Cart':'Sold Out'}</button></div></div>`).join('')}</div></section>`).join('');
 }catch(err){
   document.body.innerHTML='<div class="container"><div class="card"><h1>Storefront error</h1><p class="muted">'+(err.message||err)+'</p></div></div>';
 }
});
