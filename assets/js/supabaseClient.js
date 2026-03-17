window.MF_SUPABASE_URL = 'https://pgzpchlsogtarplgqapr.supabase.co';
window.MF_SUPABASE_ANON_KEY = 'sb_publishable_3uICp0nV_ub5R1L7vu_eBg_9oTnrFtf...';

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
