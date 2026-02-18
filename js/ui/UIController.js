import { PodiumService } from "../podium/PodiumService.js";
import { AudioService } from "../audio/AudioService.js";

export class UIController {
  constructor({
    toast, auth, quiz, avatarService,
    bank, stats, ach, achievements,
    getUnlocks, saveUnlocks, storage
  }) {
    this.toast = toast;
    this.auth = auth;
    this.quiz = quiz;
    this.avatarService = avatarService;
    this.podiumService = new PodiumService();
    this.audio = new AudioService({
      musicSrc: "/audio/music.mp3",
      sfx: {
        click: "/audio/click.mp3",
        ok: "/audio/correct.mp3",
        bad: "/audio/wrong.mp3",
        levelup: "/audio/levelup.mp3",
      }
    });

    // ✅ nuevos servicios / helpers
    this.bank = bank;
    this.stats = stats;
    this.ach = ach;
    this.achievements = achievements;
    this.getUnlocks = getUnlocks;
    this.saveUnlocks = saveUnlocks;
    this.storage = storage;

    // runtime para rachas + logros
    this.runtime = {
      streak: 0,
      lastLevelCompleted: null,
      livesAtEnd: null,
      points: 0
    };

    // DOM
    this.$ = (s) => document.querySelector(s);

    this.el = {
      // header/hud
      userPill: this.$("#userPill"),
      hudAvatar: this.$("#hudAvatar"),
      hudName: this.$("#hudName"),
      hudMeta: this.$("#hudMeta"),

      btnOpenAuth: this.$("#btnOpenAuth"),
      btnLogout: this.$("#btnLogout"),
      btnReset: this.$("#btnReset"),
      btnRules: this.$("#btnRules"),

      // stats
      statLevel: this.$("#statLevel"),
      statPoints: this.$("#statPoints"),
      statLives: this.$("#statLives"),
      progressBar: this.$("#progressBar"),
      progressText: this.$("#progressText"),

      // question
      diffBadge: this.$("#diffBadge"),
      qCounter: this.$("#qCounter"),
      qPrompt: this.$("#qPrompt"),
      qBody: this.$("#qBody"),
      feedback: this.$("#feedback"),
      fbTitle: this.$("#fbTitle"),
      fbDesc: this.$("#fbDesc"),
      btnNext: this.$("#btnNext"),
      btnSkip: this.$("#btnSkip"),

      // auth overlay
      overlay: this.$("#authOverlay"),
      tabLogin: this.$("#tabLogin"),
      tabRegister: this.$("#tabRegister"),
      loginPane: this.$("#loginPane"),
      registerPane: this.$("#registerPane"),
      btnCloseAuth1: this.$("#btnCloseAuth1"),
      btnCloseAuth2: this.$("#btnCloseAuth2"),
      btnLogin: this.$("#btnLogin"),
      btnRegister: this.$("#btnRegister"),

      loginUser: this.$("#loginUser"),
      loginPass: this.$("#loginPass"),
      regUser: this.$("#regUser"),
      regPass: this.$("#regPass"),
      regInitial: this.$("#regInitial"),

      facePicker: this.$("#facePicker"),
      outfitPicker: this.$("#outfitPicker"),
      colorPicker: this.$("#colorPicker"),
    };

    this.lastQuestion = null;
    this.awaitingNext = false;
  }

  init() {
    this.bindEvents();
    this.mountAvatarPickers();      // se puede montar sin sesión
    this.restoreSessionIfAny();     // si hay sesión, luego lo recalculamos
    this.mountAvatarPickers();      // ✅ vuelve a montar ya con unlocks del usuario
    this.renderAll();
    this.el.btnRules?.setAttribute("aria-expanded", "false");
  }

