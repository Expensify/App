import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyTagLists, Report, ReportAction, ReportAttributesDerivedValue} from '@src/types/onyx';
import BrowserNotifications from './BrowserNotifications';
import type {LocalNotificationClickHandler, LocalNotificationModifiedExpenseParams, LocalNotificationModule} from './types';

let allPolicies: OnyxCollection<Policy>;
// This is a temporary subscription until the modified-expense notification chain is fully migrated
// see https://github.com/Expensify/App/issues/66336
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => {
        allPolicies = value;
    },
});

let allPolicyTags: OnyxCollection<PolicyTagLists>;
// This is a temporary subscription until the modified-expense notification chain is fully migrated
// see https://github.com/Expensify/App/issues/66336
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.POLICY_TAGS,
    waitForCollectionCallback: true,
    callback: (value) => {
        allPolicyTags = value;
    },
});

function showCommentNotification(report: Report, reportAction: ReportAction, onClick: LocalNotificationClickHandler, reportAttributes?: ReportAttributesDerivedValue['reports']) {
    BrowserNotifications.pushReportCommentNotification(report, reportAction, onClick, true, reportAttributes);
}

function showUpdateAvailableNotification() {
    BrowserNotifications.pushUpdateAvailableNotification();
}

function showModifiedExpenseNotification({report, reportAction, movedFromReport, movedToReport, onClick, currentUserLogin, reportAttributes}: LocalNotificationModifiedExpenseParams) {
    const policyID = report.policyID;
    const policyTags = policyID ? allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] : undefined;
    const policy = policyID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] : undefined;
    BrowserNotifications.pushModifiedExpenseNotification({
        report,
        reportAction,
        movedFromReport,
        movedToReport,
        onClick,
        usesIcon: true,
        policyTags,
        policy,
        currentUserLogin,
        reportAttributes,
    });
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
