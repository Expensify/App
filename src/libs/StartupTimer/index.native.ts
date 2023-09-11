import {NativeModules} from 'react-native';
import StartupTimerStop from './types';

/**
 * Stop the startup trace for the app.
 */
const startupTimer: StartupTimerStop = {
    stop: () => {
        NativeModules.StartupTimer.stop();
    },
};

export default startupTimer;
