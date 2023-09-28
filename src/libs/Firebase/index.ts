import {StartTrace, StopTrace} from './types';

/** Web does not use Firebase for performance tracing */
const startTrace: StartTrace = () => {};
const stopTrace: StopTrace = () => {};

export default {
    startTrace,
    stopTrace,
};
