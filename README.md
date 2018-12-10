# @elderapo/typed-event-emitter

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Greenkeeper badge](https://badges.greenkeeper.io/elderapo/typed-event-emitter.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/elderapo/typed-event-emitter.svg?branch=master)](https://travis-ci.org/elderapo/typed-event-emitter)
[![AppVeyor](https://ci.appveyor.com/api/projects/status/emtsip4f89a8y0h8?svg=true)](https://ci.appveyor.com/project/elderapo/typed-event-emitter)
[![Coveralls](https://img.shields.io/coveralls/elderapo/typed-event-emitter.svg)](https://coveralls.io/github/elderapo/typed-event-emitter)
[![Dev Dependencies](https://david-dm.org/elderapo/typed-event-emitter/dev-status.svg)](https://david-dm.org/elderapo/typed-event-emitter?type=dev)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Felderapo%2Ftyped-event-emitter.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Felderapo%2Ftyped-event-emitter?ref=badge_shield)

Strongly typed event emitter with API similar to native [EventEmitter](https://nodejs.org/api/events.html).

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

### [More examples](https://github.com/elderapo/typed-event-emitter/tree/master/src/examples)

### Cavecats:

```typescript
import { TypedEventEmitter } from "@elderapo/typed-event-emitter";
import { EventEmitter } from "events";

// some event emitter from external library
const ee = new EventEmitter();

setInterval(() => {
  ee.emit("0"); // <-- notice "0" instead of 0
}, 500);

enum Event {
  SomeEvent // === 0 number
}

type Events = {
  [Event.SomeEvent]: void;
};

const tee = TypedEventEmitter.fromEventEmitter<Events>(ee);

/*
	For EventEmitter "0" and 0 are the same because it uses basic {} as key/value:

	const a = {};
	a[123] = 123;
	a["123"]++;
	a[123] === 124; // true
*/

tee.on(Event.SomeEvent, () => {
  console.log(`Received event!`);
});
```


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Felderapo%2Ftyped-event-emitter.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Felderapo%2Ftyped-event-emitter?ref=badge_large)