  bindEvents() {
    // auth open/close
    this.el.btnOpenAuth?.addEventListener("click", () => this.openAuth());
    this.el.btnCloseAuth1?.addEventListener("click", () => this.closeAuth());
    this.el.btnCloseAuth2?.addEventListener("click", () => this.closeAuth());


    // tabs
    this.el.tabLogin?.addEventListener("click", () => this.switchTab("login"));
    this.el.tabRegister?.addEventListener("click", () => this.switchTab("register"));

    // actions
    this.el.btnLogin?.addEventListener("click", () => this.handleLogin());
    this.el.btnRegister?.addEventListener("click", () => this.handleRegister());

    this.el.btnLogout?.addEventListener("click", () => this.handleLogout());
    this.el.btnReset?.addEventListener("click", () => {
      if (!this.quiz.isLoggedIn()) return this.toast.show("Primero inicia sesión.");
      this.openResetModal();
    });

    this.el.btnNext?.addEventListener("click", () => this.next());
    this.el.btnSkip?.addEventListener("click", () => this.skip());

    const btnStats = document.createElement("button");
    btnStats.className = "btn btn-cyan";
    btnStats.textContent = "Historial";
    btnStats.addEventListener("click", () => this.openStatsModal());
    document.querySelector(".topActions")?.prepend(btnStats);

    const btnAch = document.createElement("button");
    btnAch.className = "btn btn-purple";
    btnAch.textContent = "Logros";
    btnAch.addEventListener("click", () => this.openAchievementsModal());
    document.querySelector(".topActions")?.prepend(btnAch);

    document.addEventListener("click", () => this.audio.unlock(), { once: true });


    const btnAudio = document.createElement("button");
    btnAudio.className = "btn ghost";
    btnAudio.textContent = "🔊 Audio";
    btnAudio.addEventListener("click", () => {
      const on = this.audio.toggleMute();
      btnAudio.textContent = on ? "🔊 Audio" : "🔇 Mute";
    });
    document.querySelector(".topActions")?.prepend(btnAudio);


    const btnAdmin = document.createElement("button");
    btnAdmin.className = "btn btn-blue";
    btnAdmin.textContent = "Banco de preguntas";
    btnAdmin.addEventListener("click", () => this.openBankAdmin());
    document.querySelector(".topActions")?.prepend(btnAdmin);

  }

  /* =========================
     PODIO
  ========================= */
  createPodiumPanel() {
    if (document.getElementById("podiumPanel")) return;

    const div = document.createElement("aside");
    div.id = "podiumPanel";
    div.className = "card podium-panel";
    div.innerHTML = `
      <div class="podium-head">
        <h2 id="podiumTitle">🏆 Resultados Finales</h2>
        <div class="podium-controls">
          <label for="podiumViewSelect" class="small">Ver:</label>
          <select id="podiumViewSelect">
            <option value="current">Nivel actual</option>
            <option value="global">Global</option>
            <option value="1">Nivel 1</option>
            <option value="2">Nivel 2</option>
            <option value="3">Nivel 3</option>
          </select>
        </div>
      </div>
      <div id="podiumList" class="podium-list"></div>
    `;

    const mainGrid = document.querySelector("main.grid");
    if (mainGrid) mainGrid.appendChild(div);
    else document.body.appendChild(div);

    div.querySelector("#podiumViewSelect")?.addEventListener("change", () => this.renderPodium());
  }

  renderPodium() {
    this.createPodiumPanel();

    const list = document.getElementById("podiumList");
    if (!list) return;
    list.innerHTML = "";

    const sel = document.getElementById("podiumViewSelect");
    const view = sel ? sel.value : "current";
    const titleEl = document.getElementById("podiumTitle");

    let top = [];
    if (view === "global") {
      top = this.podiumService.getGlobalTop();
      if (titleEl) titleEl.textContent = `🏆 Resultados — Global`;
    } else if (view === "current") {
      const level = this.quiz?.level ?? 1;
      top = this.podiumService.getTopPlayers(level);
      if (titleEl) titleEl.textContent = `🏆 Resultados — Nivel ${level}`;
      if (sel) sel.value = "current";
    } else {
      const lvl = Number(view) || 1;
      top = this.podiumService.getTopPlayers(lvl);
      if (titleEl) titleEl.textContent = `🏆 Resultados — Nivel ${lvl}`;
    }

    top.forEach((player, index) => {
      const position = index + 1;
      const medal = position === 1 ? "🥇" : position === 2 ? "🥈" : "🥉";

      const item = document.createElement("div");
      item.className = "podium-item";
      item.innerHTML = `
        <h3>${medal} ${position}° Lugar — ${player.username}</h3>
        <p>⭐ Puntos: ${player.points}</p>
        <p>🏅 Nivel: ${player.level}</p>
        <p>❤ Vidas: ${player.lives}</p>
        <p>✅ Correctas: ${player.correct}</p>
        <p>❌ Incorrectas: ${player.incorrect}</p>
      `;
      list.appendChild(item);
    });
  }

