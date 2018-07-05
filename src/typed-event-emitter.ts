import { getOrCreateFromMap } from "./utils";

type RemoveEventListener = () => void;
type Listener = {
  once: boolean;
  func: (payload: any) => void;
};

export class TypedEventEmitter<Events> {
  private static defaultMaxListeners: number = 10;

  private maxListeners: number = TypedEventEmitter.defaultMaxListeners;
  private listenersArrays: Map<keyof Events, Listener[]> = new Map();

  public on<Event extends keyof Events>(
    event: Event,
    listener: (payload: Events[Event]) => void
  ): RemoveEventListener {
    this.getListenersArray(event).push({
      once: false,
      func: listener
    });
    this.afterAddEventListener(event);
    return () => this.removeListener(event, listener);
  }

  public once<Event extends keyof Events>(
    event: Event,
    listener: (payload: Events[Event]) => void
  ): RemoveEventListener {
    this.getListenersArray(event).push({
      once: true,
      func: listener
    });
    this.afterAddEventListener(event);
    return () => this.removeListener(event, listener);
  }

  public prependListener<Event extends keyof Events>(
    event: Event,
    listener: (payload: Events[Event]) => void
  ): RemoveEventListener {
    this.getListenersArray(event).unshift({
      once: false,
      func: listener
    });
    this.afterAddEventListener(event);
    return () => this.removeListener(event, listener);
  }

  public prependOnceListener<Event extends keyof Events>(
    event: Event,
    listener: (payload: Events[Event]) => void
  ): RemoveEventListener {
    this.getListenersArray(event).unshift({
      once: true,
      func: listener
    });
    this.afterAddEventListener(event);
    return () => this.removeListener(event, listener);
  }

  public removeListener<Event extends keyof Events>(
    event: Event,
    listenerFunc: (payload: Events[Event]) => void
  ): boolean {
    const listenersArray = this.getListenersArray(event);
    const index = listenersArray.findIndex(listener => listener.func === listenerFunc);
    if (index === -1) {
      return false;
    }

    listenersArray.splice(index, 1);

    return true;
  }

  public removeAllListeners<Event extends keyof Events>(event?: Event): void {
    if (typeof event === "undefined") {
      this.listenersArrays = new Map();
      return;
    }

    this.listenersArrays.set(event, []);
  }

  public setMaxListeners(n: number): void {
    this.maxListeners = n;
  }

  public getMaxListeners(): number {
    return this.maxListeners;
  }

  public listeners<Event extends keyof Events>(event: Event): ((payload: Events[Event]) => void)[] {
    return this.getListenersArray(event).map(l => l.func);
  }

  public emit<Event extends keyof Events>(event: Event, payload: Events[Event]): void {
    const listenersArray = this.getListenersArray(event);

    let listenersToRemove: Listener[] = [];

    for (let listener of listenersArray) {
      listener.func(payload);
      if (listener.once) {
        listenersToRemove.push(listener);
      }
    }

    for (let listener of listenersToRemove) {
      this.removeListener(event, listener.func);
    }
  }

  public eventNames(): Array<keyof Events> {
    return Array.from(this.listenersArrays.keys());
  }

  public listenerCount<Event extends keyof Events>(event: Event): number {
    return this.getListenersArray(event).length;
  }

  private getListenersArray<Event extends keyof Events>(event: Event): Listener[] {
    return getOrCreateFromMap(this.listenersArrays, event, []);
  }

  private afterAddEventListener<Event extends keyof Events>(event: Event) {
    const listenersCount = this.listenerCount(event);
    if (listenersCount > this.maxListeners) {
      console.warn(
        `possible TypedEventEmitter memory leak detected. ${
          this.listenerCount
        } listeners added. Use emitter.setMaxListeners() to increase limit.`
      );
    }
  }
}
