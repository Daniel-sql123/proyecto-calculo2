import { StorageService } from "./core/StorageService.js";
import { Toast } from "./core/Toast.js";
import { AvatarService } from "./auth/AvatarService.js";
import { AuthService } from "./auth/AuthService.js";

import { QuestionBank } from "./quiz/QuestionBank.js";
import { QuestionBankEditable } from "./quiz/QuestionBankEditable.js";

import { QuizEngine } from "./quiz/QuizEngine.js";
import { UIController } from "./ui/UIController.js";

import { StatsService } from "./stats/StatsService.js";
import { AchievementService } from "./achievements/AchievementService.js";

const storage = new StorageService();
const toast = new Toast(document.querySelector("#toast"));

/* =========================
   SKINS
========================= */
const skins = [
  {
    id: "wizard",
    name: "Mago",
    svg: `
<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" class="skin a-float">
  <defs>
    <linearGradient id="wg1" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#60a5fa"/><stop offset="1" stop-color="#a78bfa"/>
    </linearGradient>
    <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#000" flood-opacity=".25"/>
    </filter>
  </defs>

  <g filter="url(#sh)">
    <path d="M10 26L32 10l22 16-22 6z" fill="url(#wg1)"/>
    <path d="M20 54c2-14 6-22 12-22s10 8 12 22" fill="#fde68a"/>
    <circle cx="26" cy="34" r="3" fill="#111827"/>
    <circle cx="38" cy="34" r="3" fill="#111827"/>
    <g class="a-blink">
      <rect x="23" y="33" width="6" height="2" rx="1" fill="#111827"/>
      <rect x="35" y="33" width="6" height="2" rx="1" fill="#111827"/>
    </g>
    <path d="M28 42c3 2 5 2 8 0" stroke="#111827" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M17 50h30" stroke="#f59e0b" stroke-width="6" stroke-linecap="round"/>
    <circle cx="49" cy="49" r="6" fill="#fbbf24"/>
    <path d="M49 45v8M45 49h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
  </g>
</svg>`
  },

  {
    id: "ninja",
    name: "Ninja",
    svg: `
<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" class="skin a-float">
  <defs>
    <linearGradient id="ng1" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#111827"/><stop offset="1" stop-color="#374151"/>
    </linearGradient>
    <filter id="sh2" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#000" flood-opacity=".28"/>
    </filter>
  </defs>

  <g filter="url(#sh2)">
    <circle cx="32" cy="34" r="18" fill="url(#ng1)"/>
    <rect x="18" y="28" width="28" height="12" rx="6" fill="#0b1220" opacity=".9"/>
    <circle cx="28" cy="34" r="2.6" fill="#60a5fa"/>
    <circle cx="36" cy="34" r="2.6" fill="#60a5fa"/>
    <g class="a-blink">
      <rect x="25" y="33" width="6" height="2" rx="1" fill="#60a5fa"/>
      <rect x="33" y="33" width="6" height="2" rx="1" fill="#60a5fa"/>
    </g>
    <path d="M20 26c6-8 18-8 24 0" stroke="#9ca3af" stroke-width="4" stroke-linecap="round" opacity=".35"/>
    <path d="M20 44c6 6 18 6 24 0" stroke="#9ca3af" stroke-width="3" stroke-linecap="round" opacity=".6"/>
  </g>
</svg>`
  },

  {
    id: "cybercat",
    name: "Gato Cyborg",
    svg: `
<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" class="skin a-float">
  <defs>
    <linearGradient id="cg1" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#fbbf24"/><stop offset="1" stop-color="#fb7185"/>
    </linearGradient>
    <filter id="sh3" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#000" flood-opacity=".25"/>
    </filter>
  </defs>

  <g filter="url(#sh3)">
    <path d="M16 28l-4-10 12 6M48 28l4-10-12 6" fill="url(#cg1)"/>
    <circle cx="32" cy="36" r="18" fill="url(#cg1)"/>
    <circle cx="26" cy="35" r="2.6" fill="#111827"/>
    <circle cx="38" cy="35" r="2.6" fill="#111827"/>
    <g class="a-blink">
      <rect x="23" y="34" width="6" height="2" rx="1" fill="#111827"/>
      <rect x="35" y="34" width="6" height="2" rx="1" fill="#111827"/>
    </g>
    <path d="M30 38h4l-2 2z" fill="#111827"/>
    <path d="M22 41h-9M42 41h9" stroke="#111827" stroke-width="2" stroke-linecap="round" opacity=".75"/>
    <rect x="41" y="30" width="10" height="8" rx="4" fill="#0b1220" opacity=".22"/>
    <path d="M44 34h4" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".9"/>
  </g>
</svg>`
  },

  {
    id: "alien",
    name: "Alien",
    svg: `
<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" class="skin a-float">
  <defs>
    <linearGradient id="ag1" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#34d399"/><stop offset="1" stop-color="#22c55e"/>
    </linearGradient>
    <filter id="sh4" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#000" flood-opacity=".25"/>
    </filter>
  </defs>

  <g filter="url(#sh4)">
    <ellipse cx="32" cy="34" rx="18" ry="20" fill="url(#ag1)"/>
    <ellipse cx="26" cy="32" rx="6" ry="8" fill="#0b1220" opacity=".85"/>
    <ellipse cx="38" cy="32" rx="6" ry="8" fill="#0b1220" opacity=".85"/>
    <circle cx="24" cy="32" r="2" fill="#7dd3fc"/>
    <circle cx="36" cy="32" r="2" fill="#7dd3fc"/>
    <g class="a-blink">
      <rect x="21" y="31" width="10" height="2" rx="1" fill="#0b1220" opacity=".85"/>
      <rect x="33" y="31" width="10" height="2" rx="1" fill="#0b1220" opacity=".85"/>
    </g>
    <path d="M26 44c3 3 9 3 12 0" stroke="#0b1220" stroke-width="3" stroke-linecap="round" fill="none" opacity=".7"/>
    <path d="M22 16c1-4 5-6 10-6s9 2 10 6" stroke="#22c55e" stroke-width="4" stroke-linecap="round" opacity=".6"/>
  </g>
</svg>`
  },

  {
    id: "bot",
    name: "Robot Pro",
    svg: `
<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" class="skin a-float">
  <defs>
    <linearGradient id="bg1" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#e5e7eb"/><stop offset="1" stop-color="#cbd5e1"/>
    </linearGradient>
    <filter id="sh5" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#000" flood-opacity=".22"/>
    </filter>
  </defs>

  <g filter="url(#sh5)">
    <rect x="16" y="18" width="32" height="30" rx="12" fill="url(#bg1)"/>
    <rect x="20" y="24" width="24" height="14" rx="7" fill="#0b1220" opacity=".92"/>
    <circle cx="28" cy="31" r="2.4" fill="#34d399"/>
    <circle cx="36" cy="31" r="2.4" fill="#34d399"/>
    <g class="a-blink">
      <rect x="25" y="30" width="6" height="2" rx="1" fill="#34d399"/>
      <rect x="33" y="30" width="6" height="2" rx="1" fill="#34d399"/>
    </g>
    <path d="M26 42c4 3 8 3 12 0" stroke="#64748b" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M32 13v6" stroke="#64748b" stroke-width="3" stroke-linecap="round"/>
    <circle cx="32" cy="11" r="3" fill="#f59e0b"/>
    <path d="M18 22h28" stroke="#94a3b8" stroke-width="2" opacity=".8"/>
  </g>
</svg>`
  },

  {
    id: "hero",
    name: "Héroe",
    svg: `
<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" class="skin a-float">
  <defs>
    <linearGradient id="hg1" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#60a5fa"/><stop offset="1" stop-color="#f59e0b"/>
    </linearGradient>
    <filter id="sh6" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#000" flood-opacity=".25"/>
    </filter>
  </defs>

  <g filter="url(#sh6)">
    <circle cx="32" cy="34" r="18" fill="#fde68a"/>
    <path d="M16 34c6-12 26-12 32 0" fill="url(#hg1)" opacity=".35"/>
    <circle cx="26" cy="36" r="2.6" fill="#111827"/>
    <circle cx="38" cy="36" r="2.6" fill="#111827"/>
    <g class="a-blink">
      <rect x="23" y="35" width="6" height="2" rx="1" fill="#111827"/>
      <rect x="35" y="35" width="6" height="2" rx="1" fill="#111827"/>
    </g>
    <path d="M26 44c4 3 8 3 12 0" stroke="#111827" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M16 28l10-10 6 8 6-8 10 10" fill="url(#hg1)"/>
    <path d="M20 50c6 4 18 4 24 0" stroke="#f59e0b" stroke-width="5" stroke-linecap="round" opacity=".75"/>
  </g>
</svg>`
  },

  {
    id: "ghost",
    name: "Fantasma",
    svg: `
<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" class="skin a-float">
  <defs>
    <linearGradient id="gg1" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#e0e7ff"/><stop offset="1" stop-color="#c7d2fe"/>
    </linearGradient>
    <filter id="sh7" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#000" flood-opacity=".22"/>
    </filter>
  </defs>

  <g filter="url(#sh7)">
    <path d="M18 52V30c0-10 6-16 14-16s14 6 14 16v22l-4-3-4 3-4-3-4 3-4-3-4 3z" fill="url(#gg1)"/>
    <circle cx="28" cy="32" r="2.6" fill="#111827"/>
    <circle cx="36" cy="32" r="2.6" fill="#111827"/>
    <g class="a-blink">
      <rect x="25" y="31" width="6" height="2" rx="1" fill="#111827"/>
      <rect x="33" y="31" width="6" height="2" rx="1" fill="#111827"/>
    </g>
    <path d="M28 40c3 2 5 2 8 0" stroke="#111827" stroke-width="3" stroke-linecap="round" fill="none" opacity=".75"/>
  </g>
</svg>`
  },

  {
    id: "slime",
    name: "Slime",
    svg: `
<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" class="skin a-float">
  <defs>
    <linearGradient id="sg1" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#22c55e"/><stop offset="1" stop-color="#06b6d4"/>
    </linearGradient>
    <filter id="sh8" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#000" flood-opacity=".25"/>
    </filter>
  </defs>

  <g filter="url(#sh8)">
    <path d="M18 48c0-12 6-24 14-24s14 12 14 24c0 6-6 10-14 10s-14-4-14-10z" fill="url(#sg1)"/>
    <circle cx="26" cy="40" r="2.6" fill="#0b1220" opacity=".9"/>
    <circle cx="38" cy="40" r="2.6" fill="#0b1220" opacity=".9"/>
    <g class="a-blink">
      <rect x="23" y="39" width="6" height="2" rx="1" fill="#0b1220" opacity=".9"/>
      <rect x="35" y="39" width="6" height="2" rx="1" fill="#0b1220" opacity=".9"/>
    </g>
    <path d="M26 48c4 3 8 3 12 0" stroke="#0b1220" stroke-width="3" fill="none" stroke-linecap="round" opacity=".55"/>
    <path d="M22 30c2-3 6-5 10-5s8 2 10 5" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".22"/>
  </g>
</svg>`
  },
];

