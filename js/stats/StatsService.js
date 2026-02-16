export class StatsService {
  constructor(storage){
    this.storage = storage;
    this.key = "quiz_stats_v1";
  }

  _load(){
    return this.storage.getItem(this.key) || {};
  }

  _save(obj){
    this.storage.setItem(this.key, obj);
  }

  _ensureUser(stats, username){
    if(!stats[username]){
      stats[username] = {
        totalCorrect: 0,
        totalIncorrect: 0,
        byLevel: {},   
        sessions: []  
      };
    }
    return stats[username];
  }

  recordAnswer({ username, level, correct }){
    const stats = this._load();
    const u = this._ensureUser(stats, username);
    const k = String(level);

    if(!u.byLevel[k]) u.byLevel[k] = { correct:0, incorrect:0 };

    if(correct){
      u.totalCorrect++;
      u.byLevel[k].correct++;
    } else {
      u.totalIncorrect++;
      u.byLevel[k].incorrect++;
    }

    this._save(stats);
  }

  recordSessionEnd({ username, level, points, correct, incorrect }){
    const stats = this._load();
    const u = this._ensureUser(stats, username);

    u.sessions.unshift({
      at: new Date().toISOString(),
      level, points, correct, incorrect
    });

    u.sessions = u.sessions.slice(0, 30);
    this._save(stats);
  }

  getUserStats(username){
    const stats = this._load();
    return stats[username] || null;
  }
}
