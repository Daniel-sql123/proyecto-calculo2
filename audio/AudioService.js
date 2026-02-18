export class AudioService {
  constructor({ musicSrc, sfx = {} } = {}) {
    // Música
    this.music = new Audio(musicSrc || "");
    this.music.loop = true;
    this.music.volume = 0.25;

    // SFX
    this.sfx = {};
    for (const [key, src] of Object.entries(sfx)) {
      const a = new Audio(src);
      a.volume = 0.6;
      this.sfx[key] = a;
    }

    this.enabled = true;
    this.unlocked = false; // para autoplay
  }

  // Se llama en el primer click del usuario
  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;

    // truco: "tocar" silencioso para que el navegador permita audio después
    const tryPlay = this.music.play();
    if (tryPlay?.then) {
      tryPlay
        .then(() => {
          this.music.pause();
          this.music.currentTime = 0;
        })
        .catch(() => {
          // si falla, no pasa nada; se desbloquea en otro click
        });
    }
  }

  playMusic() {
    if (!this.enabled || !this.music.src) return;
    this.music.play().catch(() => {});
  }

  stopMusic() {
    this.music.pause();
    this.music.currentTime = 0;
  }

  toggleMute() {
    this.enabled = !this.enabled;
    if (!this.enabled) this.music.pause();
    else this.playMusic();
    return this.enabled;
  }

  setMusicVolume(v) {
    this.music.volume = Math.max(0, Math.min(1, v));
  }

  setSfxVolume(v) {
    const vol = Math.max(0, Math.min(1, v));
    Object.values(this.sfx).forEach(a => (a.volume = vol));
  }

  playSfx(name) {
    if (!this.enabled) return;
    const a = this.sfx[name];
    if (!a) return;

    // clonar para que suene aunque se dispare rápido varias veces
    const clone = a.cloneNode();
    clone.volume = a.volume;
    clone.play().catch(() => {});
  }
}
