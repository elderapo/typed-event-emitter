import { StrictTypedEventEmitter } from "../src";
import { performUniversalTests } from "./performUniversalTests";

describe("StrictTypedEventEmitter", () => {
  performUniversalTests(StrictTypedEventEmitter);

  it('should emit different events for 1 and "1"', async done => {
    expect.assertions(10);

    enum Event {
      SomeEvent0
    }

    type Events = {
      [Event.SomeEvent0]: string;
    };

    const eventEmitter = new StrictTypedEventEmitter<Events>();

    const handler1 = jest.fn();
    const handler2 = jest.fn();

    eventEmitter.on(Event.SomeEvent0, handler1);
    eventEmitter.on("0" as any, handler2);

    expect(handler1).not.toBeCalled();
    expect(handler2).not.toBeCalled();

    eventEmitter.emit(Event.SomeEvent0, "some payload");

    expect(handler1).toBeCalled();
    expect(handler2).not.toBeCalled();

    eventEmitter.emit("0" as any, "some payload 2");

    expect(handler1).toBeCalled();
    expect(handler2).toBeCalled();

    expect(handler1).toBeCalledWith("some payload");
    expect(handler2).toBeCalledWith("some payload 2");

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);

    done();
  });
});
