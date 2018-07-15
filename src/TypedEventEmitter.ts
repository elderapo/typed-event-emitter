import { EventEmitter } from "events";
import { IEventEmitter } from "./interfaces";

export type RemoveEventListener = () => void;
export type EventHandler = (payload: any) => void;

export enum InternalEventEmitterEvent {
  NewListener = "newListener",
  RemoveListener = "removeListener"
}

export type InternalEventEmitterEvents = {
  [InternalEventEmitterEvent.NewListener]: EventHandler;
  [InternalEventEmitterEvent.RemoveListener]: { event: any; listener: EventHandler };
};

export class TypedEventEmitter<
  T,
  Events extends InternalEventEmitterEvents & T = InternalEventEmitterEvents & T
> {
  constructor(private internalEventEmitter: IEventEmitter = new EventEmitter()) {
    this.interceptEmit();
  }

  static fromEventEmitter<T>(eventEmitter: EventEmitter): TypedEventEmitter<T> {
    return new TypedEventEmitter<T>(eventEmitter);
  }

  public on<Event extends keyof Events>(
    event: Event,
    listener: (payload: Events[Event]) => void
  ): RemoveEventListener {
    this.internalEventEmitter.on(this.castTypedEventToEvent(event), listener);
    return () => this.removeListener(event, listener);
  }

  public once<Event extends keyof Events>(
    event: Event,
    listener: (payload: Events[Event]) => void
  ): RemoveEventListener {
    this.internalEventEmitter.once(this.castTypedEventToEvent(event), listener);
    return () => this.removeListener(event, listener);
  }

  public prependListener<Event extends keyof Events>(
    event: Event,
    listener: (payload: Events[Event]) => void
  ): RemoveEventListener {
    this.internalEventEmitter.prependListener(this.castTypedEventToEvent(event), listener);
    return () => this.removeListener(event, listener);
  }

  public prependOnceListener<Event extends keyof Events>(
    event: Event,
    listener: (payload: Events[Event]) => void
  ): RemoveEventListener {
    this.internalEventEmitter.prependOnceListener(this.castTypedEventToEvent(event), listener);
    return () => this.removeListener(event, listener);
  }

  public removeListener<Event extends keyof Events>(
    event: Event,
    listenerFunc: (payload: Events[Event]) => void
  ): void {
    this.internalEventEmitter.removeListener(this.castTypedEventToEvent(event), listenerFunc);
  }

  public removeAllListeners<Event extends keyof Events>(event?: Event): void {
    if (typeof event === "undefined") {
      this.internalEventEmitter.removeAllListeners();
      return;
    }

    this.internalEventEmitter.removeAllListeners(this.castTypedEventToEvent(event));
  }

  public setMaxListeners(n: number): void {
    this.internalEventEmitter.setMaxListeners(n);
  }

  public getMaxListeners(): number {
    return this.internalEventEmitter.getMaxListeners();
  }

  public listeners<Event extends keyof Events>(event: Event): EventHandler[] {
    return this.internalEventEmitter.listeners(this.castTypedEventToEvent(event)) as EventHandler[];
  }

  public emit<Event extends keyof Events>(event: Event, payload: Events[Event]): void {
    this.internalEventEmitter.emit(this.castTypedEventToEvent(event), payload);
  }

  public eventIdentifiers(): Array<keyof Events> {
    return this.internalEventEmitter.eventNames().map(eventIndetifier => {
      if (typeof eventIndetifier === "symbol") {
        return eventIndetifier;
      }

      const n = parseFloat(eventIndetifier + "");

      return Number.isNaN(n) ? eventIndetifier : n;
    }) as Array<keyof Events>;
  }

  public listenerCount<Event extends keyof Events>(event: Event): number {
    return this.internalEventEmitter.listenerCount(this.castTypedEventToEvent(event));
  }

  private castTypedEventToEvent<Event extends keyof Events>(event: Event): string | symbol {
    return event as string | symbol;
  }

  private interceptEmit() {
    let originalFunc: Function = this.internalEventEmitter.emit.bind(this.internalEventEmitter);

    this.internalEventEmitter.emit = (...args: any[]) => {
      if (args[0] === InternalEventEmitterEvent.RemoveListener) {
        return originalFunc(args[0], {
          event: args[1],
          listener: args[2]
        });
      }
      return originalFunc(...args);
    };
  }
}
