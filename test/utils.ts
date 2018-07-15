import { promisify } from "util";

export const createNOPFunction = () => () => {}; // tslint:disable-line
export const waitForSetImmediate = promisify(setImmediate);
