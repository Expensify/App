/**
 * Web noop as there is no "startup" to time from the native layer.
 */

import StartupTimerStop from './types';

const startupTimer: StartupTimerStop = {
    stop: () => {},
};

export default startupTimer;
