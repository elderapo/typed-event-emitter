import { InternalEventEmitterEvent, TypedEventEmitter } from "../src";
import { createNOPFunction, waitForSetImmediate } from "./utils";

export const performUniversalTests = (TypedEventEmitterClass: typeof TypedEventEmitter) => {
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

    const eventEmitter = new TypedEventEmitterClass<Events>();

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

    const eventEmitter = new TypedEventEmitterClass<Events>();

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

    const eventEmitter = new TypedEventEmitterClass<Events>();

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

    const eventEmitter = new TypedEventEmitterClass<Events>();

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

  it("removeListener", async done => {
    expect.assertions(3);

    enum Event {
      SomeEvent,
      SomeEvent2 = "SOME_EVENT_2"
    }

    type Events = {
      [Event.SomeEvent]: string;
      [Event.SomeEvent2]: number;
    };

    const eventEmitter = new TypedEventEmitterClass<Events>();

    let handlerCallsCount = 0;
    const handler = () => {
      handlerCallsCount++;
    };

    const handler1 = () => handler();
    const handler2 = () => handler();
    const handler3 = () => handler();
    const handler4 = () => handler();
    const handler5 = () => handler();
    const handler6 = () => handler();

    eventEmitter.removeListener(Event.SomeEvent, handler1);

    const remove1 = eventEmitter.on(Event.SomeEvent, handler1);
    const remove2 = eventEmitter.once(Event.SomeEvent, handler2);
    const remove3 = eventEmitter.prependListener(Event.SomeEvent, handler3);
    const remove4 = eventEmitter.prependOnceListener(Event.SomeEvent, handler4);
    eventEmitter.on(Event.SomeEvent, handler5);
    eventEmitter.on(Event.SomeEvent2, handler6);

    eventEmitter.emit(Event.SomeEvent, "first");

    const handlerRemoveListener1 = jest.fn();

    eventEmitter.once(InternalEventEmitterEvent.RemoveListener, handlerRemoveListener1);

    remove1();
    await waitForSetImmediate();
    expect(handlerRemoveListener1).toBeCalledWith({
      event: Event.SomeEvent,
      listener: handler1
    });
    remove2();
    remove3();
    remove4();
    eventEmitter.removeListener(Event.SomeEvent, handler5);

    const handlerRemoveListener2 = jest.fn();
    eventEmitter.once(InternalEventEmitterEvent.RemoveListener, handlerRemoveListener2);

    eventEmitter.removeListener(Event.SomeEvent2, handler6);
    await waitForSetImmediate();
    expect(handlerRemoveListener2).toBeCalledWith({
      event: Event.SomeEvent2,
      listener: handler6
    });

    eventEmitter.emit(Event.SomeEvent, "last");

    await waitForSetImmediate();
    expect(handlerCallsCount).toBe(5);
    done();
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

    const eventEmitter = new TypedEventEmitterClass<Events>();

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

  it("setMaxListeners/getMaxListeners", () => {
    const eventEmitter = new TypedEventEmitterClass<{}>();

    expect(eventEmitter.getMaxListeners()).toBe(10);

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

    const eventEmitter = new TypedEventEmitterClass<Events>();

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

    const SymbolEvent = Symbol();

    type Events = {
      [Event.SomeEvent1]: string;
      [Event.SomeEvent2]: number;
      [SymbolEvent]: number;
    };

    const eventEmitter = new TypedEventEmitterClass<Events>();

    const handler = createNOPFunction();

    eventEmitter.on(Event.SomeEvent1, handler);
    eventEmitter.once(Event.SomeEvent1, handler);
    eventEmitter.on(Event.SomeEvent1, handler);

    eventEmitter.on(Event.SomeEvent2, handler);
    eventEmitter.once(Event.SomeEvent2, handler);
    eventEmitter.on(Event.SomeEvent2, handler);
    eventEmitter.on(Event.SomeEvent2, handler);

    eventEmitter.on(SymbolEvent, handler);

    expect(eventEmitter.eventIdentifiers()).toMatchObject([
      Event.SomeEvent1,
      Event.SomeEvent2,
      SymbolEvent
    ]);
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

    const eventEmitter = new TypedEventEmitterClass<Events>();

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

    class BidirectionalCommunication extends TypedEventEmitterClass<IMyEventEmitterEvents> {}

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
};
