import type {PolicyTagLists, Report, ReportAction} from '@src/types/onyx';
import BrowserNotifications from './BrowserNotifications';
import type {LocalNotificationClickHandler, LocalNotificationModifiedExpenseParams, LocalNotificationModule} from './types';

function showCommentNotification(report: Report, reportAction: ReportAction, onClick: LocalNotificationClickHandler, policyTags?: PolicyTagLists) {
    BrowserNotifications.pushReportCommentNotification(report, reportAction, onClick, policyTags);
}

function showUpdateAvailableNotification() {
    BrowserNotifications.pushUpdateAvailableNotification();
}

function showModifiedExpenseNotification({report, reportAction, movedFromReport, movedToReport, onClick, policyTags}: LocalNotificationModifiedExpenseParams) {
    BrowserNotifications.pushModifiedExpenseNotification({report, reportAction, movedFromReport, movedToReport, onClick, policyTags});
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
