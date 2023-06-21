import Onyx from 'react-native-onyx';
import PushNotification from '.';
import ROUTES from '../../../ROUTES';
import Log from '../../Log';
import Navigation from '../../Navigation/Navigation';

/**
 * Setup reportComment push notification callbacks.
 */
export default function subscribeToReportCommentPushNotifications() {
    PushNotification.onReceived(PushNotification.TYPE.REPORT_COMMENT, ({reportID, onyxData}) => {
        Log.info('[Report] Handled event sent by Airship', false, {reportID});
        Onyx.update(onyxData);
    });

    // Open correct report when push notification is clicked
    PushNotification.onSelected(PushNotification.TYPE.REPORT_COMMENT, ({reportID}) => {
        Navigation.isNavigationReady().then(() => {
            // If a chat is visible other than the one we are trying to navigate to, then we need to navigate back
            if (Navigation.getActiveRoute().slice(1, 2) === ROUTES.REPORT && !Navigation.isActiveRoute(`r/${reportID}`)) {
                Navigation.goBack();
            }

            Navigation.navigate(ROUTES.getReportRoute(reportID));
        });
    });
}
