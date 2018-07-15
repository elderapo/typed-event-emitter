export type Event = string | number | symbol;
export type Payload = any[];
export type Listener = (...args: Payload) => void;

export interface IEventEmitter {
  addListener(event: Event, listener: Listener): this;
  on(event: Event, listener: Listener): this;
  once(event: Event, listener: Listener): this;
  removeListener(event: Event, listener: Listener): this;
  off(event: Event, listener: Listener): this;
  removeAllListeners(event?: Event): this;
  setMaxListeners(n: number): this;
  getMaxListeners(): number;
  listeners(event: Event): Function[];
  rawListeners(event: Event): Function[];
  emit(event: Event, ...args: any[]): boolean;
  listenerCount(type: Event): number;
  // Added in Node 6...
  prependListener(event: Event, listener: Listener): this;
  prependOnceListener(event: Event, listener: Listener): this;
  eventNames(): Array<Event>;
}
