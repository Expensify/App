import type {Log, StartTrace, StopTrace} from './types';

/** Do not use Firebase in the context of SSR */
const startTrace: StartTrace = () => {};
const stopTrace: StopTrace = () => {};
const log: Log = () => {};

export default {
    startTrace,
    stopTrace,
    log,
};
