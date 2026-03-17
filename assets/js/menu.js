document.addEventListener('DOMContentLoaded', async ()=>{
 try{
   const u=await MF.need(); if(!u) return;
   let b=await MF.ensureRestaurant();
   const catForm=document.getElementById('catForm'), itemForm=document.getElementById('itemForm'), cats=document.getElementById('cats'), items=document.getElementById('items'), itemPrev=document.getElementById('itemPrev');
   let imgFile=null;

   async function render(){
     b = await MF.getRestaurant();
     const categories = await MF.listCategories(b.id);
     const menuItems = await MF.listMenuItems(b.id);
     itemForm.categoryId.innerHTML=categories.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
     cats.innerHTML=categories.length?categories.map(c=>`<div class="card"><strong>${c.name}</strong></div>`).join(''):'<div class="empty">No categories yet.</div>';
     items.innerHTML=menuItems.length?menuItems.map(i=>`<div class="item"><div class="thumb">${i.image_url?`<img src="${i.image_url}">`:''}</div><div><div class="row"><strong>${i.name}</strong><span class="badge">${MF.money(i.price)}</span></div><div class="muted">${i.description||''}</div></div><div class="toolbar"><button class="btn btn-secondary" data-toggle="${i.id}">${i.available?'Sold Out':'Available'}</button><button class="btn btn-secondary" data-del="${i.id}">Delete</button></div></div>`).join(''):'<div class="empty">No items yet.</div>';
     items.querySelectorAll('[data-del]').forEach(btn=>btn.onclick=async()=>{await MF.deleteItem(btn.dataset.del); render(); MF.toast('Item deleted')});
     items.querySelectorAll('[data-toggle]').forEach(btn=>btn.onclick=async()=>{const current = menuItems.find(x=>x.id===btn.dataset.toggle); await MF.updateItem(current.id,{available:!current.available}); render(); MF.toast('Item updated')});
     if(window.MF_DASH_REFRESH) window.MF_DASH_REFRESH();
   }

   catForm.addEventListener('submit', async e=>{
     e.preventDefault();
     if(!catForm.name.value.trim()) return;
     await MF.addCategory(catForm.name.value.trim());
     catForm.reset();
     render();
     MF.toast('Category added');
   });

   itemForm.image.addEventListener('change', async e=>{
     const f=e.target.files[0]; if(!f) return;
     imgFile=f;
     const r=new FileReader();
     r.onload=()=>{ itemPrev.innerHTML=`<img src="${r.result}">`; };
     r.readAsDataURL(f);
     MF.toast('Item picture ready');
   });

   itemForm.addEventListener('submit', async e=>{
     e.preventDefault();
     const imageUrl = imgFile ? await MF.uploadImage('menu-images', imgFile, 1200, .82) : '';
     await MF.addItem({
       categoryId:itemForm.categoryId.value,
       name:itemForm.name.value.trim(),
       description:itemForm.description.value.trim(),
       price:Number(itemForm.price.value||0),
       image:imageUrl
     });
     itemForm.reset();
     imgFile=null;
     itemPrev.innerHTML='';
     render();
     MF.toast('Menu item added');
   });

   render();
 }catch(err){
   alert(err.message || err);
 }
});
