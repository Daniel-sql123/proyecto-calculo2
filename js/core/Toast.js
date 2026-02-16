export class Toast {
  constructor(el) {
    this.el = el;
    this._timer = null;
  }

  show(message, ms = 2400) {
    this.el.textContent = message;
    this.el.classList.add("show");
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.el.classList.remove("show"), ms);
  }
}
