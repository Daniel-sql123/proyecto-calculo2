function safeParse(json){
  try { return JSON.parse(json); } catch { return null; }
}

function norm(s){
  return (s||"")
    .toString().trim().toLowerCase()
    .replaceAll(" ","")
    .replaceAll("á","a").replaceAll("é","e").replaceAll("í","i").replaceAll("ó","o").replaceAll("ú","u")
    .replaceAll("ñ","n");
}

export class QuestionBankEditable {
  constructor(storage, defaultQuestions = []){
    this.storage = storage;
    this.key = "question_bank_custom_v1";
    this.defaultQuestions = Array.isArray(defaultQuestions) ? defaultQuestions : [];
    this.questions = this.loadAll();
  }

  loadAll(){
    const custom = this.storage.getItem(this.key);
    if(Array.isArray(custom) && custom.length){
      return this._normalizeImported(custom);
    }
    return this.defaultQuestions;
  }

  saveAll(list){
    const cleaned = this._normalizeImported(Array.isArray(list) ? list : []);
    this.questions = cleaned;
    this.storage.setItem(this.key, cleaned.map(q => this._stripFns(q)));
  }

  resetToDefault(){
    this.storage.removeItem(this.key);
    this.questions = this.defaultQuestions;
  }

  exportJSON(){
    // export sin funciones para que sea portable
    const portable = this.questions.map(q => this._stripFns(q));
    return JSON.stringify(portable, null, 2);
  }

  importJSON(jsonText){
    const data = safeParse(jsonText);
    if(!Array.isArray(data)) return { ok:false, msg:"El JSON debe ser un array de preguntas." };

    for(const q of data){
      if(!q || typeof q.prompt !== "string" || !q.level) {
        return { ok:false, msg:"Hay preguntas sin 'prompt' o 'level'." };
      }
      if(!q.type || !["mcq","input"].includes(q.type)){
        return { ok:false, msg:"type inválido: usa 'mcq' o 'input'." };
      }
      if(q.type === "mcq"){
        if(!Array.isArray(q.choices) || typeof q.answerIndex !== "number"){
          return { ok:false, msg:"En mcq necesitas 'choices' y 'answerIndex'." };
        }
      }
    }

    this.saveAll(data);
    return { ok:true, msg:"Banco importado y guardado." };
  }

  _stripFns(q){
    const copy = { ...q };
    delete copy.validate; // no exportar funciones
    return copy;
  }

  _normalizeImported(list){
    return list.map(q => {
      // Si es input, permite validar con answers: []
      if(q.type === "input"){
        const answers = Array.isArray(q.answers) ? q.answers : [];
        return {
          ...q,
          validate: (raw) => {
            const x = norm(raw);
            if(!answers.length) return false;
            return answers.some(a => norm(a) === x);
          }
        };
      }
      return q;
    });
  }

  getByLevel(level){
    return this.questions.filter(q => q.level === level);
  }
}
