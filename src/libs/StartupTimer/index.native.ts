import {NativeModules} from 'react-native';
import type StartupTimer from './types';

/**
 * Stop the startup trace for the app.
 */
const startupTimer: StartupTimer = {
    stop: () => {
        (NativeModules.StartupTimer as StartupTimer).stop();
    },
};

export default startupTimer;
