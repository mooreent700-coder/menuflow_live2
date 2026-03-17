window.MF_SUPABASE_URL = 'PASTE_YOUR_SUPABASE_URL_HERE';
window.MF_SUPABASE_ANON_KEY = 'PASTE_YOUR_SUPABASE_ANON_KEY_HERE';

window.MFClient = (() => {
  function ready() {
    const ok = window.supabase && window.MF_SUPABASE_URL && !window.MF_SUPABASE_URL.includes('PASTE_') &&
      window.MF_SUPABASE_ANON_KEY && !window.MF_SUPABASE_ANON_KEY.includes('PASTE_');
    return ok;
  }

  const client = ready()
    ? window.supabase.createClient(window.MF_SUPABASE_URL, window.MF_SUPABASE_ANON_KEY)
    : null;

  return {
    client,
    ready
  };
})();
