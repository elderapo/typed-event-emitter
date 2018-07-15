import { TypedEventEmitter, InternalEventEmitterEvents } from "./TypedEventEmitter";
import { StrictEventEmitter } from "./StrictEventEmitter";

export class StrictTypedEventEmitter<
  T,
  Events extends InternalEventEmitterEvents & T = InternalEventEmitterEvents & T
> extends TypedEventEmitter<Events> {
  constructor() {
    super(new StrictEventEmitter());
  }
}
