// This file is lazy-loaded. Its static imports are deferred until
// after the splash screen hides (when this component first renders).
// This prevents their Onyx collection subscriptions from competing
// with critical-path reads during app startup.
import './libs/actions/replaceOptimisticReportWithActualReport';
import './libs/Notification/PushNotification/subscribeToPushNotifications';
import './libs/registerPaginationConfig';
import './libs/UnreadIndicatorUpdater';

export default function PostSplashScreenImporter() {
    return null;
}