  /* =========================
     AVATAR PICKERS (con lock)
  ========================= */
  mountAvatarPickers() {
    let outfits = this.avatarService.outfits;

    // si NO hay usuario: no mostrar locked
    if (!this.quiz.user) {
      outfits = outfits.filter(o => !o.locked);
    } else {
      const unlocks = this.getUnlocks(this.storage, this.quiz.user.username);
      outfits = outfits.filter(o => {
        if (!o.locked) return true;
        if (o.id === "cape") return !!unlocks.cape;
        if (o.id === "labcoat") return !!unlocks.labcoat;
        return false;
      });
    }

    // hack: swap temporal para dibujar picker
    const original = this.avatarService.outfits;
    this.avatarService.outfits = outfits;

    this.avatarService.mountPickers({
      faceContainer: this.el.facePicker,
      outfitContainer: this.el.outfitPicker,
      colorContainer: this.el.colorPicker,
      onChange: () => { }
    });

    this.avatarService.outfits = original;
  }

  /* =========================
     RESET MODAL
  ========================= */
  createResetModal() {
    if (document.getElementById("resetModal")) return;

    const ov = document.createElement("div");
    ov.id = "resetModal";
    ov.className = "overlay";
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-modal", "true");
    ov.innerHTML = `
      <div class="card" style="max-width:420px;margin:16px;">
        <h2>Reiniciar nivel</h2>
        <p class="muted">Elige qué nivel quieres reiniciar.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
          <button class="btn" data-level="current">Reiniciar nivel actual</button>
          <button class="btn" data-level="1">Reiniciar Nivel 1</button>
          <button class="btn" data-level="2">Reiniciar Nivel 2</button>
          <button class="btn" data-level="3">Reiniciar Nivel 3</button>
          <button class="btn ghost" data-level="cancel">Cancelar</button>
        </div>
      </div>
    `;
    document.body.appendChild(ov);

    ov.addEventListener("click", (e) => {
      if (e.target === ov) this.closeResetModal();
      const btn = e.target.closest("button[data-level]");
      if (!btn) return;
      const lvl = btn.dataset.level;

      if (lvl === "cancel") return this.closeResetModal();
      if (lvl === "current") return this.handleResetLevel();
      const n = Number(lvl);
      if (Number.isInteger(n)) return this.handleResetLevel(n);
    });
  }

  openResetModal() {
    this.createResetModal();
    document.getElementById("resetModal")?.classList.add("show");
  }

  closeResetModal() {
    document.getElementById("resetModal")?.classList.remove("show");
  }

  handleResetLevel(level) {
    this.quiz.resetLevel(level);
    this.closeResetModal();
    this.clearFeedback();
    this.renderAll();
  }

  /* =========================
     STATS MODAL
  ========================= */
  createStatsModal() {
    if (document.getElementById("statsOverlay")) return;

    const ov = document.createElement("div");
    ov.id = "statsOverlay";
    ov.className = "overlay";
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-modal", "true");
    ov.innerHTML = `
      <div class="card" style="max-width:820px; width:100%; position:relative;">
        <button class="btn ghost" id="btnCloseStats" style="position:absolute; right:12px; top:12px;">Cerrar</button>
        <h2>📊 Analíticas</h2>
        <div id="statsBody" class="rules"></div>
      </div>
    `;
    document.body.appendChild(ov);

    ov.addEventListener("click", (e) => { if (e.target === ov) this.closeStatsModal(); });
    ov.querySelector("#btnCloseStats").addEventListener("click", () => this.closeStatsModal());
  }

