function normalize(s) {
  return (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .replaceAll(" ", "")
    .replaceAll("á", "a").replaceAll("é", "e").replaceAll("í", "i").replaceAll("ó", "o").replaceAll("ú", "u")
    .replaceAll("ñ", "n");
}

export class QuestionBank {
  constructor() {
    this.questions = [
      // Nivel 1 — Fácil (Convertidas a selección única)
      {
        level: 1,
        type: "mcq",
        prompt: "∫ 7x^3 dx",
        choices: [
          "7x^4/4 + C",
          "(7/4)x^4 + C",
          "7/4 x^4 + C",
          "7x^4/4"
        ],
        answerIndex: 0, // La respuesta correcta es la primera opción
        points: 10,
        explainOk: "Aplicando la regla de potencia: ∫x^n dx = x^(n+1)/(n+1) + C.",
        explainBad: "Recuerda aumentar el exponente en 1 y dividir por ese nuevo exponente."
      },

      {
        level: 1,
        type: "mcq",
        prompt: "∫ e^x dx",
        choices: [
          "e^x + C",
          "e^x"
        ],
        answerIndex: 0, // La respuesta correcta es la primera opción
        points: 10,
        explainOk: "La integral de e^x es e^x + C.",
        explainBad: "La derivada de e^x es e^x, por eso su integral es e^x + C."
      },

      {
        level: 1,
        type: "mcq",
        prompt: "∫ √x dx",
        choices: [
          "2/3 x^(3/2) + C",
          "x^(3/2) + C",
          "x^2/2 + C",
          "x^(1/2) + C"
        ],
        answerIndex: 0, // La respuesta correcta es la primera opción
        points: 10,
        explainOk: "√x = x^(1/2), luego ∫x^(1/2) dx = 2/3 x^(3/2) + C.",
        explainBad: "Recuerda que la raíz cuadrada es x^(1/2) y se aplica la regla de potencia."
      },

      {
        level: 1,
        type: "mcq",
        prompt: "∫ 1/x dx",
        choices: [
          "ln|x| + C",
          "1/(x^2) + C",
          "x + C",
          "e^x + C"
        ],
        answerIndex: 0, // La respuesta correcta es la primera opción
        points: 10,
        explainOk: "∫1/x dx = ln|x| + C.",
        explainBad: "Esta es la integral logarítmica básica: ln|x| + C."
      },

      // Nivel 2 — Medio (Sustitución)
      {
        level: 2,
        type: "mcq",
        prompt: "∫ 2x cos(x^2) dx",
        choices: [
          "sin(x^2) + C",
          "cos(x^2) + C",
          "2 sin(x^2) + C",
          "x sin(x^2) + C"
        ],
        answerIndex: 0, // La respuesta correcta es la primera opción
        points: 15,
        explainOk: "Con u = x^2, du = 2x dx → ∫cos(u) du = sin(u) + C.",
        explainBad: "Usa sustitución u = x^2 para simplificar la integral."
      },

      {
        level: 2,
        type: "input",
        prompt: "∫ 1/(2x - 1) dx",
        answers: ["(1/2) ln|2x - 1| + C", "(1/2) ln|u| + C", "(1/2) ln|2x - 1|"],
        points: 15,
        explainOk: "Con u = 2x - 1, du = 2 dx → ∫1/u du = ln|u| + C.",
        explainBad: "Recuerda dividir por 2 cuando realices la sustitución.",
        validate: (raw) => {
          const a = normalize(raw);
          return a.includes("1/2") && a.includes("ln");
        }
      },

      {
        level: 2,
        type: "input",
        prompt: "∫ e^{4x} dx",
        answers: ["(1/4)e^{4x} + C", "1/4 e^{4x} + C", "e^{4x}/4 + C"],
        points: 15,
        explainOk: "Con u=4x, du=4 dx → ∫e^u du/4 = (1/4)e^u + C.",
        explainBad: "No olvides dividir por la derivada interna (4).",
        validate: (raw) => {
          const a = normalize(raw);
          return a.includes("1/4") && (a.includes("e4x") || a.includes("e^4x") || a.includes("e4"));
        }
      },

      {
        level: 2,
        type: "mcq",
        prompt: "Si u = x^2 + 1, ¿cuál es du/dx?",
        choices: [
          "2x",
          "x",
          "1",
          "2"
        ],
        answerIndex: 0, // La respuesta correcta es la primera opción
        points: 10,
        explainOk: "Derivando u = x^2 + 1 se obtiene du/dx = 2x.",
        explainBad: "Aplícale la regla de potencia al término x^2."
      },

      // Nivel 3 — Difícil (Por partes, trigonométricas, raíces)
      {
        level: 3,
        type: "mcq",
        prompt: "∫ x sin(x) dx",
        choices: [
          "−x cos(x) + sin(x) + C",
          "x cos(x) + C",
          "cos(x) + C",
          "sin(x) + C"
        ],
        answerIndex: 0, // La respuesta correcta es la primera opción
        points: 20,
        explainOk: "Por partes con u=x y dv=sin x dx produce −x cos x + sin x + C.",
        explainBad: "No olvides el signo al integrar sin(x)."
      },

      {
        level: 3,
        type: "mcq",
        prompt: "∫ dx / sqrt(9 - x^2)",
        choices: [
          "arcsin(x/3) + C",
          "arcsen(x/3) + C",
          "arcsin(x/3)"
        ],
        answerIndex: 0, // La respuesta correcta es la primera opción
        points: 20,
        explainOk: "Fórmula estándar: ∫ dx / sqrt(a^2 - x^2) = arcsin(x/a) + C, con a=3.",
        explainBad: "Reconoce la forma a^2 - x^2 y usa arcsin(x/a)."
      },

      {
        level: 3, diff: "Difícil", type: "mcq", points: 20,
        prompt: "11) ∫ √(9−x²) dx =",
        choices: ["arcsen(x/3) + C", "arcsen(x) + C", "−(1/3)cos(3x) + C", "cos(3x) + C"],
        answerIndex: 0,
        explainOk: "Fórmula estándar: ∫ dx / √(a² − x²) = arcsen(x/a) + C. Aquí a = 3, entonces el resultado es arcsen(x/3) + C.",
        explainBad: "Error común: no reconocer que es una integral estándar de arco seno."
      },
      {
        level: 3, diff: "Difícil", type: "mcq", points: 20,
        prompt: "12) ∫ x sin(x) dx (Por partes)",
        choices: ["u = x, dv = sin(x) dx", "u = sin(x), dv = x dx", "u = x·sin(x), dv = dx", "No se puede por partes"],
        answerIndex: 0,
        explainOk: "Correcto: por LIATE, u = x (algebraica) y dv = sin(x)dx. Al derivar u se simplifica la expresión.",
        explainBad: "Pista: elige u para que al derivar se obtenga algo simple como una constante."
      }
    ];
  }

  getByLevel(level) {
    return this.questions.filter(q => q.level === level); // Filtra las preguntas por el nivel
  }
}


