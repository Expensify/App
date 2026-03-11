import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyTagLists, Report, ReportAction} from '@src/types/onyx';
import BrowserNotifications from './BrowserNotifications';
import type {LocalNotificationClickHandler, LocalNotificationModifiedExpenseParams, LocalNotificationModule} from './types';

let allPolicies: OnyxCollection<Policy>;
// eslint-disable-next-line rulesdir/no-onyx-connect -- temporary subscription for modified-expense notification; see https://github.com/Expensify/App/issues/66336
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => {
        allPolicies = value;
    },
});

let allPolicyTags: OnyxCollection<PolicyTagLists>;
// eslint-disable-next-line rulesdir/no-onyx-connect -- temporary subscription for modified-expense notification; see https://github.com/Expensify/App/issues/66336
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY_TAGS,
    waitForCollectionCallback: true,
    callback: (value) => {
        allPolicyTags = value;
    },
});

function showCommentNotification(report: Report, reportAction: ReportAction, onClick: LocalNotificationClickHandler) {
    BrowserNotifications.pushReportCommentNotification(report, reportAction, onClick, true);
}

function showUpdateAvailableNotification() {
    BrowserNotifications.pushUpdateAvailableNotification();
}

function showModifiedExpenseNotification({report, reportAction, movedFromReport, movedToReport, onClick, currentUserLogin}: LocalNotificationModifiedExpenseParams) {
    const policyID = report.policyID;
    const policyTags = policyID ? allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] : undefined;
    const policy = policyID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] : undefined;
    BrowserNotifications.pushModifiedExpenseNotification({report, reportAction, movedFromReport, movedToReport, onClick, usesIcon: true, policyTags, policy, currentUserLogin});
}

function clearReportNotifications(reportID: string | undefined) {
    if (!reportID) {
        return;
    }
    BrowserNotifications.clearNotifications((notificationData) => notificationData.reportID === reportID);
}

const LocalNotification: LocalNotificationModule = {
    showCommentNotification,
    showUpdateAvailableNotification,
    showModifiedExpenseNotification,
    clearReportNotifications,
};

export default LocalNotification;
