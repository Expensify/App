import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyTagLists, Report, ReportAction} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import type {LocalNotificationClickHandler, LocalNotificationModifiedExpenseParams, LocalNotificationModule} from './types';

import BrowserNotifications from './BrowserNotifications';

let allPolicies: OnyxCollection<Policy>;
// This is a temporary subscription until the modified-expense notification chain is fully migrated
// see https://github.com/Expensify/App/issues/66336
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.POLICY,
    callback: (value) => {
        allPolicies = value;
    },
});

let allPolicyTags: OnyxCollection<PolicyTagLists>;
// This is a temporary subscription until the modified-expense notification chain is fully migrated
// see https://github.com/Expensify/App/issues/66336
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.POLICY_TAGS,
    callback: (value) => {
        allPolicyTags = value;
    },
});

function showCommentNotification(report: Report, reportAction: ReportAction, onClick: LocalNotificationClickHandler, derivedReportName?: string) {
    BrowserNotifications.pushReportCommentNotification(report, reportAction, onClick, true, derivedReportName);
}

function showUpdateAvailableNotification() {
    BrowserNotifications.pushUpdateAvailableNotification();
}

function showModifiedExpenseNotification({report, reportAction, movedFromReport, movedToReport, onClick, currentUserLogin, derivedReportName}: LocalNotificationModifiedExpenseParams) {
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
        derivedReportName,
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