/* =========================
   OUTFITS (con bloqueo)
========================= */
const outfits = [
  { id: "none", name: "Sin ropa", svg: ``, locked:false },

  {
    id: "hoodie",
    name: "Hoodie",
    locked: false,
    svg: `
<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" class="outfit">
  <path d="M18 50c2-14 6-22 14-22s12 8 14 22" fill="rgba(255,255,255,.18)"/>
  <path d="M20 34c2-6 6-10 12-10s10 4 12 10" fill="rgba(0,0,0,.25)"/>
  <path d="M26 42c2 2 10 2 12 0" stroke="rgba(255,255,255,.65)" stroke-width="2" stroke-linecap="round" fill="none"/>
</svg>`
  },

  {
    id: "cape",
    name: "Capa",
    locked: true, // 🔒 se desbloquea por logro
    svg: `
<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" class="outfit">
  <path d="M18 30l14 8 14-8v26c-8 4-20 4-28 0z" fill="rgba(255,255,255,.16)"/>
  <path d="M32 38v22" stroke="rgba(255,255,255,.30)" stroke-width="2" stroke-linecap="round"/>
  <circle cx="32" cy="30" r="3" fill="rgba(255,255,255,.35)"/>
</svg>`
  },

  {
    id: "labcoat",
    name: "Bata",
    locked: true, // 🔒 se desbloquea por logro
    svg: `
<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" class="outfit">
  <path d="M22 26c2 2 6 4 10 4s8-2 10-4c6 6 8 14 8 26c-6 4-10 6-18 6s-12-2-18-6c0-12 2-20 8-26z"
        fill="rgba(255,255,255,.18)"/>
  <path d="M32 30v28" stroke="rgba(0,0,0,.20)" stroke-width="2" stroke-linecap="round"/>
  <path d="M28 44h-6" stroke="rgba(255,255,255,.55)" stroke-width="3" stroke-linecap="round"/>
</svg>`
  },

  {
    id: "glasses",
    name: "Gafas",
    locked: false,
    svg: `
<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" class="outfit">
  <rect x="18" y="28" width="12" height="10" rx="4" fill="rgba(0,0,0,.30)" stroke="rgba(255,255,255,.35)"/>
  <rect x="34" y="28" width="12" height="10" rx="4" fill="rgba(0,0,0,.30)" stroke="rgba(255,255,255,.35)"/>
  <path d="M30 33h4" stroke="rgba(255,255,255,.35)" stroke-width="2" stroke-linecap="round"/>
</svg>`
  }
];

