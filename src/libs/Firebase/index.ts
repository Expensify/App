import {StartTrace, StopTrace} from './types';

/** Web does not use Firebase for performance tracing */
const startTrace: StartTrace = (customEventName: string) => {};
const stopTrace: StopTrace = (customEventName: string) => {};

export default {
    startTrace,
    stopTrace,
};
