import crashlytics from '@react-native-firebase/crashlytics';
import CONFIG from '../../CONFIG';
import PushNotification from '../../libs/Notification/PushNotification';
import Performance from '../../libs/Performance';
import subscribeToReportCommentPushNotifications from '../../libs/Notification/PushNotification/subscribeToReportCommentPushNotifications';

export default function () {
    // We do not want to send crash reports if we are on a locally built release version of the app.
    // Crashlytics is disabled by default for debug builds, but not local release builds so we are using
    // an environment variable to enable them in the staging & production apps and opt-out everywhere else.
    if (!CONFIG.SEND_CRASH_REPORTS) {
        crashlytics().setCrashlyticsCollectionEnabled(false);
    }

    /*
     * Register callbacks for push notifications.
     * When the app is completely closed, this code will be executed by a headless JS process thanks to magic in the UrbanAirship RN library.
     * However, the main App component will not be mounted in this headless context, so we must register these callbacks outside of any React lifecycle.
     * Otherwise, they will not be executed when the app is completely closed, and the push notification won't update the app data.
     */
    PushNotification.init();
    subscribeToReportCommentPushNotifications();

    Performance.setupPerformanceObserver();
}
