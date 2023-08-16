import Onyx from 'react-native-onyx';
import PushNotification from '.';
import ROUTES from '../../../ROUTES';
import Log from '../../Log';
import Navigation from '../../Navigation/Navigation';
import Visibility from '../../Visibility';
import backgroundRefresh from './backgroundRefresh';

/**
 * Setup reportComment push notification callbacks.
 */
export default function subscribeToReportCommentPushNotifications() {
    PushNotification.onReceived(PushNotification.TYPE.REPORT_COMMENT, ({reportID, reportActionID, onyxData}) => {
        Log.info(`[PushNotification] received report comment notification in the ${Visibility.isVisible() ? 'foreground' : 'background'}`, false, {reportID, reportActionID});
        Onyx.update(onyxData);
        backgroundRefresh();
    });

    // Open correct report when push notification is clicked
    PushNotification.onSelected(PushNotification.TYPE.REPORT_COMMENT, ({reportID, reportActionID}) => {
        if (!reportID) {
            Log.warn('[PushNotification] This push notification has no reportID');
        }

        Log.info('[PushNotification] onSelected() - called', false, {reportID, reportActionID});
        Navigation.isNavigationReady().then(() => {
            try {
                // If a chat is visible other than the one we are trying to navigate to, then we need to navigate back
                if (Navigation.getActiveRoute().slice(1, 2) === ROUTES.REPORT && !Navigation.isActiveRoute(`r/${reportID}`)) {
                    Navigation.goBack();
                }

                Log.info('[PushNotification] onSelected() - Navigation is ready. Navigating...', false, {reportID, reportActionID});
                Navigation.navigate(ROUTES.getReportRoute(reportID));
            } catch (error) {
                Log.alert('[PushNotification] onSelected() - failed', {reportID, reportActionID, error: error.message});
            }
        });
    });
}