  openStatsModal() {
    this.createStatsModal();
    this.renderStats();
    document.getElementById("statsOverlay")?.classList.add("show");
  }

  closeStatsModal() {
    document.getElementById("statsOverlay")?.classList.remove("show");
  }

  renderStats() {
    const body = document.getElementById("statsBody");
    if (!body) return;

    if (!this.quiz.user) {
      body.innerHTML = `<div class="rule"><b>Inicia sesión</b> para ver tus stats.</div>`;
      return;
    }

    const u = this.quiz.user.username;
    const s = this.stats.getUserStats(u);

    if (!s) {
      body.innerHTML = `<div class="rule">Aún no hay datos. Juega unas preguntas 🙂</div>`;
      return;
    }

    const total = s.totalCorrect + s.totalIncorrect;
    const pct = total ? Math.round((s.totalCorrect / total) * 100) : 0;

    const byLevelHtml = Object.keys(s.byLevel || {})
      .sort((a, b) => Number(a) - Number(b))
      .map(l => {
        const x = s.byLevel[l];
        const t = x.correct + x.incorrect;
        const p = t ? Math.round((x.correct / t) * 100) : 0;
        return `<div class="rule"><b>Nivel ${l}:</b> ✅ ${x.correct} / ❌ ${x.incorrect} — <b>${p}%</b></div>`;
      }).join("");

    const last = (s.sessions || []).slice(0, 5).map(ss => {
      const date = new Date(ss.at);
      return `<div class="rule"><b>${date.toLocaleString()}</b> — Nivel ${ss.level}, ${ss.points} pts (✅${ss.correct} ❌${ss.incorrect})</div>`;
    }).join("");

    body.innerHTML = `
      <div class="rule"><b>Precisión total:</b> ${pct}% (✅ ${s.totalCorrect} / ❌ ${s.totalIncorrect})</div>
      <div class="divider"></div>
      <h3 style="margin:0 0 8px;">Por nivel</h3>
      ${byLevelHtml || `<div class="rule">Sin datos por nivel.</div>`}
      <div class="divider"></div>
      <h3 style="margin:0 0 8px;">Últimas sesiones</h3>
      ${last || `<div class="rule">Aún no hay sesiones registradas.</div>`}
    `;
  }

  /* =========================
     ACHIEVEMENTS MODAL
  ========================= */
  createAchievementsModal() {
    if (document.getElementById("achOverlay")) return;

    const ov = document.createElement("div");
    ov.id = "achOverlay";
    ov.className = "overlay";
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-modal", "true");
    ov.innerHTML = `
      <div class="card" style="max-width:820px; width:100%; position:relative;">
        <button class="btn ghost" id="btnCloseAch" style="position:absolute; right:12px; top:12px;">Cerrar</button>
        <h2>🏆 Logros</h2>
        <div id="achBody" class="rules"></div>
      </div>
    `;
    document.body.appendChild(ov);

    ov.addEventListener("click", (e) => { if (e.target === ov) this.closeAchievementsModal(); });
    ov.querySelector("#btnCloseAch").addEventListener("click", () => this.closeAchievementsModal());
  }

  openAchievementsModal() {
    this.createAchievementsModal();
    this.renderAchievements();
    document.getElementById("achOverlay")?.classList.add("show");
  }

  closeAchievementsModal() {
    document.getElementById("achOverlay")?.classList.remove("show");
  }

