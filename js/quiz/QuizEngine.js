export class QuizEngine {
  constructor(storage, toast, questionBank){
    this.storage = storage;
    this.toast = toast;
    this.bank = questionBank;

    this.user = null;
    this.level = 1;
    this.points = 0;
    this.lives = 3;

    this.answeredPrompts = new Set();
    this.levelQuestions = [];

    this.correctCount = 0;
    this.incorrectCount = 0;
  }

  isLoggedIn(){ return !!this.user; }

  loadUser(userObj){
    this.user = userObj;
    this.level = userObj.progress?.level ?? 1;
    this.points = userObj.progress?.points ?? 0;
    this.startLevel(this.level);
    this.persistProgress();
  }

  logout(){
    this.user = null;
    this.level = 1;
    this.points = 0;
    this.lives = 3;
    this.answeredPrompts = new Set();
    this.levelQuestions = [];
  }

  startLevel(level){
    this.level = level;
    this.lives = 3;
    this.answeredPrompts = new Set();
    this.levelQuestions = this.bank.getByLevel(level);
  }

  persistProgress(){
    if(!this.user) return;

    const users = this.storage.loadUsers();
    if(!users[this.user.username]) return;

    users[this.user.username].progress = { level: this.level, points: this.points,correct: this.correctCount, incorrect: this.incorrectCount };
    this.storage.saveUsers(users);
  }

  getProgress(){
    const total = Math.max(1, this.levelQuestions.length);
    const done = this.answeredPrompts.size;
    return { done, total, pct: Math.round((done/total)*100) };
  }

  getNextQuestion(){
    if(!this.user) return null;

    for(const q of this.levelQuestions){
      if(!this.answeredPrompts.has(q.prompt)) return q;
    }
    return null;
  }

  isLevelComplete(){
    return this.answeredPrompts.size >= this.levelQuestions.length && this.levelQuestions.length > 0;
  }

  canAdvance(){
    return this.level < 3;
  }

  advanceLevel(){
    if(!this.canAdvance()) return false;
    this.startLevel(this.level + 1);
    this.persistProgress();
    this.toast.show(`Subiste a Nivel ${this.level}. ¡Vamos!`);
    return true;
  }

  resetLevel(level){
    if(!this.user) return;

    if(level && level !== this.level){
      // remove answered prompts that belong to the specified level
      const lvlQs = this.bank.getByLevel(level) || [];
      for(const q of lvlQs){
        this.answeredPrompts.delete(q.prompt);
      }
      this.toast.show(`Nivel ${level} reiniciado.`);
      this.persistProgress();
      return;
    }

    // default: reset the current level (original behavior)
    this.startLevel(this.level);
    this.toast.show("Nivel reiniciado. ¡A practicar!");
  }

  submitAnswer(question, payload){
    // return: { correct, earned, lives, points, title, desc, endedByLives, levelCompleted }
    let correct = false;

  if(question.type === "mcq"){
    correct = payload.index === question.answerIndex;
  } 
  else if(question.type === "input"){
    correct = !!question.validate(payload.value);
  }

  // 🔒 Marcar SIEMPRE como respondida
  this.answeredPrompts.add(question.prompt);

  if(correct){
    const earned = question.points ?? 10;
    this.points += earned;
    this.correctCount++;
    this.persistProgress();

    return {
      correct: true,
      earned,
      lives: this.lives,
      points: this.points,
      title: `¡Correcto! +${earned} pts`,
      desc: question.explainOk || "Bien hecho.",
      endedByLives: false,
      levelCompleted: this.isLevelComplete()
    };
  }

  // ❌ Incorrecta
  this.lives = Math.max(0, this.lives - 1);
  const endedByLives = (this.lives === 0);

  return {
    correct: false,
    earned: 0,
    lives: this.lives,
    points: this.points,
    title: "Incorrecto ❌",
    desc: question.explainBad || "Revisa el procedimiento.",
    endedByLives,
    levelCompleted: false
  };
  }

  skipQuestion(question){
    this.lives = Math.max(0, this.lives - 1);
    if(this.lives === 0){
      return { endedByLives:true, title:"Omitiste y te quedaste sin vidas", desc:"Reinicia el nivel y revisa explicaciones." };
    }

    this.answeredPrompts.add(question.prompt);
    return { endedByLives:false, title:"Omitida (−1 vida)", desc:"Evita omitir: aquí se aprende más. Puedes reiniciar el nivel si quieres reintentar." };
  }
}
