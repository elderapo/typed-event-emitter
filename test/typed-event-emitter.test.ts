import { TypedEventEmitter } from "../src/typed-event-emitter";
import { EventEmitter } from "events";

describe("TypedEventEmitter test", () => {
  it("addListener", done => {
    expect.assertions(2);

    const enum Event {
      SomeEvent1,
      SomeEvent2
    }

    interface Events {
      [Event.SomeEvent1]: string;
      [Event.SomeEvent2]: number;
    }

    const eventEmitter = new TypedEventEmitter<Events>();

    eventEmitter.addListener(Event.SomeEvent1, payload => {
      expect(payload).toBe("some payload");
      done();
    });

    eventEmitter.addListener(Event.SomeEvent2, payload => {
      expect(payload).toBe(666);
      done();
    });

    eventEmitter.emit(Event.SomeEvent1, "some payload");
    eventEmitter.emit(Event.SomeEvent2, 666);
  });

  it("on", done => {
    expect.assertions(2);

    const enum Event {
      SomeEvent1,
      SomeEvent2
    }

    interface Events {
      [Event.SomeEvent1]: string;
      [Event.SomeEvent2]: number;
    }

    const eventEmitter = new TypedEventEmitter<Events>();

    eventEmitter.on(Event.SomeEvent1, payload => {
      expect(payload).toBe("some payload");
      done();
    });

    eventEmitter.on(Event.SomeEvent2, payload => {
      expect(payload).toBe(666);
      done();
    });

    eventEmitter.emit(Event.SomeEvent1, "some payload");
    eventEmitter.emit(Event.SomeEvent2, 666);
  });

  it("once", done => {
    expect.assertions(1);

    const enum Event {
      SomeEvent
    }

    interface Events {
      [Event.SomeEvent]: string;
    }

    const eventEmitter = new TypedEventEmitter<Events>();

    let onceRecvCount = 0;
    eventEmitter.once(Event.SomeEvent, payload => {
      onceRecvCount++;
    });

    eventEmitter.on(Event.SomeEvent, payload => {
      if (payload === "last") {
        expect(onceRecvCount).toBe(1);
        done();
      }
    });

    eventEmitter.emit(Event.SomeEvent, "first");
    eventEmitter.emit(Event.SomeEvent, "aaa");
    eventEmitter.emit(Event.SomeEvent, "bbb");
    eventEmitter.emit(Event.SomeEvent, "ccc");
    eventEmitter.emit(Event.SomeEvent, "last");
  });

  it("removeListener", done => {
    expect.assertions(1);

    const enum Event {
      SomeEvent
    }

    interface Events {
      [Event.SomeEvent]: string;
    }

    const eventEmitter = new TypedEventEmitter<Events>();

    let handlerCallsCount = 0;
    const handler = payload => {
      handlerCallsCount++;
    };

    const handler2 = payload => {
      handler(payload);
    };

    const remove1 = eventEmitter.on(Event.SomeEvent, handler);
    const remove2 = eventEmitter.once(Event.SomeEvent, handler);
    eventEmitter.on(Event.SomeEvent, handler2);

    eventEmitter.emit(Event.SomeEvent, "first");

    remove1();
    remove2();
    eventEmitter.removeListener(Event.SomeEvent, handler2);

    eventEmitter.emit(Event.SomeEvent, "last");

    setImmediate(() => {
      expect(handlerCallsCount).toBe(3);
      done();
    });
  });

  it("removeAllListeners", done => {
    expect.assertions(1);

    const enum Event {
      SomeEvent
    }

    interface Events {
      [Event.SomeEvent]: string;
    }

    const eventEmitter = new TypedEventEmitter<Events>();

    let handlerCallsCount = 0;
    const handler = payload => {
      handlerCallsCount++;
    };

    eventEmitter.on(Event.SomeEvent, handler);
    eventEmitter.once(Event.SomeEvent, handler);
    eventEmitter.on(Event.SomeEvent, handler);

    eventEmitter.emit(Event.SomeEvent, "payload");

    eventEmitter.removeAllListeners(Event.SomeEvent);

    eventEmitter.emit(Event.SomeEvent, "payload");

    eventEmitter.on(Event.SomeEvent, handler);
    eventEmitter.once(Event.SomeEvent, handler);
    eventEmitter.on(Event.SomeEvent, handler);

    eventEmitter.removeAllListeners();

    eventEmitter.emit(Event.SomeEvent, "payload");

    setImmediate(() => {
      expect(handlerCallsCount).toBe(3);
      done();
    });
  });

  it("setMaxListeners/getMaxListeners", () => {
    const eventEmitter = new TypedEventEmitter<{}>();

    expect(eventEmitter.getMaxListeners()).toBe(EventEmitter.defaultMaxListeners);

    eventEmitter.setMaxListeners(666);

    expect(eventEmitter.getMaxListeners()).toBe(666);
  });

  it("listeners", () => {
    const enum Event {
      SomeEvent1,
      SomeEvent2 = "SomeEvent2"
    }

    interface Events {
      [Event.SomeEvent1]: string;
      [Event.SomeEvent2]: number;
    }

    const eventEmitter = new TypedEventEmitter<Events>();

    const handler = () => {};

    eventEmitter.on(Event.SomeEvent1, handler);
    eventEmitter.once(Event.SomeEvent1, handler);
    eventEmitter.on(Event.SomeEvent1, handler);

    eventEmitter.on(Event.SomeEvent2, handler);
    eventEmitter.once(Event.SomeEvent2, handler);
    eventEmitter.on(Event.SomeEvent2, handler);
    eventEmitter.on(Event.SomeEvent2, handler);

    expect(eventEmitter.listeners(Event.SomeEvent1).length).toBe(3);
    expect(eventEmitter.listeners(Event.SomeEvent2).length).toBe(4);
  });

  it("eventNames", () => {
    const enum Event {
      SomeEvent1,
      SomeEvent2 = "SomeEvent2"
    }

    interface Events {
      [Event.SomeEvent1]: string;
      [Event.SomeEvent2]: number;
    }

    const eventEmitter = new TypedEventEmitter<Events>();

    const handler = () => {};

    eventEmitter.on(Event.SomeEvent1, handler);
    eventEmitter.once(Event.SomeEvent1, handler);
    eventEmitter.on(Event.SomeEvent1, handler);

    eventEmitter.on(Event.SomeEvent2, handler);
    eventEmitter.once(Event.SomeEvent2, handler);
    eventEmitter.on(Event.SomeEvent2, handler);
    eventEmitter.on(Event.SomeEvent2, handler);

    expect(eventEmitter.eventNames()).toMatchObject([Event.SomeEvent1, Event.SomeEvent2]);
  });

  it("listenerCount", () => {
    const enum Event {
      SomeEvent1,
      SomeEvent2,
      SomeEvent3
    }

    interface Events {
      [Event.SomeEvent1]: string;
      [Event.SomeEvent2]: number;
      [Event.SomeEvent3]: { b: string };
    }

    const eventEmitter = new TypedEventEmitter<Events>();

    const handler = () => {};

    eventEmitter.addListener(Event.SomeEvent1, handler);
    eventEmitter.once(Event.SomeEvent1, handler);
    eventEmitter.on(Event.SomeEvent1, handler);

    eventEmitter.addListener(Event.SomeEvent2, handler);
    eventEmitter.once(Event.SomeEvent2, handler);
    eventEmitter.on(Event.SomeEvent2, handler);
    eventEmitter.on(Event.SomeEvent2, handler);

    expect(eventEmitter.listenerCount(Event.SomeEvent1)).toBe(3);
    expect(eventEmitter.listenerCount(Event.SomeEvent2)).toBe(4);
    expect(eventEmitter.listenerCount(Event.SomeEvent3)).toBe(0);
  });
});