/* =========================
   AVATAR SERVICE
========================= */
const avatarService = new AvatarService({
  skins,
  outfits,
  colors: ["#1E85CA","#5EB04A","#81C55E","#FEBE29","#E37624","#9B59B6","#FF6FAE","#00C2A8"]
});

/* =========================
   SERVICES
========================= */
const auth = new AuthService(storage, toast, avatarService);

const defaultBank = new QuestionBank();
const bank = new QuestionBankEditable(storage, defaultBank.questions);

const quiz = new QuizEngine(storage, toast, bank);

const stats = new StatsService(storage);
const ach = new AchievementService(storage, toast);

/* =========================
   ACHIEVEMENTS
========================= */
const achievements = [
  {
    id: "first_correct",
    title: "Primer acierto",
    desc: "Acertaste tu primera pregunta.",
    check: ({ userStats }) => (userStats.totalCorrect >= 1)
  },
  {
    id: "streak5",
    title: "Racha x5",
    desc: "5 correctas seguidas.",
    check: ({ runtime }) => runtime.streak >= 5
  },
  {
    id: "perfect_level1",
    title: "Nivel 1 perfecto",
    desc: "Completaste el Nivel 1 con 3 vidas.",
    check: ({ runtime }) => runtime.lastLevelCompleted === 1 && runtime.livesAtEnd === 3
  },
  {
    id: "unlock_cape",
    title: "Desbloqueaste Capa",
    desc: "Consigue 120 puntos.",
    check: ({ runtime }) => runtime.points >= 120,
    onUnlock: ({ unlocks }) => { unlocks.cape = true; }
  },
  {
    id: "unlock_labcoat",
    title: "Desbloqueaste Bata",
    desc: "Consigue 180 puntos.",
    check: ({ runtime }) => runtime.points >= 180,
    onUnlock: ({ unlocks }) => { unlocks.labcoat = true; }
  }
];

