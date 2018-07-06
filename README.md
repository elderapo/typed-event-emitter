# @elderapo/typed-event-emitter

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Greenkeeper badge](https://badges.greenkeeper.io/elderapo/typed-event-emitter.svg)](https://greenkeeper.io/)
[![Travis](https://img.shields.io/travis/elderapo/typed-event-emitter.svg)](https://travis-ci.org/alexjoverm/elderapo/typed-event-emitter)
[![Coveralls](https://img.shields.io/coveralls/elderapo/typed-event-emitter.svg)](https://coveralls.io/github/elderapo/typed-event-emitter)
[![Dev Dependencies](https://david-dm.org/elderapo/typed-event-emitter/dev-status.svg)](https://david-dm.org/elderapo/typed-event-emitter?type=dev)

Strongly typed similar event emitter with similar API to native [EventEmitter](https://nodejs.org/api/events.html).

### How to install

```bash
yarn add @elderapo/typed-event-emitter
# or
npm install @elderapo/typed-event-emitter
```

### Usage

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
