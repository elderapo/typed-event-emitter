import { TypedEventEmitter } from "../src/typed-event-emitter";

const createNOPFunction = () => () => {}; // tslint:disable-line

describe("TypedEventEmitter test", () => {
  it("on", done => {
    expect.assertions(2);

    enum Event {
      SomeEvent1,
      SomeEvent2
    }

    type Events = {
      [Event.SomeEvent1]: string;
      [Event.SomeEvent2]: number;
    };

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

    enum Event {
      SomeEvent
    }

    type Events = {
      [Event.SomeEvent]: string;
    };

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

  it("prependListener", () => {
    enum Event {
      SomeEvent
    }

    type Events = {
      [Event.SomeEvent]: string;
    };

    const eventEmitter = new TypedEventEmitter<Events>();

    const handlerPrepended = createNOPFunction();
    const handler1 = createNOPFunction();
    const handler2 = createNOPFunction();
    const handler3 = createNOPFunction();

    eventEmitter.on(Event.SomeEvent, handler1);
    eventEmitter.on(Event.SomeEvent, handler2);
    eventEmitter.prependListener(Event.SomeEvent, handlerPrepended);
    eventEmitter.on(Event.SomeEvent, handler3);

    expect(eventEmitter.listeners(Event.SomeEvent)).toMatchObject([
      handlerPrepended,
      handler1,
      handler2,
      handler3
    ]);
  });

  it("prependOnceListener", () => {
    enum Event {
      SomeEvent
    }

    type Events = {
      [Event.SomeEvent]: string;
    };

    const eventEmitter = new TypedEventEmitter<Events>();

    const handlerPrepended = createNOPFunction();
    const handler1 = createNOPFunction();
    const handler2 = createNOPFunction();
    const handler3 = createNOPFunction();

    eventEmitter.once(Event.SomeEvent, handler1);
    eventEmitter.once(Event.SomeEvent, handler2);
    eventEmitter.prependOnceListener(Event.SomeEvent, handlerPrepended);
    eventEmitter.once(Event.SomeEvent, handler3);

    expect(eventEmitter.listeners(Event.SomeEvent)).toMatchObject([
      handlerPrepended,
      handler1,
      handler2,
      handler3
    ]);
  });

  it("removeListener", done => {
    expect.assertions(1);

    enum Event {
      SomeEvent
    }

    type Events = {
      [Event.SomeEvent]: string;
    };

    const eventEmitter = new TypedEventEmitter<Events>();

    let handlerCallsCount = 0;
    const handler = payload => {
      handlerCallsCount++;
    };

    const handler1 = payload => handler(payload);
    const handler2 = payload => handler(payload);
    const handler3 = payload => handler(payload);
    const handler4 = payload => handler(payload);
    const handler5 = payload => handler(payload);

    const remove1 = eventEmitter.on(Event.SomeEvent, handler1);
    const remove2 = eventEmitter.once(Event.SomeEvent, handler2);
    const remove3 = eventEmitter.prependListener(Event.SomeEvent, handler3);
    const remove4 = eventEmitter.prependOnceListener(Event.SomeEvent, handler4);
    eventEmitter.on(Event.SomeEvent, handler5);

    eventEmitter.emit(Event.SomeEvent, "first");

    remove1();
    remove2();
    remove3();
    remove4();
    eventEmitter.removeListener(Event.SomeEvent, handler5);

    eventEmitter.emit(Event.SomeEvent, "last");

    setImmediate(() => {
      expect(handlerCallsCount).toBe(5);
      done();
    });
  });

  it("removeAllListeners", done => {
    expect.assertions(1);

    enum Event {
      SomeEvent
    }

    type Events = {
      [Event.SomeEvent]: string;
    };

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

    expect(eventEmitter.getMaxListeners()).toBe(TypedEventEmitter.defaultMaxListeners);

    eventEmitter.setMaxListeners(666);

    expect(eventEmitter.getMaxListeners()).toBe(666);
  });

  it("listeners", () => {
    enum Event {
      SomeEvent1,
      SomeEvent2 = "SomeEvent2"
    }

    type Events = {
      [Event.SomeEvent1]: string;
      [Event.SomeEvent2]: number;
    };

    const eventEmitter = new TypedEventEmitter<Events>();

    const handler = createNOPFunction();

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

  it("eventIdentifiers", () => {
    enum Event {
      SomeEvent1,
      SomeEvent2 = "SomeEvent2"
    }

    type Events = {
      [Event.SomeEvent1]: string;
      [Event.SomeEvent2]: number;
    };

    const eventEmitter = new TypedEventEmitter<Events>();

    const handler = createNOPFunction();

    eventEmitter.on(Event.SomeEvent1, handler);
    eventEmitter.once(Event.SomeEvent1, handler);
    eventEmitter.on(Event.SomeEvent1, handler);

    eventEmitter.on(Event.SomeEvent2, handler);
    eventEmitter.once(Event.SomeEvent2, handler);
    eventEmitter.on(Event.SomeEvent2, handler);
    eventEmitter.on(Event.SomeEvent2, handler);

    expect(eventEmitter.eventIdentifiers()).toMatchObject([Event.SomeEvent1, Event.SomeEvent2]);
  });

  it("listenerCount", () => {
    enum Event {
      SomeEvent1,
      SomeEvent2,
      SomeEvent3
    }

    type Events = {
      [Event.SomeEvent1]: string;
      [Event.SomeEvent2]: number;
      [Event.SomeEvent3]: { b: string };
    };

    const eventEmitter = new TypedEventEmitter<Events>();

    const handler = createNOPFunction();

    eventEmitter.once(Event.SomeEvent1, handler);
    eventEmitter.on(Event.SomeEvent1, handler);

    eventEmitter.once(Event.SomeEvent2, handler);
    eventEmitter.on(Event.SomeEvent2, handler);
    eventEmitter.on(Event.SomeEvent2, handler);

    expect(eventEmitter.listenerCount(Event.SomeEvent1)).toBe(2);
    expect(eventEmitter.listenerCount(Event.SomeEvent2)).toBe(3);
    expect(eventEmitter.listenerCount(Event.SomeEvent3)).toBe(0);
  });

  it("afterAddEventListener", () => {
    enum Event {
      SomeEvent
    }

    type Events = {
      [Event.SomeEvent]: string;
    };

    const eventEmitter = new TypedEventEmitter<Events>();

    const originalConoleWarn = console.warn;

    console.warn = jest.fn();

    for (let i = 0; i < 666; i++) {
      eventEmitter.on(Event.SomeEvent, createNOPFunction());
    }

    expect(console.warn).toHaveBeenCalledTimes(656);

    console.warn = originalConoleWarn;
  });
});
