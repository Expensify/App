import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {Report, ReportAction} from '@src/types/onyx';
import BrowserNotifications from './BrowserNotifications';
import type {LocalNotificationClickHandler, LocalNotificationModule} from './types';

function showCommentNotification(report: Report, reportAction: ReportAction, onClick: LocalNotificationClickHandler, formatPhoneNumber: LocaleContextProps['formatPhoneNumber']) {
    BrowserNotifications.pushReportCommentNotification(report, reportAction, onClick, formatPhoneNumber, true);
}

function showUpdateAvailableNotification() {
    BrowserNotifications.pushUpdateAvailableNotification();
}

function showModifiedExpenseNotification(report: Report, reportAction: ReportAction, onClick: LocalNotificationClickHandler, formatPhoneNumber: LocaleContextProps['formatPhoneNumber']) {
    BrowserNotifications.pushModifiedExpenseNotification(report, reportAction, onClick, formatPhoneNumber, true);
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
