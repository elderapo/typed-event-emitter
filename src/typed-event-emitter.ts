import { EventEmitter } from "events";
import { AssertionError } from "assert";

type RemoveEventListener = () => void;

export class TypedEventEmitter<Events> {
  private _eventEmitter: EventEmitter = new EventEmitter();
  private symbolMap: Map<keyof Events, symbol> = new Map();

  public addListener<Event extends keyof Events>(
    event: Event,
    listener: (payload: Events[Event]) => void
  ): RemoveEventListener {
    const eventSymbol = this.getOrCreateEventSymbol(event);
    return this.on(event, listener);
  }

  public on<Event extends keyof Events>(
    event: Event,
    listener: (payload: Events[Event]) => void
  ): RemoveEventListener {
    const eventSymbol = this.getOrCreateEventSymbol(event);
    this._eventEmitter.on(eventSymbol, listener);
    return () => this._eventEmitter.removeListener(eventSymbol, listener);
  }

  public once<Event extends keyof Events>(
    event: Event,
    listener: (payload: Events[Event]) => void
  ): RemoveEventListener {
    const eventSymbol = this.getOrCreateEventSymbol(event);
    this._eventEmitter.once(eventSymbol, listener);
    return () => this._eventEmitter.removeListener(eventSymbol, listener);
  }

  /* istanbul ignore next */
  public prependListener<Event extends keyof Events>(
    event: Event,
    listener: (payload: Events[Event]) => void
  ): RemoveEventListener {
    const eventSymbol = this.getOrCreateEventSymbol(event);
    this._eventEmitter.prependListener(eventSymbol, listener);
    return () => this._eventEmitter.removeListener(eventSymbol, listener);
  }

  /* istanbul ignore next */
  public prependOnceListener<Event extends keyof Events>(
    event: Event,
    listener: (payload: Events[Event]) => void
  ): RemoveEventListener {
    const eventSymbol = this.getOrCreateEventSymbol(event);
    this._eventEmitter.prependOnceListener(eventSymbol, listener);
    return () => this._eventEmitter.removeListener(eventSymbol, listener);
  }

  public removeListener<Event extends keyof Events>(
    event: Event,
    listener: (payload: Events[Event]) => void
  ): void {
    const eventSymbol = this.getOrCreateEventSymbol(event);
    this._eventEmitter.removeListener(eventSymbol, listener);
  }

  public removeAllListeners<Event extends keyof Events>(event?: Event): void {
    if (typeof event !== "undefined") {
      const eventSymbol = this.getOrCreateEventSymbol(event);
      this._eventEmitter.removeAllListeners(eventSymbol);
      return;
    }

    for (let eventName of this.eventNames()) {
      const eventSymbol = this.getOrCreateEventSymbol(eventName);
      this._eventEmitter.removeAllListeners(eventSymbol);
    }
  }

  public setMaxListeners(n: number): void {
    this._eventEmitter.setMaxListeners(n);
  }

  public getMaxListeners(): number {
    return this._eventEmitter.getMaxListeners();
  }

  public listeners<Event extends keyof Events>(event: Event): ((payload: Events[Event]) => void)[] {
    const eventSymbol = this.getOrCreateEventSymbol(event);
    return this.nativeListenersToTypes(this._eventEmitter.listeners(eventSymbol));
  }

  private nativeListenersToTypes<Event extends keyof Events>(
    nativeListeners: Function[]
  ): ((payload: Events[Event]) => void)[] {
    return <((payload: Events[Event]) => void)[]>nativeListeners;
  }

  public emit<Event extends keyof Events>(event: Event, payload: Events[Event]): void {
    const eventSymbol = this.getOrCreateEventSymbol(event);
    this._eventEmitter.emit(eventSymbol, payload);
  }

  public eventNames(): Array<keyof Events> {
    return Array.from(this.symbolMap.keys());
  }

  public listenerCount<Event extends keyof Events>(event: Event): number {
    const eventSymbol = this.getOrCreateEventSymbol(event);
    return this._eventEmitter.listenerCount(eventSymbol);
  }

  /* istanbul ignore next */
  private getOrCreateEventSymbol<Event extends keyof Events>(event: Event): symbol {
    if (!this.symbolMap.has(event)) {
      this.symbolMap.set(event, Symbol(String(event)));
    }

    const s = this.symbolMap.get(event);

    if (s) {
      return s;
    }

    throw new AssertionError({
      message: `Couldn't create symbol for event: ${event}!`
    });
  }
}
