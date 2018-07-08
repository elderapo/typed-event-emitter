import { getOrCreateFromMap } from "./utils";

type Event = string | number | symbol;
type Payload = any[];
type Listener = (...args: Payload) => void;

interface IInternalAddListenerOptions {
  event: Event;
  listener: Listener;
  prependListener: boolean;
  once: boolean;
}

export class InternalEventEmitter {
  public static defaultMaxListeners: number = 10;

  private maxListeners: number = InternalEventEmitter.defaultMaxListeners;
  private listenersMap: Map<Event, Listener[]> = new Map();
  private onceListeners: Listener[] = [];

  public addListener(event: Event, listener: Listener): this {
    this.internalAddListener({
      event,
      listener,
      prependListener: false,
      once: false
    });

    return this;
  }

  public on(event: Event, listener: Listener): this {
    this.addListener(event, listener);
    return this;
  }

  public once(event: Event, listener: Listener): this {
    this.internalAddListener({
      event,
      listener,
      prependListener: false,
      once: true
    });
    return this;
  }

  public prependListener(event: Event, listener: Listener): this {
    this.internalAddListener({
      event,
      listener,
      prependListener: true,
      once: false
    });
    return this;
  }

  public prependOnceListener(event: Event, listener: Listener): this {
    this.internalAddListener({
      event,
      listener,
      prependListener: true,
      once: true
    });
    return this;
  }

  public removeListener(event: Event, listenerToRemove: Listener): this {
    const listenersArray = this.listenersMap.get(event);

    if (!listenersArray) {
      return this;
    }

    const index = listenersArray.findIndex(listener => listener === listenerToRemove);

    if (index === -1) {
      return this;
    }

    listenersArray.splice(index, 1);

    if (this.isOnceListener(listenerToRemove)) {
      const onceIndex = this.onceListeners.indexOf(listenerToRemove);
      this.onceListeners.splice(onceIndex);
    }

    this.emit("removeListener", listenerToRemove);

    return this;
  }

  public off(event: Event, listener: Listener): this {
    return this.removeListener(event, listener);
  }

  public removeAllListeners(event?: Event): this {
    if (typeof event === "undefined") {
      for (let event of Array.from(this.listenersMap.keys())) {
        this.removeAllListeners(event);
      }
      return this;
    }

    while (true) {
      const listeners = this.listenersMap.get(event);
      if (!listeners || listeners.length === 0) {
        return this;
      }

      this.removeListener(event, listeners[0]);
    }
  }

  public setMaxListeners(n: number): this {
    this.maxListeners = n;
    return this;
  }

  public getMaxListeners(): number {
    return this.maxListeners;
  }

  public listeners(event: Event): Listener[] {
    const arr = this.listenersMap.get(event);
    if (arr && arr.length) {
      return arr;
    }
    return [];
  }

  public rawListeners(event: Event): Listener[] {
    return this.listeners(event);
  }

  public emit(event: Event, ...args: Payload): boolean {
    const listeners = this.listenersMap.get(event);

    if (!listeners) {
      return false;
    }

    let toRemove: Listener[] = [];

    listeners.forEach(listener => {
      if (this.isOnceListener(listener)) {
        toRemove.push(listener);
      }
      listener(...args);
    });

    toRemove.forEach(listener => {
      this.removeListener(event, listener);
    });

    return true;
  }

  public eventNames(): Array<Event> {
    return Array.from(this.listenersMap.keys());
  }

  public listenerCount(event: Event): number {
    const listeners = this.listenersMap.get(event);
    return listeners ? listeners.length : 0;
  }

  private isOnceListener(listener: Listener): boolean {
    return this.onceListeners.includes(listener);
  }

  private internalAddListener({
    event,
    listener,
    prependListener,
    once
  }: IInternalAddListenerOptions) {
    const listenersArray = getOrCreateFromMap(this.listenersMap, event, []);

    if (once) {
      this.onceListeners.push(listener);
    }

    if (prependListener) {
      listenersArray.unshift(listener);
    } else {
      listenersArray.push(listener);
    }

    this.emit("newListener", { event, listener });

    const listenersCount = this.listenerCount(event);
    if (listenersCount > this.maxListeners) {
      console.warn(
        `possible EventEmitter memory leak detected. ${
          this.listenerCount
        } listeners added. Use emitter.setMaxListeners() to increase limit.`
      );
    }

    return this;
  }
}
