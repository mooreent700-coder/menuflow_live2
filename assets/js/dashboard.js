document.addEventListener('DOMContentLoaded', async ()=>{
 try{
   const u = await MF.need(); if(!u) return;
   let b = await MF.ensureRestaurant();

   async function refresh(){
     b = await MF.getRestaurant();
     document.querySelectorAll('[data-site-link]').forEach(el=>{ el.href = MF.siteLink(b); });
     document.querySelectorAll('[data-copy-site]').forEach(el=>el.onclick=async()=>{ try{ await navigator.clipboard.writeText(MF.siteLink(b)); MF.toast('Website link copied'); }catch(e){} });
     const out=document.getElementById('logout');
     if(out) out.onclick=async()=>{ await MF.signOut(); location.href='../login.html'; };
     const name=document.getElementById('bizName');
     if(name) name.textContent=b.name||u.email||'Your business';
   }

   window.MF_DASH_REFRESH = refresh;
   refresh();
 }catch(err){
   alert(err.message || err);
 }
});
