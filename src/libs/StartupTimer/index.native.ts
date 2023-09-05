import {NativeModules} from 'react-native';
import StartupTimerStop from './types';

/**
 * Stop the startup trace for the app.
 */
const stop: StartupTimerStop = () => {
    NativeModules.StartupTimer.stop();
};

export default {
    stop,
};
