import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import getPolicyMemberAccountIDs from '@libs/PolicyMembersUtils';
import {extractPolicyIDFromPath} from '@libs/PolicyUtils';
import {doesReportBelongToWorkspace, getReport} from '@libs/ReportUtils';
import Visibility from '@libs/Visibility';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import backgroundRefresh from './backgroundRefresh';
import PushNotification from './index';

let lastVisitedPath: string | undefined;
Onyx.connect({
    key: ONYXKEYS.LAST_VISITED_PATH,
    callback: (value) => {
        if (!value) {
            return;
        }
        lastVisitedPath = value;
    },
});

/**
 * Setup reportComment push notification callbacks.
 */
export default function subscribeToReportCommentPushNotifications() {
    PushNotification.onReceived(PushNotification.TYPE.REPORT_COMMENT, ({reportID, reportActionID, onyxData}) => {
        Log.info(`[PushNotification] received report comment notification in the ${Visibility.isVisible() ? 'foreground' : 'background'}`, false, {reportID, reportActionID});
        Onyx.update(onyxData ?? []);
        backgroundRefresh();
    });

    // Open correct report when push notification is clicked
    PushNotification.onSelected(PushNotification.TYPE.REPORT_COMMENT, ({reportID, reportActionID}) => {
        if (!reportID) {
            Log.warn('[PushNotification] This push notification has no reportID');
        }

        const policyID = lastVisitedPath && extractPolicyIDFromPath(lastVisitedPath);
        const report = getReport(reportID.toString());
        const policyMembersAccountIDs = policyID ? getPolicyMemberAccountIDs(policyID) : [];

        const reportBelongsToWorkspace = policyID && !isEmptyObject(report) && doesReportBelongToWorkspace(report, policyID, policyMembersAccountIDs);

        Log.info('[PushNotification] onSelected() - called', false, {reportID, reportActionID});
        Navigation.isNavigationReady()
            .then(Navigation.waitForProtectedRoutes)
            .then(() => {
                try {
                    // If a chat is visible other than the one we are trying to navigate to, then we need to navigate back
                    if (Navigation.getActiveRoute().slice(1, 2) === ROUTES.REPORT && !Navigation.isActiveRoute(`r/${reportID}`)) {
                        Navigation.goBack(ROUTES.HOME);
                    }

                    Log.info('[PushNotification] onSelected() - Navigation is ready. Navigating...', false, {reportID, reportActionID});
                    if (!reportBelongsToWorkspace) {
                        Navigation.navigateWithSwitchPolicyID({policyID: undefined, route: ROUTES.HOME});
                    }
                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(String(reportID)));
                } catch (error) {
                    let errorMessage = String(error);
                    if (error instanceof Error) {
                        errorMessage = error.message;
                    }

                    Log.alert('[PushNotification] onSelected() - failed', {reportID, reportActionID, error: errorMessage});
                }
            });
    });
}
