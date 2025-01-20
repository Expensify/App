import type {Report, ReportAction} from '@src/types/onyx';
import BrowserNotifications from './BrowserNotifications';
import type {LocalNotificationClickHandler, LocalNotificationModule} from './types';

function showCommentNotification(report: Report, reportAction: ReportAction, onClick: LocalNotificationClickHandler) {
    BrowserNotifications.pushReportCommentNotification(report, reportAction, onClick);
}

function showUpdateAvailableNotification() {
    BrowserNotifications.pushUpdateAvailableNotification();
}

function showModifiedExpenseNotification(report: Report, reportAction: ReportAction, onClick: LocalNotificationClickHandler) {
    BrowserNotifications.pushModifiedExpenseNotification(report, reportAction, onClick);
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
