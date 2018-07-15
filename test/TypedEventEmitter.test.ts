import { EventEmitter } from "events";
import { TypedEventEmitter } from "../src/TypedEventEmitter";
import { performUniversalTests } from "./performUniversalTests";
import { waitForSetImmediate } from "./utils";

describe("TypedEventEmitter", () => {
  performUniversalTests(TypedEventEmitter);

  it("from EventEmitter", async done => {
    expect.assertions(8);

    enum Event {
      SomeEvent1,
      SomeEvent2
    }

    type Events = {
      [Event.SomeEvent1]: string;
      [Event.SomeEvent2]: number;
    };

    const eventEmitter = new EventEmitter();
    const tee = TypedEventEmitter.fromEventEmitter<Events>(eventEmitter);

    const handler1 = jest.fn();
    const handler2 = jest.fn();
    const handler3 = jest.fn();
    const handler4 = jest.fn();

    eventEmitter.on(Event.SomeEvent1 as any, handler1);
    eventEmitter.once(Event.SomeEvent1 as any, handler2);
    tee.on(Event.SomeEvent1, handler3);
    tee.once(Event.SomeEvent1, handler4);

    tee.emit(Event.SomeEvent1, "payload 123");
    await waitForSetImmediate();

    [handler1, handler2, handler3, handler4].map(h => expect(h).toBeCalledWith("payload 123"));

    const handler5 = jest.fn();
    const handler6 = jest.fn();
    const handler7 = jest.fn();
    const handler8 = jest.fn();

    eventEmitter.on(Event.SomeEvent1 as any, handler5);
    eventEmitter.once(Event.SomeEvent1 as any, handler6);
    tee.on(Event.SomeEvent1, handler7);
    tee.once(Event.SomeEvent1, handler8);

    eventEmitter.emit(Event.SomeEvent1 as any, "payload 666");
    await waitForSetImmediate();

    [handler5, handler6, handler7, handler8].map(h => expect(h).toBeCalledWith("payload 666"));

    done();
  });
});
