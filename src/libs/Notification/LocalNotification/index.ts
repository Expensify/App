import BrowserNotifications from './BrowserNotifications';
import {LocalNotificationModule, ReportCommentParams} from './types';

function showCommentNotification({report, reportAction, onClick}: ReportCommentParams) {
    BrowserNotifications.pushReportCommentNotification({report, reportAction, onClick}, true);
}

function showUpdateAvailableNotification() {
    BrowserNotifications.pushUpdateAvailableNotification();
}

function showModifiedExpenseNotification({report, reportAction, onClick}: ReportCommentParams) {
    BrowserNotifications.pushModifiedExpenseNotification({report, reportAction, onClick}, true);
}

const LocalNotification: LocalNotificationModule = {
    showCommentNotification,
    showUpdateAvailableNotification,
    showModifiedExpenseNotification,
};

export default LocalNotification;
