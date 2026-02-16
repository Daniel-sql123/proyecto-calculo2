export class AchievementService {
  constructor(storage, toast){
    this.storage = storage;
    this.toast = toast;
    this.key = "quiz_achievements_v1";
  }

  _load(){
    return this.storage.getItem(this.key) || {};
  }

  _save(all){
    this.storage.setItem(this.key, all);
  }

  isUnlocked(username, id){
    const all = this._load();
    return !!all?.[username]?.[id];
  }

  unlock(username, id){
    const all = this._load();
    if(!all[username]) all[username] = {};
    if(all[username][id]) return false;

    all[username][id] = { at: new Date().toISOString() };
    this._save(all);
    return true;
  }

  checkAndUnlock({ username, achievements, context }){
    for(const a of achievements){
      if(this.isUnlocked(username, a.id)) continue;
      if(a.check(context)){
        const ok = this.unlock(username, a.id);
        if(ok){
          this.toast.show(`🏆 Logro: ${a.title}`);
          a.onUnlock?.(context);
        }
      }
    }
  }

  getUnlocked(username){
    const all = this._load();
    return all?.[username] || {};
  }
}
