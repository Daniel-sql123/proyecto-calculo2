export class AvatarService {
  constructor({ skins, outfits = [], colors }) {
    this.skins = skins;        // personajes base
    this.outfits = outfits;    // 👈 ropa
    this.colors = colors;

    this.selectedSkin = skins?.[0]?.id ?? "wizard";
    this.selectedOutfit = outfits?.[0]?.id ?? "none";   // 👈 NUEVO
    this.selectedColor = colors?.[0] ?? "#1E85CA";
  }

  setSkin(id) { this.selectedSkin = id; }
  setOutfit(id) { this.selectedOutfit = id; }   // 👈 NUEVO
  setColor(color) { this.selectedColor = color; }

  getSkinById(id){
    return this.skins.find(s => s.id === id) || this.skins[0];
  }

  getOutfitById(id){
    if(!this.outfits?.length) return null;
    return this.outfits.find(o => o.id === id) || this.outfits[0];
  }

  renderAvatar(el, { skinId, outfitId, color, initial } = {}) {

    const finalSkinId = skinId || this.selectedSkin;
    const finalOutfitId = outfitId || this.selectedOutfit;

    const skin = this.getSkinById(finalSkinId);
    const outfit = this.getOutfitById(finalOutfitId);

    const init = (initial || "").toUpperCase();
    const c = color || this.selectedColor;

    el.style.position = "relative";
    el.style.overflow = "hidden";
    el.style.borderRadius = "18px";
    el.style.border = "2px solid rgba(255,255,255,.40)";
    el.style.boxShadow =
      "0 12px 24px rgba(0,0,0,.28), inset 0 2px 0 rgba(255,255,255,.22)";

    el.style.background = `
      radial-gradient(120% 120% at 20% 15%, rgba(255,255,255,.35) 0%, rgba(255,255,255,0) 45%),
      linear-gradient(135deg, ${c} 0%, rgba(0,0,0,.28) 100%)
    `;

    el.innerHTML = `
      <div style="
        position:absolute; inset:-25%;
        background: radial-gradient(circle at 30% 25%, rgba(255,255,255,.45), transparent 55%);
        transform: rotate(-12deg);
        pointer-events:none;
      "></div>

      <div style="display:grid; place-items:center; width:100%; height:100%;">
        
        <!-- 👇 AQUÍ se combinan las capas -->
        <div style="position:relative; width:38px; height:38px;">
          
          <!-- PERSONAJE BASE -->
          <div style="position:absolute; inset:0;">
            ${skin?.svg || ""}
          </div>

          <!-- ROPA -->
          ${outfit?.svg ? `
            <div style="position:absolute; inset:0;">
              ${outfit.svg}
            </div>
          ` : ""}

        </div>

        <div aria-hidden="true" style="
          margin-top:4px;
          font-size:11px;
          font-weight:900;
          letter-spacing:.08em;
          padding:4px 8px;
          border-radius:999px;
          background: rgba(0,0,0,.18);
          border: 1px solid rgba(255,255,255,.22);
          color: rgba(255,255,255,.95);
          backdrop-filter: blur(6px);
        ">${init}</div>

      </div>
    `;
  }

  mountPickers({ faceContainer, outfitContainer, colorContainer, onChange }) {

    /* ===== SKINS ===== */
    faceContainer.innerHTML = "";
    this.skins.forEach((s) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "faceBtn" + (s.id === this.selectedSkin ? " active" : "");
      b.innerHTML = `<div style="width:26px;height:26px">${s.svg}</div>`;
      b.title = s.name;

      b.addEventListener("click", () => {
        this.setSkin(s.id);
        [...faceContainer.querySelectorAll(".faceBtn")]
          .forEach(x => x.classList.remove("active"));
        b.classList.add("active");
        onChange?.();
      });

      faceContainer.appendChild(b);
    });

    /* ===== ROPA ===== */
    if(outfitContainer){
      outfitContainer.innerHTML = "";
      this.outfits.forEach((o) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "faceBtn" + (o.id === this.selectedOutfit ? " active" : "");
        b.innerHTML = `<div style="width:26px;height:26px">${o.svg || ""}</div>`;
        b.title = o.name;

        b.addEventListener("click", () => {
          this.setOutfit(o.id);
          [...outfitContainer.querySelectorAll(".faceBtn")]
            .forEach(x => x.classList.remove("active"));
          b.classList.add("active");
          onChange?.();
        });

        outfitContainer.appendChild(b);
      });
    }

    /* ===== COLORES ===== */
    colorContainer.innerHTML = "";
    this.colors.forEach((c) => {
      const sw = document.createElement("div");
      sw.className = "swatch" + (c === this.selectedColor ? " active" : "");
      sw.style.background = c;

      sw.addEventListener("click", () => {
        this.setColor(c);
        [...colorContainer.querySelectorAll(".swatch")]
          .forEach(x => x.classList.remove("active"));
        sw.classList.add("active");
        onChange?.();
      });

      colorContainer.appendChild(sw);
    });
  }
}
