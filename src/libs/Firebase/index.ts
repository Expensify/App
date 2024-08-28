import type {Log, StartTrace, StopTrace} from './types';

/** Web does not use Firebase for performance tracing */
const startTrace: StartTrace = () => {};
const stopTrace: StopTrace = () => {};
const log: Log = () => {};

export default {
    startTrace,
    stopTrace,
    log,
};
