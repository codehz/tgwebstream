export type ExitAction<T extends object = object> = (
  obj: T,
) => Promise<void> | void;
export type ExitInitializer<T extends object> = (
  obj: T,
  notify: (err?: Error) => void,
) => ExitAction<T>;

const ref = new WeakMap<object, ExitGroup>();

export default class ExitGroup {
  #exited: Promise<void> = null;
  #errorHandler: (err: Error) => void;
  #store = new Map<object, ExitAction>();

  constructor(errorHandler: (err: Error) => void = console.error) {
    this.#errorHandler = errorHandler;
  }

  readonly #notify = (err?: Error) => {
    if (err) this.#errorHandler(err);
    if (this.#exited) return this.#exited;
    return this.#exited = (async () => {
      for (const [obj, exit] of this.#store) {
        try {
          await exit(obj);
        } catch (e) {
          this.#errorHandler(err);
        }
      }
    })();
  };

  add<T extends object>(
    obj: T,
    action: ExitInitializer<T> = (obj: any, notify) => {
      obj.on("close", () => notify());
      obj.on("error", (e: Error) => notify(e));
      return () => obj.close();
    },
  ): T {
    if (ref.has(obj)) {
      throw new ReferenceError("object is already in another exit group");
    }
    this.#store.set(obj, action(obj, this.#notify));
    ref.set(obj, this);
    return obj;
  }
}
