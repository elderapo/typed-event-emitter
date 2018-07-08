import { TypedEventEmitter } from "../TypedEventEmitter";

// Process extends from EventEmitter
global.process.on("uncaughtException", ex => {
  console.log("Caught from eventEmitter", ex.message);
});

enum ProcessEvent {
  UncaughtException = "uncaughtException"
}

type ProcessEvents = {
  [ProcessEvent.UncaughtException]: Error;
};

const typedEventEmitter = TypedEventEmitter.fromEventEmitter<ProcessEvents>(global.process);

typedEventEmitter.on(ProcessEvent.UncaughtException, ex => {
  console.log("Caught from typedEventEmitter", ex.message); // type ex === Error
});

throw new Error("Hehuheuheueh");
