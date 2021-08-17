import {setupPerformanceObserver} from '../libs/Performance';

// Setup Flipper plugins when on dev
export default function () {
    // eslint-disable-next-line no-undef
    if (__DEV__) {
        require('flipper-plugin-bridgespy-client');
        const RNAsyncStorageFlipper = require('rn-async-storage-flipper').default;
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        RNAsyncStorageFlipper(AsyncStorage);
    }

    setupPerformanceObserver();
}
