import { StrictEventEmitter } from "../src/StrictEventEmitter";
import { createNOPFunction } from "./utils";

describe("StrictEventEmitter.test", () => {
  it("should print warning about possible leak", () => {
    const ee = new StrictEventEmitter();

    const originalWarn = console.warn.bind(console);
    global.console.warn = jest.fn();

    expect(console.warn).not.toBeCalled();

    for (let i = 0; i < 100; i++) {
      ee.on("some-event", createNOPFunction());
    }
    expect(console.warn).toBeCalled();

    console.warn = originalWarn;
  });

  it("should return same arrays for listeners and rawListeners", () => {
    const ee = new StrictEventEmitter();

    const event = "some-event";
    const event2 = "some-event-2";

    expect(ee.listeners(event)).toBe(ee.rawListeners(event));
    expect(ee.listeners(event2)).not.toBe(ee.rawListeners(event));
  });

  it("should call removeListener when calling off", () => {
    const ee = new StrictEventEmitter();

    ee.removeListener = jest.fn();

    const event = "some-event";
    const listener = createNOPFunction();

    ee.off(event, listener);

    expect(ee.removeListener).toBeCalledWith(event, listener);
  });

  it("should throw on incorrect direction", () => {
    const ee = new StrictEventEmitter();

    expect(() => {
      ee["internalAddListener"]("event-name", createNOPFunction, true, "wrong dir" as any);
    }).toThrowError();
  });
});
