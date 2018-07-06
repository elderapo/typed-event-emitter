import { TypedEventEmitter } from "../../src/typed-event-emitter";

enum Event {
  Event1,
  Event2,
  Event3,
  Event4,
  Event5,
  Event6,
  Event7,

  EventStringKey = "string key"
}

type Events = {
  [Event.Event1]: string;
  [Event.Event2]: number;
  [Event.Event3]: void;
  [Event.Event4]: null;
  [Event.Event5]: "payload 1" | "payload 2";
  [Event.Event6]: [number, string, null, symbol];
  [Event.Event7]: IPerson;
  [Event.EventStringKey]: string;
};

interface IPerson {
  name: string;
  age: number;
  sex: "male" | "female";

  friends?: IPerson[];
}

const eventEmitter = new TypedEventEmitter<Events>();

eventEmitter.emit(Event.Event1, "str");
eventEmitter.emit(Event.Event1, 1); // $ExpectError
eventEmitter.emit(Event.Event1); // $ExpectError

eventEmitter.emit(Event.Event2, 1);
eventEmitter.emit(Event.Event2, "str"); // $ExpectError
// eventEmitter.emit(Event.Event2, NaN); // $ExpectError
eventEmitter.emit(Event.Event2); // $ExpectError

eventEmitter.emit(Event.Event3, void 0);
eventEmitter.emit(Event.Event3, undefined);
eventEmitter.emit(Event.Event3, null); // $ExpectError
eventEmitter.emit(Event.Event3, 1); // $ExpectError
eventEmitter.emit(Event.Event3, "str"); // $ExpectError

eventEmitter.emit(Event.Event4, null);
eventEmitter.emit(Event.Event4, undefined); // $ExpectError
eventEmitter.emit(Event.Event4, 1); // $ExpectError
eventEmitter.emit(Event.Event4, "str"); // $ExpectError
eventEmitter.emit(Event.Event4); // $ExpectError

eventEmitter.emit(Event.Event5, "payload 1");
eventEmitter.emit(Event.Event5, "payload 2");
eventEmitter.emit(Event.Event5, 1); // $ExpectError
eventEmitter.emit(Event.Event5); // $ExpectError

eventEmitter.emit(Event.Event6, [1, "a", null, Symbol()]);
eventEmitter.emit(Event.Event6, 1); // $ExpectError
eventEmitter.emit(Event.Event6, []); // $ExpectError
eventEmitter.emit(Event.Event6, {}); // $ExpectError
eventEmitter.emit(Event.Event6); // $ExpectError

eventEmitter.emit(Event.Event7, {
  name: "Tomek",
  age: 22,
  sex: "male",
  friends: [{ name: "asda", age: 121, sex: "female" }]
});
eventEmitter.emit(Event.Event7, 1); // $ExpectError
eventEmitter.emit(Event.Event7, null); // $ExpectError
eventEmitter.emit(Event.Event7, new Object()); // $ExpectError
eventEmitter.emit(Event.Event7, []); // $ExpectError
eventEmitter.emit(Event.Event7, {}); // $ExpectError
eventEmitter.emit(Event.Event7); // $ExpectError

eventEmitter.emit(Event.EventStringKey, "str");
eventEmitter.emit(Event.EventStringKey, 1); // $ExpectError
eventEmitter.emit(Event.EventStringKey); // $ExpectError
