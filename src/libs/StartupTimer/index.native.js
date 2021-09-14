import {NativeModules} from 'react-native';

/**
 * Stop the startup trace for the app.
 */
function stop() {
    NativeModules.StartupTimer.stop();
}

export default {
    stop,
};
