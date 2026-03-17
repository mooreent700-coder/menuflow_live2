document.addEventListener('DOMContentLoaded', async ()=>{
 try{
   const u=await MF.need(); if(!u) return;
   const form=document.getElementById('websiteForm');
   const heroPrev=document.getElementById('heroPrev'), logoPrev=document.getElementById('logoPrev');
   const liveHero=document.getElementById('liveHero'), liveLogo=document.getElementById('liveLogo'), liveTitle=document.getElementById('liveTitle'), liveSub=document.getElementById('liveSub'), siteUrl=document.getElementById('siteUrl');
   let heroFile = null, logoFile = null;
   let b = await MF.ensureRestaurant();

   function paint(){
     form.name.value=b.name||'';
     form.slug.value=b.slug||'';
     form.heroTitle.value=b.heroTitle||'';
     form.heroSubtitle.value=b.heroSubtitle||'';
     form.pickupMessage.value=b.pickupMessage||'';
     heroPrev.innerHTML=b.hero?`<img src="${b.hero}">`:'';
     logoPrev.innerHTML=b.logo?`<img src="${b.logo}">`:'';
     if(b.hero) liveHero.src=b.hero;
     liveLogo.innerHTML=b.logo?`<img src="${b.logo}">`:'';
     liveTitle.textContent=b.heroTitle||b.name||'Your hero title';
     liveSub.textContent=b.heroSubtitle||b.description||'';
     siteUrl.value=MF.siteLink(b);
     if(window.MF_DASH_REFRESH) window.MF_DASH_REFRESH();
   }

   form.addEventListener('submit', async e=>{
     e.preventDefault();
     let patch = {
       name: form.name.value.trim(),
       slug: MF.slugify(form.slug.value),
       heroTitle: form.heroTitle.value.trim(),
       heroSubtitle: form.heroSubtitle.value.trim(),
       pickupMessage: form.pickupMessage.value.trim()
     };
     if(heroFile) patch.hero = await MF.uploadImage('heroes', heroFile, 1600, .82);
     if(logoFile) patch.logo = await MF.uploadImage('logos', logoFile, 900, .82);
     b = await MF.saveRestaurant(patch);
     MF.toast('Website saved');
     heroFile = null; logoFile = null;
     paint();
   });

   form.hero.addEventListener('change', async e=>{
     const f=e.target.files[0]; if(!f) return;
     heroFile = f;
     heroPrev.innerHTML=`<img src="${await (async()=>{const r=new FileReader(); return await new Promise(res=>{r.onload=()=>res(r.result); r.readAsDataURL(f);});})()}">`;
     MF.toast('Hero picture ready');
   });

   form.logo.addEventListener('change', async e=>{
     const f=e.target.files[0]; if(!f) return;
     logoFile = f;
     logoPrev.innerHTML=`<img src="${await (async()=>{const r=new FileReader(); return await new Promise(res=>{r.onload=()=>res(r.result); r.readAsDataURL(f);});})()}">`;
     MF.toast('Logo ready');
   });

   paint();
 }catch(err){
   alert(err.message || err);
 }
});