  renderAchievements() {
    const body = document.getElementById("achBody");
    if (!body) return;

    if (!this.quiz.user) {
      body.innerHTML = `<div class="rule"><b>Inicia sesión</b> para ver tus logros.</div>`;
      return;
    }

    const u = this.quiz.user.username;
    const unlocked = this.ach.getUnlocked(u);

    body.innerHTML = (this.achievements || []).map(a => {
      const is = !!unlocked[a.id];
      return `
        <div class="rule">
          <b>${is ? "✅" : "⬜"} ${a.title}</b><br/>
          <span class="muted">${a.desc}</span>
        </div>
      `;
    }).join("") || `<div class="rule">Sin logros definidos.</div>`;
  }

  /* =========================
     BANK ADMIN
  ========================= */
  createBankAdminModal() {
    if (document.getElementById("bankOverlay")) return;

    const ov = document.createElement("div");
    ov.id = "bankOverlay";
    ov.className = "overlay";
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-modal", "true");

    ov.innerHTML = `
      <div class="card" style="max-width:920px; width:100%; position:relative;">
        <button class="btn ghost" id="btnCloseBank" style="position:absolute; right:12px; top:12px;">Cerrar</button>
        <h2>🛠 Banco de preguntas (Admin)</h2>
        <p class="muted">Exporta/importa el banco en JSON.</p>

        <div style="display:flex; gap:10px; flex-wrap:wrap; margin:10px 0;">
          <button class="btn" id="btnExportBank">Exportar JSON</button>
          <button class="btn" id="btnImportBank">Importar JSON</button>
          <button class="btn danger" id="btnResetBank">Volver a banco por defecto</button>
        </div>

        <textarea id="bankTextarea" style="width:100%; min-height:320px; border-radius:12px; padding:12px;"></textarea>
      </div>
    `;
    document.body.appendChild(ov);

    ov.addEventListener("click", (e) => { if (e.target === ov) this.closeBankAdmin(); });
    ov.querySelector("#btnCloseBank").addEventListener("click", () => this.closeBankAdmin());

    ov.querySelector("#btnExportBank").addEventListener("click", () => {
      ov.querySelector("#bankTextarea").value = this.bank.exportJSON();
      this.toast.show("Exportado. Copia y guarda el JSON.");
    });

    ov.querySelector("#btnImportBank").addEventListener("click", () => {
      const ta = ov.querySelector("#bankTextarea");
      const res = this.bank.importJSON(ta.value);
      this.toast.show(res.msg);
      if (res.ok && this.quiz.isLoggedIn()) {
        this.quiz.startLevel(this.quiz.level);
        this.clearFeedback();
        this.renderAll();
      }
    });

    ov.querySelector("#btnResetBank").addEventListener("click", () => {
      this.bank.resetToDefault();
      ov.querySelector("#bankTextarea").value = this.bank.exportJSON();
      this.toast.show("Banco restaurado.");
      if (this.quiz.isLoggedIn()) {
        this.quiz.startLevel(this.quiz.level);
        this.clearFeedback();
        this.renderAll();
      }
    });
  }

  openBankAdmin() {
    const PIN = "1234";
    const ok = prompt("PIN de Admin del banco (default 1234):");
    if (ok !== PIN) return this.toast.show("PIN incorrecto.");

    this.createBankAdminModal();
    const ov = document.getElementById("bankOverlay");
    if (ov) {
      ov.classList.add("show");
      ov.querySelector("#bankTextarea").value = this.bank.exportJSON();
    }
  }

  closeBankAdmin() {
    document.getElementById("bankOverlay")?.classList.remove("show");
  }

  /* =========================
     AUTH FLOW
  ========================= */
  restoreSessionIfAny() {
    const r = this.auth.tryRestoreSession();
    if (r.ok) {
      this.quiz.loadUser(r.user);
      // al restaurar, refresca pickers según unlocks
      this.mountAvatarPickers();
    }
  }

  openAuth() {
    this.el.overlay.classList.add("show");
    this.switchTab("login");
  }

  closeAuth() {
    this.el.overlay.classList.remove("show");
  }

