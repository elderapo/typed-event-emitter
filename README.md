# @elderapo/typed-event-emitter

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Greenkeeper badge](https://badges.greenkeeper.io/elderapo/typed-event-emitter.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/elderapo/typed-event-emitter.svg?branch=master)](https://travis-ci.org/elderapo/typed-event-emitter)
[![AppVeyor](https://ci.appveyor.com/api/projects/status/emtsip4f89a8y0h8?svg=true)](https://ci.appveyor.com/project/elderapo/typed-event-emitter)
[![Coveralls](https://img.shields.io/coveralls/elderapo/typed-event-emitter.svg)](https://coveralls.io/github/elderapo/typed-event-emitter)
[![Dev Dependencies](https://david-dm.org/elderapo/typed-event-emitter/dev-status.svg)](https://david-dm.org/elderapo/typed-event-emitter?type=dev)

Strongly typed event emitter with API similar to native [EventEmitter](https://nodejs.org/api/events.html).

### How to install

```bash
yarn add @elderapo/typed-event-emitter
# or
npm install @elderapo/typed-event-emitter
```

### Basic usage

```typescript
import { TypedEventEmitter } from "@elderapo/typed-event-emitter";

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
ee.emit(Event.SomeEvent0, 1); // wrong type - TS error

ee.emit(Event.SomeEvent1, 666); // ok
ee.emit(Event.SomeEvent1, "aaa"); // wrong type - TS error

ee.emit(Event.SomeEvent_StringKey, { name: "Tomek", age: 123 }); // ok
ee.emit(Event.SomeEvent_StringKey, {}); // wrong type - TS error

removeListener0(); // pretty self explanatory :)
removeListener1();
removeListener2();
removeListener3();
```

### Advanced usage
```typescript
import { TypedEventEmitter } from "@elderapo/typed-event-emitter";

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
  SendName = 3, // So it doesn't overlap with IncommingEvent.SomeData. Remove it and see what happens with `IMyEventEmitterEvents` :)
  SendAge,
  SendPerson = "send-person"
}

type OutgoingEvents = {
  [OutgoingEvent.SendName]: string;
  [OutgoingEvent.SendAge]: number;
  [OutgoingEvent.SendPerson]: { name: string; age: number };
};

// It's important to use interfaces instead of `type Combined = OutgoingEvents & IncommingEvents` while combining `Events` to keep 100% type safety!
interface IMyEventEmitterEvents extends OutgoingEvents, IncommingEvents {}

class BidirectionalCommunication extends TypedEventEmitter<
  IMyEventEmitterEvents
> {}

const ee = new BidirectionalCommunication();

ee.emit(OutgoingEvent.SendName, "name"); // ok
ee.emit(OutgoingEvent.SendName, 123); // wrong type - TS error

ee.emit(OutgoingEvent.SendAge, 20); // ok
ee.emit(OutgoingEvent.SendAge, "20"); // wrong type - TS error

ee.emit(OutgoingEvent.SendPerson, { name: "name", age: 123 }); // ok
ee.emit(OutgoingEvent.SendPerson, { name: "name" }); // wrong type - TS error

ee.on(IncommingEvent.SomeData, payload => {}); // type === number[]
ee.on(IncommingEvent.SomeOtherData, payload => {}); // type === {}
ee.on(IncommingEvent.SomeOtherOtherData, payload => {}); // type === { name: string; age: number };
```