import { TypedEventEmitter } from "../TypedEventEmitter";

enum IncommingEvent {
  SomeData,
  SomeOtherData,
  SomeOtherOtherData = "some-other-other-data"
}

type IncommingEvents = {
  [IncommingEvent.SomeData]: number[];
  [IncommingEvent.SomeOtherData]: {};
  [IncommingEvent.SomeOtherOtherData]: { name: string; age: number };
};

// `OutgoingEvent.SendName = 3;` so it doesn't overlap with `IncommingEvent.SomeData = 0;`
// Remove or set it to `0` and see what happens with `IMyEventEmitterEvents` :)
enum OutgoingEvent {
  SendName = 3,
  SendAge,
  SendPerson = "send-person"
}

type OutgoingEvents = {
  [OutgoingEvent.SendName]: string;
  [OutgoingEvent.SendAge]: number;
  [OutgoingEvent.SendPerson]: { name: string; age: number };
};

// It's important to use interfaces instead of `type Combined = OutgoingEvents & IncommingEvents`
// while combining `Events` to keep 100% type safety!
interface IMyEventEmitterEvents extends OutgoingEvents, IncommingEvents {}

class BidirectionalCommunication extends TypedEventEmitter<IMyEventEmitterEvents> {}

const ee = new BidirectionalCommunication();

ee.emit(OutgoingEvent.SendName, "name"); // ok
// ee.emit(OutgoingEvent.SendName, 123); // wrong type - TS error

ee.emit(OutgoingEvent.SendAge, 20); // ok
// ee.emit(OutgoingEvent.SendAge, "20"); // wrong type - TS error

// ee.emit(OutgoingEvent.SendPerson, { name: "name", age: 123 }); // ok
// ee.emit(OutgoingEvent.SendPerson, { name: "name" }); // wrong type - TS error

ee.on(IncommingEvent.SomeData, payload => {}); // type === number[]
ee.on(IncommingEvent.SomeOtherData, payload => {}); // type === {}
ee.on(IncommingEvent.SomeOtherOtherData, payload => {}); // type === { name: string; age: number };
