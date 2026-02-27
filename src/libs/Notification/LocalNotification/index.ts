import type {Report, ReportAction} from '@src/types/onyx';
import BrowserNotifications from './BrowserNotifications';
import type {LocalNotificationClickHandler, LocalNotificationModifiedExpenseParams, LocalNotificationModule} from './types';

function showCommentNotification(report: Report, reportAction: ReportAction, onClick: LocalNotificationClickHandler) {
    BrowserNotifications.pushReportCommentNotification(report, reportAction, onClick, true);
}

function showUpdateAvailableNotification() {
    BrowserNotifications.pushUpdateAvailableNotification();
}

function showModifiedExpenseNotification({report, reportAction, movedFromReport, movedToReport, onClick}: LocalNotificationModifiedExpenseParams) {
    BrowserNotifications.pushModifiedExpenseNotification({report, reportAction, movedFromReport, movedToReport, onClick, usesIcon: true});
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
