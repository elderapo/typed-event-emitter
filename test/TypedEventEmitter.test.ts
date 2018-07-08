import { TypedEventEmitter } from "../src/TypedEventEmitter";
import { InternalEventEmitter } from "../src/InternalEventEmitter";
import { EventEmitter } from "events";
import { promisify } from "util";

const createNOPFunction = () => () => {}; // tslint:disable-line
const waitForSetImmediate = promisify(setImmediate);

describe("TypedEventEmitter", () => {
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
    const handler6 = payload => handler(payload);

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
    eventEmitter.off(Event.SomeEvent, handler6);

    eventEmitter.emit(Event.SomeEvent, "last");

    setImmediate(() => {
      expect(handlerCallsCount).toBe(5);
      done();
    });
  });

  it("removeAllListeners", () => {
    enum Event {
      SomeEvent1,
      SomeEvent2,
      SomeEvent3
    }

    type Events = {
      [Event.SomeEvent1]: string;
      [Event.SomeEvent2]: number;
      [Event.SomeEvent3]: "aa" | "bb";
    };

    const eventEmitter = new TypedEventEmitter<Events>();

    eventEmitter.on(Event.SomeEvent1, createNOPFunction());
    eventEmitter.on(Event.SomeEvent1, createNOPFunction());
    eventEmitter.once(Event.SomeEvent1, createNOPFunction());

    eventEmitter.once(Event.SomeEvent3, createNOPFunction());

    expect(eventEmitter.listeners(Event.SomeEvent1).length).toBe(3);
    expect(eventEmitter.listeners(Event.SomeEvent2).length).toBe(0);
    expect(eventEmitter.listeners(Event.SomeEvent3).length).toBe(1);

    eventEmitter.removeAllListeners(Event.SomeEvent1);

    expect(eventEmitter.listeners(Event.SomeEvent1).length).toBe(0);
    expect(eventEmitter.listeners(Event.SomeEvent2).length).toBe(0);
    expect(eventEmitter.listeners(Event.SomeEvent3).length).toBe(1);

    eventEmitter.removeAllListeners();

    expect(eventEmitter.listeners(Event.SomeEvent1).length).toBe(0);
    expect(eventEmitter.listeners(Event.SomeEvent2).length).toBe(0);
    expect(eventEmitter.listeners(Event.SomeEvent3).length).toBe(0);
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

  it("inheritance", done => {
    expect.assertions(3);

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

    ee.on(OutgoingEvent.SendName, payload => {
      expect(payload).toBe("name");
      done();
    });

    ee.on(OutgoingEvent.SendAge, payload => {
      expect(payload).toBe(20);
      done();
    });

    ee.on(IncommingEvent.SomeData, payload => {
      expect(payload).toMatchObject([1, 2, 3]);
      done();
    });

    ee.emit(OutgoingEvent.SendName, "name");
    ee.emit(OutgoingEvent.SendAge, 20);
    ee.emit(IncommingEvent.SomeData, [1, 2, 3]);
  });

  it("from InternalEventEmitter", done => {
    const eventEmitter = new InternalEventEmitter();
    testEventEmitter(eventEmitter, done);
  });

  it("from native EventEmitter (NodeJS)", done => {
    const eventEmitter = new EventEmitter();
    testEventEmitter(eventEmitter as InternalEventEmitter, done);
  });
});

const testEventEmitter = async (eventEmitter: InternalEventEmitter, done: jest.DoneCallback) => {
  expect.assertions(8);

  enum Event {
    SomeEvent1,
    SomeEvent2
  }

  type Events = {
    [Event.SomeEvent1]: string;
    [Event.SomeEvent2]: number;
  };

  const tee = TypedEventEmitter.fromEventEmitter<Events>(eventEmitter);

  const handler1 = jest.fn();
  const handler2 = jest.fn();
  const handler3 = jest.fn();
  const handler4 = jest.fn();

  eventEmitter.on(Event.SomeEvent1, handler1);
  eventEmitter.once(Event.SomeEvent1, handler2);
  tee.on(Event.SomeEvent1, handler3);
  tee.once(Event.SomeEvent1, handler4);

  tee.emit(Event.SomeEvent1, "payload 123");
  await waitForSetImmediate();

  [handler1, handler2, handler3, handler4].map(h => expect(h).toBeCalledWith("payload 123"));

  const handler5 = jest.fn();
  const handler6 = jest.fn();
  const handler7 = jest.fn();
  const handler8 = jest.fn();

  eventEmitter.on(Event.SomeEvent1, handler5);
  eventEmitter.once(Event.SomeEvent1, handler6);
  tee.on(Event.SomeEvent1, handler7);
  tee.once(Event.SomeEvent1, handler8);

  eventEmitter.emit(Event.SomeEvent1, "payload 666");
  await waitForSetImmediate();

  [handler5, handler6, handler7, handler8].map(h => expect(h).toBeCalledWith("payload 666"));

  done();
};