  switchTab(mode) {
    const login = (mode === "login");
    this.el.tabLogin.classList.toggle("active", login);
    this.el.tabRegister.classList.toggle("active", !login);
    this.el.loginPane.style.display = login ? "block" : "none";
    this.el.registerPane.style.display = login ? "none" : "block";
    this.el.tabLogin.setAttribute("aria-selected", login ? "true" : "false");
    this.el.tabRegister.setAttribute("aria-selected", !login ? "true" : "false");
  }

  handleRegister() {
    const res = this.auth.register({
      usernameRaw: this.el.regUser.value,
      pass: this.el.regPass.value,
      initialRaw: this.el.regInitial.value
    });

    this.toast.show(res.msg);
    if (res.ok) {
      this.switchTab("login");
      this.el.loginUser.value = res.username;
      this.el.loginPass.value = "";
      this.el.regUser.value = "";
      this.el.regPass.value = "";
      this.el.regInitial.value = "";

      this.audio.playMusic();
    }
  }

  handleLogin() {
    const res = this.auth.login({
      usernameRaw: this.el.loginUser.value,
      pass: this.el.loginPass.value
    });

    this.toast.show(res.msg);
    if (!res.ok) return;

    this.quiz.loadUser(res.user);
    this.closeAuth();

    // refrescar pickers con unlocks
    this.mountAvatarPickers();

    this.clearFeedback();
    this.renderAll();
  }

  handleLogout() {
    const res = this.auth.logout();
    this.quiz.logout();

    // reset runtime
    this.runtime = { streak: 0, lastLevelCompleted: null, livesAtEnd: null, points: 0 };

    // al salir, vuelve a ocultar locked
    this.mountAvatarPickers();

    this.toast.show(res.msg);
    this.clearFeedback();
    this.renderAll();

    this.audio.stopMusic();

  }

  /* =========================
     RENDER HUD + QUESTION
  ========================= */
  renderAll() {
    this.renderHUD();
    this.renderQuestion();
    this.renderPodium();
  }

  renderHUD() {
    const logged = this.quiz.isLoggedIn();
    this.el.btnOpenAuth.style.display = logged ? "none" : "inline-block";
    this.el.btnLogout.style.display = logged ? "inline-block" : "none";
    this.el.userPill.style.display = logged ? "flex" : "none";

    if (!logged) {
      this.el.statLevel.textContent = "—";
      this.el.statPoints.textContent = "—";
      this.el.statLives.textContent = "—";
      this.el.progressBar.style.width = "0%";
      this.el.progressText.textContent = "—";
      this.el.hudName.textContent = "Usuario";
      this.el.hudMeta.textContent = "—";
      this.el.hudAvatar.innerHTML = "";
      return;
    }

    const prog = this.quiz.getProgress();
    this.el.statLevel.textContent = `Nivel ${this.quiz.level}`;
    this.el.statPoints.textContent = `${this.quiz.points} pts`;
    this.el.statLives.textContent = "❤".repeat(this.quiz.lives);

    this.el.progressBar.style.width = `${prog.pct}%`;
    this.el.progressText.textContent = `${prog.done} / ${prog.total} preguntas del nivel completadas`;

    this.el.hudName.textContent = this.quiz.user.username;
    this.el.hudMeta.textContent = `Nivel ${this.quiz.level} • ${this.quiz.points} pts`;

    this.avatarService.renderAvatar(this.el.hudAvatar, this.quiz.user.avatar);
  }

  clearFeedback() {
    this.el.feedback.classList.remove("ok", "bad", "show");
    this.el.fbTitle.textContent = "—";
    this.el.fbDesc.textContent = "—";
  }

  setFeedback(kind, title, desc) {
    this.el.feedback.classList.remove("ok", "bad", "show");
    this.el.feedback.classList.add("show", kind);
    this.el.fbTitle.textContent = title;
    this.el.fbDesc.textContent = desc;
  }

