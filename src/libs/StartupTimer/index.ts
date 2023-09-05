/**
 * Web noop as there is no "startup" to time from the native layer.
 */

import StartupTimerStop from './types';

const stop: StartupTimerStop = () => {};

export default {
    stop,
};
