import { InternalEventEmitter } from "./InternalEventEmitter";
import { EventEmitter as NativeEventEmitter } from "events";

export type RemoveEventListener = () => void;
export type EventHandler = (payload: any) => void;

export enum InternalEventEmitterEvent {
  NewListener = "newListener",
  RemoveListener = "removeListener"
}

export type InternalEventEmitterEvents = {
  [InternalEventEmitterEvent.NewListener]: EventHandler;
  [InternalEventEmitterEvent.RemoveListener]: EventHandler;
};

export class TypedEventEmitter<
  T,
  Events extends InternalEventEmitterEvents & T = InternalEventEmitterEvents & T
> {
  constructor(private internalEventEmitter: InternalEventEmitter = new InternalEventEmitter()) {
    this.hookIntoInternalEventEmitter();
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

  public off<Event extends keyof Events>(
    event: Event,
    listenerFunc: (payload: Events[Event]) => void
  ): void {
    this.internalEventEmitter.off(this.castTypedEventToEvent(event), listenerFunc);
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
    return this.internalEventEmitter.listeners(this.castTypedEventToEvent(event));
  }

  public emit<Event extends keyof Events>(event: Event, payload: Events[Event]): void {
    this.internalEventEmitter.emit(this.castTypedEventToEvent(event), payload);
  }

  public eventIdentifiers(): Array<keyof Events> {
    return this.internalEventEmitter.eventNames() as Array<keyof Events>;
  }

  public listenerCount<Event extends keyof Events>(event: Event): number {
    return this.internalEventEmitter.listenerCount(this.castTypedEventToEvent(event));
  }

  private castTypedEventToEvent<Event extends keyof Events>(
    event: Event
  ): string | number | symbol {
    return event as string | number | symbol;
  }

  private hookIntoInternalEventEmitter() {
    const originalEmit = this.internalEventEmitter.emit;
  }

  static fromEventEmitter<T>(
    eventEmitter: NativeEventEmitter | InternalEventEmitter
  ): TypedEventEmitter<T> {
    return new TypedEventEmitter<T>(eventEmitter as InternalEventEmitter);
  }
}
