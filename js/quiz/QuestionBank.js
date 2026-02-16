function normalize(s){
  return (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .replaceAll(" ", "")
    .replaceAll("á","a").replaceAll("é","e").replaceAll("í","i").replaceAll("ó","o").replaceAll("ú","u")
    .replaceAll("ñ","n");
}

export class QuestionBank {
  constructor(){
    this.questions = [
      // NIVEL 1 — FÁCIL (4)
      {
        level: 1, diff:"Fácil", type:"mcq", points:10,
        prompt:"1) Calcula ∫ x² dx",
        choices:["x³ + C","x³/3 + C","2x + C","x²/2 + C"],
        answerIndex:1,
        explainOk:"Correcto: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C. Con n=2: x³/3 + C.",
        explainBad:"Error típico: olvidar dividir entre (n+1). Aquí (2+1)=3, por eso x³/3 + C."
      },
      {
        level: 1, diff:"Fácil", type:"input", points:10,
        prompt:"2) Completa: ∫ cos(x) dx = ________ + C",
        placeholder:"Ej: sen(x)",
        validate:(raw)=> {
          const n = normalize(raw);
          return n === normalize("sen(x)") || n === normalize("sin(x)");
        },
        explainOk:"Correcto: la derivada de sen(x) es cos(x), entonces su integral es sen(x)+C.",
        explainBad:"Pista: busca una función cuya derivada sea cos(x). Esa función es sen(x)."
      },
      {
        level: 1, diff:"Fácil", type:"mcq", points:10,
        prompt:"3) Propiedad: ∫ (3f(x)) dx es igual a…",
        choices:["3∫ f(x) dx","∫ f(x) dx + 3","∫ f(x) dx / 3","No se puede simplificar"],
        answerIndex:0,
        explainOk:"Correcto: linealidad ⇒ ∫a f(x) dx = a∫f(x) dx.",
        explainBad:"Error típico: sumar 3 “por fuera”. No: el 3 multiplica toda la integral."
      },
      {
        level: 1, diff:"Fácil", type:"input", points:10,
        prompt:"4) Calcula ∫ (1/x) dx = ________ + C",
        placeholder:"Ej: ln|x|",
        validate:(raw)=> {
          const n = normalize(raw);
          return n === normalize("ln|x|") || n === normalize("ln(x)") || n === normalize("ln(abs(x))");
        },
        explainOk:"Correcto: ∫(1/x) dx = ln|x| + C.",
        explainBad:"Pista: 1/x es el caso especial que produce logaritmo natural: ln|x|."
      },

      // NIVEL 2 — MEDIO (4)
      {
        level: 2, diff:"Medio", type:"mcq", points:15,
        prompt:"5) Sustitución: ∫ 2x·(x²+1)³ dx",
        choices:["(x²+1)⁴ + C","(x²+1)⁴/4 + C","2(x²+1)⁴ + C","(x²+1)³ + C"],
        answerIndex:1,
        explainOk:"u=x²+1 ⇒ du=2x dx. ∫u³ du = u⁴/4 + C ⇒ (x²+1)⁴/4 + C.",
        explainBad:"Error típico: integrar u³ como u⁴ sin /4. Recuerda dividir entre 4."
      },
      {
        level: 2, diff:"Medio", type:"input", points:15,
        prompt:"6) Si u = 3x−2, entonces du = ______ dx",
        placeholder:"Escribe solo el número (ej: 3)",
        validate:(raw)=> normalize(raw) === "3",
        explainOk:"Correcto: d(3x−2)/dx = 3 ⇒ du = 3 dx.",
        explainBad:"Pista: deriva u respecto a x. Te queda 3."
      },
      {
        level: 2, diff:"Medio", type:"mcq", points:15,
        prompt:"7) Propiedad: ∫(f(x) + g(x)) dx =",
        choices:["∫f(x) dx + ∫g(x) dx","∫f(x) dx · ∫g(x) dx","∫f(x) dx − ∫g(x) dx","No se puede separar"],
        answerIndex:0,
        explainOk:"Correcto: linealidad ⇒ se integra término a término.",
        explainBad:"Error típico: creer que no se separa. Sí se puede por linealidad."
      },
      {
        level: 2, diff:"Medio", type:"mcq", points:15,
        prompt:"8) ∫ (1/(x+5)) dx =",
        choices:["ln|x| + C","ln|x+5| + C","1/(x+5) + C","(x+5)²/2 + C"],
        answerIndex:1,
        explainOk:"Correcto: es 1/u con u=x+5 ⇒ ln|x+5| + C.",
        explainBad:"Pista: el logaritmo debe llevar el mismo (x+5)."
      },

      // NIVEL 3 — DIFÍCIL (4)
      {
        level: 3, diff:"Difícil", type:"mcq", points:20,
        prompt:"9) Por partes: ∫ x·e^x dx",
        choices:["x·e^x + C","e^x(x−1) + C","e^x(x+1) + C","e^x/x + C"],
        answerIndex:1,
        explainOk:"u=x, dv=e^x dx ⇒ v=e^x. ∫x e^x dx = x e^x − ∫e^x dx = e^x(x−1)+C.",
        explainBad:"Error típico: olvidar el “− ∫v du”. Por partes: u·v − ∫v du."
      },
      {
        level: 3, diff:"Difícil", type:"input", points:20,
        prompt:"10) Por partes: si dv = dx, entonces v = ________",
        placeholder:"Ej: x",
        validate:(raw)=> normalize(raw) === "x",
        explainOk:"Correcto: v = ∫dx = x.",
        explainBad:"Pista: integra dv. Si dv=dx, la integral es x."
      },
      {
        level: 3, diff:"Difícil", type:"mcq", points:20,
        prompt:"11) ∫ sin(3x) dx =",
        choices:["−cos(3x) + C","−(1/3)cos(3x) + C","(1/3)cos(3x) + C","cos(3x) + C"],
        answerIndex:1,
        explainOk:"u=3x ⇒ dx=du/3. ∫sin(u) du/3 = −cos(u)/3 + C = −(1/3)cos(3x)+C.",
        explainBad:"Error típico: olvidar el factor 1/3 por el 3x."
      },
      {
        level: 3, diff:"Difícil", type:"mcq", points:20,
        prompt:"12) Mejor elección para ∫ x·cos(x) dx (por partes):",
        choices:["u=cos(x), dv=x dx","u=x, dv=cos(x) dx","u=x·cos(x), dv=dx","No se puede por partes"],
        answerIndex:1,
        explainOk:"Correcto: por LIATE, u=x (algebraica) y dv=cos(x)dx. Se simplifica al derivar u.",
        explainBad:"Pista: elige u para que al derivar se simplifique (x → 1)."
      },
    ];
  }

  getByLevel(level){
    return this.questions.filter(q => q.level === level);
  }
}
