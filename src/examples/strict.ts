import { StrictTypedEventEmitter } from "../StrictTypedEventEmitter";

enum Event1 {
  SomeEvent0 = 0
}

interface Events {
  [Event1.SomeEvent0]: string;
}

const ee = new StrictTypedEventEmitter<Events>();

ee.on(Event1.SomeEvent0, payload => {}); // will only get called for event 0 (number)
ee.on("0" as any, payload => {}); // will only get called for event "0" (string)

ee.emit(Event1.SomeEvent0, "string");
ee.emit("0" as any, "666");