/* =========================
   UNLOCKS PER USER
========================= */
function getUnlocks(storageSvc, username){
  const key = `unlocks_${username}`;
  return storageSvc.getItem(key) || {};
}

function saveUnlocks(storageSvc, username, obj){
  const key = `unlocks_${username}`;
  storageSvc.setItem(key, obj);
}

/* =========================
   UI CONTROLLER
========================= */
const ui = new UIController({
  toast,
  auth,
  quiz,
  avatarService,
  bank,
  stats,
  ach,
  achievements,
  getUnlocks,
  saveUnlocks,
  storage
});

ui.init();

/* =========================
   RULES MODAL
========================= */
const btnRules = document.getElementById("btnRules");
const rulesOverlay = document.getElementById("rulesOverlay");
const btnCloseRules = document.getElementById("btnCloseRules");

function openRules(){
  if(rulesOverlay) rulesOverlay.classList.add("show");
}

function closeRules(){
  if(rulesOverlay) rulesOverlay.classList.remove("show");
}

if(btnRules) btnRules.addEventListener("click", (e) => { e.preventDefault(); openRules(); });
if(btnCloseRules) btnCloseRules.addEventListener("click", () => closeRules());
if(rulesOverlay){
  rulesOverlay.addEventListener("click", (e) => {
    if(e.target === rulesOverlay) closeRules();
  });
}

document.addEventListener("keydown", (e) => {
  if(e.key === "Escape") closeRules();
});