  renderQuestion() {
    this.el.btnNext.disabled = true;
    this.el.btnSkip.disabled = true;
    this.awaitingNext = false;
    this.lastQuestion = null;

    if (!this.quiz.isLoggedIn()) {
      this.el.qPrompt.textContent = "Inicia sesión para comenzar.";
      this.el.qBody.innerHTML = "";
      return;
    }

    if (this.quiz.isLevelComplete()) {
      if (this.quiz.canAdvance()) {
        this.setFeedback("ok", "¡Nivel completado!", "Presiona “Siguiente” para avanzar.");
        this.el.btnNext.disabled = false;
        return;
      }

      this.setFeedback("ok", "¡Juego completado!", "Terminaste todos los niveles.");
      this.onSessionEnd();
      this.el.btnNext.disabled = true;
      this.el.btnSkip.disabled = true;
      this.renderPodium();
      return;
    }

    const q = this.quiz.getNextQuestion();
    if (!q) {
      this.el.qPrompt.textContent = "Sin preguntas disponibles.";
      this.el.qBody.innerHTML = "";
      return;
    }

    this.lastQuestion = q;
    this.el.qPrompt.textContent = q.prompt;
    this.el.qBody.innerHTML = "";

    if (q.type === "mcq") {
      const wrap = document.createElement("div");
      wrap.className = "choices";

      q.choices.forEach((c, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "choice";
        btn.textContent = c;
        btn.addEventListener("click", () => this.answerMCQ(idx));
        wrap.appendChild(btn);
      });

      this.el.qBody.appendChild(wrap);
    }

    if (q.type === "input") {
      const row = document.createElement("div");
      row.className = "inputRow";

      const input = document.createElement("input");
      input.id = "freeInput";
      input.placeholder = q.placeholder || "Escribe tu respuesta";

      const btn = document.createElement("button");
      btn.textContent = "Verificar";
      btn.className = "btn primary";
      btn.addEventListener("click", () => this.answerInput(input.value));

      row.appendChild(input);
      row.appendChild(btn);
      this.el.qBody.appendChild(row);
    }

    this.el.btnSkip.disabled = false;
  }

  /* =========================
     ANSWERS + STATS + ACH
  ========================= */
  answerMCQ(index) {
    if (!this.lastQuestion || this.awaitingNext) return;

    const res = this.quiz.submitAnswer(this.lastQuestion, { index });

    // stats
    if (this.quiz.user) {
      this.stats.recordAnswer({
        username: this.quiz.user.username,
        level: this.quiz.level,
        correct: res.correct
      });

      this.audio.playSfx("ok");
      this.audio.playSfx("bad");
    }

    // racha
    this.runtime.streak = res.correct ? (this.runtime.streak + 1) : 0;
    this.runtime.points = this.quiz.points;

    // bloquear opciones
    const choices = this.el.qBody.querySelectorAll(".choice");
    choices.forEach(btn => btn.disabled = true);

    if (res.correct) {
      this.setFeedback("ok", res.title, res.desc);
      this.el.hudAvatar.classList.remove("sparkle");
      void this.el.hudAvatar.offsetWidth;
      this.el.hudAvatar.classList.add("sparkle");
    } else {
      this.setFeedback("bad", res.title, res.desc);
      const correctBtn = choices[this.lastQuestion.answerIndex];
      if (correctBtn) correctBtn.classList.add("correct-answer");
    }

    // logros
    if (res.levelCompleted) {
      this.runtime.lastLevelCompleted = this.quiz.level;
      this.runtime.livesAtEnd = this.quiz.lives;
    }
    this.checkAchievements();

    // sin vidas
    if (res.endedByLives) {
      this.onSessionEnd();
      this.el.btnNext.disabled = true;
      this.el.btnSkip.disabled = true;
      this.renderHUD();
      this.renderPodium();
      return;
    }

    this.awaitingNext = true;
    this.el.btnNext.disabled = false;
    this.el.btnSkip.disabled = true;
    this.renderHUD();
  }

