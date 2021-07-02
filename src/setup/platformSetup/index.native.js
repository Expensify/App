import PushNotification from '../../libs/Notification/PushNotification';
import {subscribeToReportCommentPushNotifications} from '../../libs/actions/Report';

/**
 * Register callbacks for push notifications.
 * This must happen outside of any React lifecycle in order for the headless JS process to work.
 */
export default function () {
    PushNotification.init();
    subscribeToReportCommentPushNotifications();
}
