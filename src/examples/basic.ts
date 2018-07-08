import { TypedEventEmitter } from "../TypedEventEmitter";

enum Event {
  SomeEvent0,
  SomeEvent1,
  SomeEvent_StringKey = "lalala"
}

type Events = {
  [Event.SomeEvent0]: string;
  [Event.SomeEvent1]: number;
  [Event.SomeEvent_StringKey]: { name: string; age: number };
};

const ee = new TypedEventEmitter<Events>();

const removeListener0 = ee.on(Event.SomeEvent0, payload => {}); // payload type === string
const removeListener1 = ee.once(Event.SomeEvent1, payload => {}); // payload type === number
const removeListener2 = ee.prependListener(Event.SomeEvent_StringKey, payload => {}); // payload type === { name: string; age: number }
const removeListener3 = ee.prependOnceListener(Event.SomeEvent_StringKey, payload => {}); // payload type === { name: string; age: number }

ee.emit(Event.SomeEvent0, "string"); // ok
// ee.emit(Event.SomeEvent0, 1); // wrong type - TS error

ee.emit(Event.SomeEvent1, 666); // ok
// ee.emit(Event.SomeEvent1, "aaa"); // wrong type - TS error

ee.emit(Event.SomeEvent_StringKey, { name: "Tomek", age: 123 }); // ok
// ee.emit(Event.SomeEvent_StringKey, {}); // wrong type - TS error

removeListener0(); // pretty self explanatory :)
removeListener1();
removeListener2();
removeListener3();
