import PushNotification from '../../libs/Notification/PushNotification';
import {subscribeToReportCommentPushNotifications} from '../../libs/actions/Report';
import {setupPerformanceObserver} from '../../libs/Performance';

/**
 * Register callbacks for push notifications.
 * This must happen outside of any React lifecycle in order for the headless JS process to work.
 */
export default function () {
    PushNotification.init();
    subscribeToReportCommentPushNotifications();

    // Setup Flipper plugins when on dev
    if (__DEV__) {
        require('flipper-plugin-bridgespy-client');
        const RNAsyncStorageFlipper = require('rn-async-storage-flipper').default;
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        RNAsyncStorageFlipper(AsyncStorage);
    }

    setupPerformanceObserver();
}
