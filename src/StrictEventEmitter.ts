import { IEventEmitter, Event, Listener, Payload } from "./interfaces";
import { EventEmitter } from "events";

export class StrictEventEmitter implements IEventEmitter {
  private listenersMap: Map<Event, Listener[]> = new Map();
  private onceListeners: Listener[] = [];
  private maxListeners: number = EventEmitter.defaultMaxListeners;

  public addListener(event: Event, listener: Listener): this {
    return this.internalAddListener(event, listener);
  }

  public on(event: Event, listener: Listener): this {
    this.addListener(event, listener);
    return this;
  }

  public once(event: Event, listener: Listener): this {
    this.internalAddListener(event, listener, true, "back");
    return this;
  }

  public prependListener(event: Event, listener: Listener): this {
    this.internalAddListener(event, listener, false, "front");
    return this;
  }

  public prependOnceListener(event: Event, listener: Listener): this {
    this.internalAddListener(event, listener, true, "front");
    return this;
  }

  public removeListener(event: Event, listener: Listener): this {
    const listeners = this.getListenrsArray(event);
    const index = listeners.indexOf(listener);

    if (index !== -1) {
      listeners.splice(index, 1);
    }

    const onceIndex = this.onceListeners.indexOf(listener);

    if (onceIndex !== -1) {
      this.onceListeners.splice(onceIndex, 1);
    }

    this.emit("removeListener", event, listener);

    return this;
  }

  public off(event: Event, listener: Listener): this {
    return this.removeListener(event, listener);
  }

  public removeAllListeners(event?: Event): this {
    if (typeof event === "undefined") {
      //   this.listenersMap = new Map();
      //   this.onceListeners = [];
      for (let e of this.eventNames()) {
        this.removeAllListeners(e);
      }
      return this;
    }

    const listeners = this.getListenrsArray(event);

    while (listeners.length) {
      const listener = listeners[0];
      this.removeListener(event, listener);
    }

    return this;
  }

  public setMaxListeners(n: number): this {
    this.maxListeners = n;
    return this;
  }

  public getMaxListeners(): number {
    return this.maxListeners;
  }

  public listeners(event: Event): Function[] {
    return this.getListenrsArray(event);
  }

  public rawListeners(event: Event): Function[] {
    return this.getListenrsArray(event);
  }

  public emit(event: Event, ...payload: Payload): boolean {
    const listeners = this.getListenrsArray(event, false);

    if (!listeners) {
      return false;
    }

    if (listeners.length === 0) {
      return false;
    }

    for (let listener of listeners) {
      listener(...payload);
    }

    for (let listener of listeners) {
      if (this.onceListeners.includes(listener)) {
        this.removeListener(event, listener);
      }
    }

    return true;
  }

  public eventNames(): Array<Event> {
    return Array.from(this.listenersMap.keys());
  }

  public listenerCount(type: Event): number {
    return this.listeners(type).length;
  }

  private getListenrsArray(event: Event, createNotExists: boolean = true): Listener[] {
    if (!this.listenersMap.has(event)) {
      if (!createNotExists) {
        return null as any;
      }
      this.listenersMap.set(event, []);
    }
    return this.listenersMap.get(event) as Listener[];
  }

  private internalAddListener(
    event: Event,
    listener: Listener,
    once: boolean = false,
    direction: "front" | "back" = "back"
  ): this {
    const listeners = this.getListenrsArray(event);
    if (direction === "front") {
      listeners.unshift(listener);
    } else if (direction === "back") {
      listeners.push(listener);
    } else {
      throw new TypeError(`Invalid direction: ${direction}!`);
    }

    if (once) {
      this.onceListeners.push(listener);
    }

    if (listeners.length > this.maxListeners) {
      console.warn(
        `possible StrictEventEmitter memory leak detected. ${
          listeners.length
        } listeners added. Use emitter.setMaxListeners() to increase limit.`
      );
    }

    this.emit("newListener", listener);

    return this;
  }
}
