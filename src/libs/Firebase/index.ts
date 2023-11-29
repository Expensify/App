import {StartTrace, StopTrace, TrackScreen} from './types';

/** Web does not use Firebase for performance tracing */
const startTrace: StartTrace = () => {};
const stopTrace: StopTrace = () => {};
const trackScreen: TrackScreen = () => {};

export default {
    startTrace,
    stopTrace,
    trackScreen,
};
