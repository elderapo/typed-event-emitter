import { TypedEventEmitter } from "../../src/typed-event-emitter";

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

interface IMyEventEmitterEvents extends OutgoingEvents, IncommingEvents {}

class BidirectionalCommunication extends TypedEventEmitter<IMyEventEmitterEvents> {}

const ee = new BidirectionalCommunication();

ee.emit(OutgoingEvent.SendName, "name");
ee.emit(OutgoingEvent.SendName, 123); // $ExpectError

ee.emit(OutgoingEvent.SendAge, 20);
ee.emit(OutgoingEvent.SendAge, "20"); // $ExpectError

ee.emit(OutgoingEvent.SendPerson, { name: "name", age: 123 });
ee.emit(OutgoingEvent.SendPerson, { name: "name" }); // $ExpectError

ee.on(IncommingEvent.SomeData, payload => {});
ee.on(IncommingEvent.SomeData, (payload: string) => {}); // $ExpectError
ee.on(IncommingEvent.SomeOtherData, payload => {});
ee.on(IncommingEvent.SomeOtherOtherData, payload => {});

enum Overlapping {
  SendName,
  SendAge,
  SendPerson = "send-person"
}

type OverlappingEvents = {
  [Overlapping.SendName]: string;
  [Overlapping.SendAge]: number;
  [Overlapping.SendPerson]: { name: string; age: number };
};

interface IShouldError extends IncommingEvents, OverlappingEvents {} // $ExpectError
