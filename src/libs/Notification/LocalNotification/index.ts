import type {Report, ReportAction} from '@src/types/onyx';
import BrowserNotifications from './BrowserNotifications';
import type {LocalNotificationClickHandler, LocalNotificationModule} from './types';

function showCommentNotification(report: Report, reportAction: ReportAction, onClick: LocalNotificationClickHandler) {
    BrowserNotifications.pushReportCommentNotification(report, reportAction, onClick, true);
}

function showUpdateAvailableNotification() {
    BrowserNotifications.pushUpdateAvailableNotification();
}

function showModifiedExpenseNotification(report: Report, reportAction: ReportAction, onClick: LocalNotificationClickHandler) {
    BrowserNotifications.pushModifiedExpenseNotification(report, reportAction, onClick, true);
}

function clearReportNotifications(reportID: string | undefined) {
    BrowserNotifications.clearNotifications((notificationData) => notificationData.reportID === reportID);
}

const LocalNotification: LocalNotificationModule = {
    showCommentNotification,
    showUpdateAvailableNotification,
    showModifiedExpenseNotification,
    clearReportNotifications,
};

export default LocalNotification;