  answerInput(value) {
    if (!this.lastQuestion || this.awaitingNext) return;

    const res = this.quiz.submitAnswer(this.lastQuestion, { value });

    // stats
    if (this.quiz.user) {
      this.stats.recordAnswer({
        username: this.quiz.user.username,
        level: this.quiz.level,
        correct: res.correct
      });
    }

    // racha
    this.runtime.streak = res.correct ? (this.runtime.streak + 1) : 0;
    this.runtime.points = this.quiz.points;

    // bloquear input
    const input = document.getElementById("freeInput");
    const btn = this.el.qBody.querySelector("button");
    if (input) input.disabled = true;
    if (btn) btn.disabled = true;

    if (res.correct) {
      this.setFeedback("ok", res.title, res.desc);
      this.el.hudAvatar.classList.remove("sparkle");
      void this.el.hudAvatar.offsetWidth;
      this.el.hudAvatar.classList.add("sparkle");
    } else {
      this.setFeedback("bad", res.title, res.desc);
    }

    // logros
    if (res.levelCompleted) {
      this.runtime.lastLevelCompleted = this.quiz.level;
      this.runtime.livesAtEnd = this.quiz.lives;
    }
    this.checkAchievements();

    // sin vidas
    if (res.endedByLives) {
      this.onSessionEnd();
      this.el.btnNext.disabled = true;
      this.el.btnSkip.disabled = true;
      this.renderHUD();
      this.renderPodium();
      return;
    }

    this.awaitingNext = true;
    this.el.btnNext.disabled = false;
    this.el.btnSkip.disabled = true;
    this.renderHUD();
  }

  skip() {
    if (!this.lastQuestion) return;

    const res = this.quiz.skipQuestion(this.lastQuestion);

    // stats: omitir cuenta como incorrecta
    if (this.quiz.user) {
      this.stats.recordAnswer({
        username: this.quiz.user.username,
        level: this.quiz.level,
        correct: false
      });
    }

    this.runtime.streak = 0;
    this.runtime.points = this.quiz.points;

    this.setFeedback("bad", res.title, res.desc);
    this.checkAchievements();

    if (res.endedByLives) {
      this.onSessionEnd();
      this.el.btnNext.disabled = true;
      this.el.btnSkip.disabled = true;
      this.renderHUD();
      this.renderPodium();
      return;
    }

    this.el.btnNext.disabled = false;
    this.el.btnSkip.disabled = true;
    this.renderHUD();
  }

  next() {
    if (this.quiz.isLevelComplete()) {
      if (this.quiz.canAdvance()) {
        this.quiz.advanceLevel();
        this.clearFeedback();
        this.renderAll();
      }
      return;
    }
    this.clearFeedback();
    this.renderAll();
  }

  /* =========================
     ACHIEVEMENTS + UNLOCKS
  ========================= */
  checkAchievements() {
    if (!this.quiz.user) return;

    const username = this.quiz.user.username;
    const userStats = this.stats.getUserStats(username) || { totalCorrect: 0, totalIncorrect: 0 };
    const unlocks = this.getUnlocks(this.storage, username);

    this.ach.checkAndUnlock({
      username,
      achievements: this.achievements,
      context: {
        userStats,
        runtime: this.runtime,
        unlocks,
        avatarService: this.avatarService
      }
    });

    this.saveUnlocks(this.storage, username, unlocks);

    // si se desbloqueó algo, refresca picker
    this.mountAvatarPickers();
  }

  onSessionEnd() {
    if (!this.quiz.user) return;

    // podio
    this.podiumService.savePlayer({
      username: this.quiz.user.username,
      points: this.quiz.points,
      level: this.quiz.level,
      lives: this.quiz.lives,
      correct: this.quiz.correctCount,
      incorrect: this.quiz.incorrectCount
    }, this.quiz.level);

    // stats de sesión
    this.stats.recordSessionEnd({
      username: this.quiz.user.username,
      level: this.quiz.level,
      points: this.quiz.points,
      correct: this.quiz.correctCount,
      incorrect: this.quiz.incorrectCount
    });
  }
}
