window.MF = (() => {
  const SESSION_KEY = 'mf_supabase_last_restaurant_id';
  const PLACEHOLDER_URL = 'PASTE_YOUR_SUPABASE_URL_HERE';

  function client() {
    if (!window.MFClient || !window.MFClient.ready() || !window.MFClient.client) {
      throw new Error('Supabase is not connected yet. Open assets/js/supabaseClient.js and paste your URL and anon key.');
    }
    return window.MFClient.client;
  }

  function money(n){ return '$' + Number(n || 0).toFixed(2); }

  function slugify(v=''){
    return String(v).trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  }

  async function signIn(email, password){
    const { error } = await client().auth.signInWithPassword({ email, password });
    if (error) throw error;
    return true;
  }

  async function signOut(){
    try { await client().auth.signOut(); } catch(e){}
    localStorage.removeItem(SESSION_KEY);
  }

  async function getUser(){
    const { data, error } = await client().auth.getUser();
    if (error) throw error;
    return data.user;
  }

  async function need(){
    const user = await getUser();
    if(!user){
      location.href = location.pathname.includes('/dashboard/') ? '../login.html' : 'login.html';
      return null;
    }
    return user;
  }

  async function getRestaurant(){
    const user = await getUser();
    if(!user) return null;
    const { data, error } = await client()
      .from('restaurants')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if(data) localStorage.setItem(SESSION_KEY, data.id);
    return data;
  }

  async function ensureRestaurant(){
    const user = await getUser();
    if(!user) return null;
    let current = await getRestaurant();
    if (current) return current;
    const payload = {
      owner_id: user.id,
      name: 'My Restaurant',
      slug: 'my-restaurant',
      hero_title: 'Fresh food, made to order.',
      hero_subtitle: 'Customers can order pickup from your MenuFlow website.',
      pickup_message: 'Pickup available',
      description: '',
      published: false
    };
    const { data, error } = await client().from('restaurants').insert(payload).select('*').single();
    if (error) throw error;
    localStorage.setItem(SESSION_KEY, data.id);
    return data;
  }

  async function saveRestaurant(patch){
    const current = await ensureRestaurant();
    const payload = {
      name: patch.name,
      slug: slugify(patch.slug || current.slug),
      hero_title: patch.heroTitle,
      hero_subtitle: patch.heroSubtitle,
      pickup_message: patch.pickupMessage,
      description: patch.description ?? current.description ?? '',
      logo_url: patch.logo ?? current.logo_url ?? '',
      hero_url: patch.hero ?? current.hero_url ?? '',
      published: false
    };
    const { data, error } = await client().from('restaurants').update(payload).eq('id', current.id).select('*').single();
    if (error) throw error;
    localStorage.setItem(SESSION_KEY, data.id);
    return data;
  }

  async function listCategories(restaurantId){
    const { data, error } = await client().from('categories').select('*').eq('restaurant_id', restaurantId).order('sort_order', {ascending:true}).order('created_at', {ascending:true});
    if (error) throw error;
    return data || [];
  }

  async function addCategory(name){
    const current = await ensureRestaurant();
    const existing = await listCategories(current.id);
    const { data, error } = await client().from('categories').insert({
      restaurant_id: current.id,
      name,
      sort_order: existing.length
    }).select('*').single();
    if (error) throw error;
    await client().from('restaurants').update({ published: false }).eq('id', current.id);
    return data;
  }

  async function listMenuItems(restaurantId){
    const { data, error } = await client().from('menu_items').select('*').eq('restaurant_id', restaurantId).order('sort_order', {ascending:true}).order('created_at', {ascending:false});
    if (error) throw error;
    return data || [];
  }

  async function addItem(item){
    const current = await ensureRestaurant();
    const items = await listMenuItems(current.id);
    const { data, error } = await client().from('menu_items').insert({
      restaurant_id: current.id,
      category_id: item.categoryId || null,
      name: item.name,
      description: item.description,
      price: Number(item.price || 0),
      image_url: item.image || '',
      available: true,
      sort_order: items.length
    }).select('*').single();
    if (error) throw error;
    await client().from('restaurants').update({ published: false }).eq('id', current.id);
    return data;
  }

  async function updateItem(id, patch){
    const payload = {};
    if ('available' in patch) payload.available = patch.available;
    if ('name' in patch) payload.name = patch.name;
    if ('description' in patch) payload.description = patch.description;
    if ('price' in patch) payload.price = patch.price;
    if ('image' in patch) payload.image_url = patch.image;
    const { data, error } = await client().from('menu_items').update(payload).eq('id', id).select('*').single();
    if (error) throw error;
    const current = await ensureRestaurant();
    await client().from('restaurants').update({ published: false }).eq('id', current.id);
    return data;
  }

  async function deleteItem(id){
    const { error } = await client().from('menu_items').delete().eq('id', id);
    if (error) throw error;
    const current = await ensureRestaurant();
    await client().from('restaurants').update({ published: false }).eq('id', current.id);
    return true;
  }

  async function uploadImage(bucket, file, maxW=1600, q=.82){
    const dataUrl = await resizeDataUrl(file, maxW, q);
    const blob = await (await fetch(dataUrl)).blob();
    const path = `${Date.now()}-${slugify(file.name || 'image')}.jpg`;
    const { error } = await client().storage.from(bucket).upload(path, blob, { contentType: 'image/jpeg', upsert: true });
    if (error) throw error;
    const { data } = client().storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async function resizeDataUrl(file,maxW=1600,q=.82){
    return await new Promise((res,rej)=>{
      const r=new FileReader();
      r.onload=()=>{
        const img=new Image();
        img.onload=()=>{
          const scale=Math.min(1,maxW/img.width);
          const w=Math.round(img.width*scale), h=Math.round(img.height*scale);
          const c=document.createElement('canvas');
          c.width=w;c.height=h;
          c.getContext('2d').drawImage(img,0,0,w,h);
          res(c.toDataURL('image/jpeg',q));
        };
        img.onerror=rej;
        img.src=r.result;
      };
      r.onerror=rej;
      r.readAsDataURL(file);
    });
  }

  async function publishSite(){
    const current = await ensureRestaurant();
    const { data, error } = await client().from('restaurants').update({
      published: true,
      published_at: new Date().toISOString()
    }).eq('id', current.id).select('*').single();
    if (error) throw error;
    return data;
  }

  async function businessBySlug(slug){
    const { data, error } = await client()
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const cats = await listCategories(data.id);
    const items = await listMenuItems(data.id);
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      heroTitle: data.hero_title,
      heroSubtitle: data.hero_subtitle,
      pickupMessage: data.pickup_message,
      description: data.description,
      logo: data.logo_url,
      hero: data.hero_url,
      categories: cats.map(c => ({ id: c.id, name: c.name })),
      items: items.map(i => ({
        id: i.id,
        categoryId: i.category_id,
        name: i.name,
        description: i.description,
        price: i.price,
        image: i.image_url,
        available: i.available
      }))
    };
  }

  function siteLink(b){
    return new URL('/' + encodeURIComponent((b && b.slug) || ''), location.origin).toString();
  }

  function toast(msg){
    let t=document.getElementById('toast');
    if(!t){
      t=document.createElement('div');
      t.id='toast';
      t.style.cssText='position:fixed;top:16px;right:16px;background:#121a2f;color:#fff;border:1px solid #293657;padding:12px 14px;border-radius:14px;z-index:100';
      document.body.appendChild(t);
    }
    t.textContent=msg;
    t.style.display='block';
    clearTimeout(window.__t);
    window.__t=setTimeout(()=>t.style.display='none',2200);
  }

  return {
    money, slugify, signIn, signOut, getUser, need, getRestaurant, ensureRestaurant, saveRestaurant,
    listCategories, addCategory, listMenuItems, addItem, updateItem, deleteItem, uploadImage,
    publishSite, businessBySlug, siteLink, toast
  };
})();
