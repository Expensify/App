import PushNotification from '../../libs/Notification/PushNotification';
import {subscribeToReportCommentPushNotifications} from '../../libs/actions/Report';
import Performance from '../../libs/Performance';

export default function () {
    /*
     * Register callbacks for push notifications.
     * When the app is completely closed, this code will be executed by a headless JS process thanks to magic in the UrbanAirship RN library.
     * However, the main App component will not be mounted in this headless context, so we must register these callbacks outside of any React lifecycle.
     * Otherwise, they will not be executed when the app is completely closed, and the push notification won't update the app data.
     */
    PushNotification.init();
    subscribeToReportCommentPushNotifications();

    // Setup Flipper plugins when on dev
    if (__DEV__) {
        require('flipper-plugin-bridgespy-client');
        const RNAsyncStorageFlipper = require('rn-async-storage-flipper').default;
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        RNAsyncStorageFlipper(AsyncStorage);
    }

    Performance.setupPerformanceObserver();
}
