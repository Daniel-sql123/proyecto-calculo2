export class PodiumService {

  constructor(){
    this.key = "quiz_podium";
  }


  // Internal loader that tolerates legacy array format.
  _loadRaw(){
    try{
      return JSON.parse(localStorage.getItem(this.key));
    } catch(e){
      return null;
    }
  }

  // Get players for a given level. If storage contains a simple array (legacy),
  // return that array as a fallback.
  getPlayers(level){
    const raw = this._loadRaw();
    if(!raw) return [];
    if(Array.isArray(raw)) return raw; // legacy global list
    return raw[String(level)] || [];
  }

  // Save a player into the podium for a specific level.
  // Keeps only the top 3 for that level.
  savePlayer(player, level){
    const raw = this._loadRaw();
    let store = {};

    if(Array.isArray(raw)){
      // migrate legacy array into an 'all' bucket to avoid data loss
      store = { all: raw };
    } else if(raw && typeof raw === 'object'){
      store = raw;
    }

    const key = String(level);
    const players = store[key] ? Array.from(store[key]) : [];

    const existing = players.find(p => p.username === player.username);
    if(existing){
      existing.points = player.points ?? existing.points;
      existing.level = player.level ?? existing.level;
      existing.lives = player.lives ?? existing.lives;
      existing.correct = player.correct ?? existing.correct;
      existing.incorrect = player.incorrect ?? existing.incorrect;
    } else {
      players.push(player);
    }

    players.sort((a,b) => (b.points || 0) - (a.points || 0));
    store[key] = players.slice(0,3);

    localStorage.setItem(this.key, JSON.stringify(store));
  }

  getTopPlayers(level){
    return this.getPlayers(level);
  }

  // Return a global top by aggregating all stored level lists (and legacy 'all').
  // Keeps the highest-scoring unique users (top 3).
  getGlobalTop(){
    const raw = this._loadRaw();
    if(!raw) return [];
    if(Array.isArray(raw)) return raw;

    const all = [];
    Object.keys(raw).forEach(k => {
      const arr = raw[k];
      if(Array.isArray(arr)) all.push(...arr);
    });

    all.sort((a,b) => (b.points||0) - (a.points||0));

    const seen = new Set();
    const unique = [];
    for(const p of all){
      if(!p || !p.username) continue;
      if(seen.has(p.username)) continue;
      seen.add(p.username);
      unique.push(p);
    }

    return unique.slice(0,3);
  }

}
