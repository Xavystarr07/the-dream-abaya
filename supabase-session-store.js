const Store = require('express-session').Store;

class SupabaseSessionStore extends Store {
  constructor(supabase) {
    super();
    this.supabase = supabase;
  }

  async get(sid, cb) {
    try {
      const { data } = await this.supabase
        .from('sessions').select('data').eq('sid', sid).single();
      if (!data) return cb(null, null);
      cb(null, JSON.parse(data.data));
    } catch { cb(null, null); }
  }

 async set(sid, session, cb) {
    try {
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await this.supabase.from('sessions').upsert(
        { sid, data: JSON.stringify(session), expires },
        { onConflict: 'sid' }
      );
      cb(null);
    } catch(e) { cb(e); }
  }

  async destroy(sid, cb) {
    try {
      await this.supabase.from('sessions').delete().eq('sid', sid);
      console.log('Session save result:', JSON.stringify(result));
      cb(null);
    } catch(e) { cb(e); }
  }
}

module.exports = SupabaseSessionStore;