document.addEventListener('DOMContentLoaded',()=>{
 const f=document.getElementById('loginForm'); if(!f) return;
 f.addEventListener('submit', async e=>{
   e.preventDefault();
   const msg=document.getElementById('msg');
   msg.textContent = '';
   try{
     await MF.signIn(f.email.value.trim(), f.password.value);
     location.href='dashboard/index.html';
   }catch(err){
     msg.textContent = err.message || 'Login failed';
   }
 });
});
