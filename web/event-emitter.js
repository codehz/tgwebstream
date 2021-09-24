class EventEmitter {
  #e = {};
  on(name, callback) {
    (this.#e[name] || (this.#e[name] = new Set())).add(callback);
    return this;
  }

  once(name, callback) {
    const listener = (...args) => {
      this.off(name, listener);
      callback(...args);
    };
    return this.on(name, listener);
  }

  emit(name, ...args) {
    if (!this.#e[name]) return this;
    for (const callback of this.#e[name]) {
      callback(...args);
    }
    return this;
  }

  off(name, callback) {
    if (!this.#e[name]) return this;
    if (callback) {
      this.#e[name].delete(callback);
      if (!this.#e[name].size) delete this.#e[name];
    } else {
      this.#e[name];
    }
    return this;
  }
}
