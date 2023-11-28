import BrowserNotifications from './BrowserNotifications.js';
import {LocalNotificationModule, ReportCommentParams} from './types.js';

function showCommentNotification({report, reportAction, onClick}: ReportCommentParams) {
    BrowserNotifications.pushReportCommentNotification({report, reportAction, onClick});
}

function showUpdateAvailableNotification() {
    BrowserNotifications.pushUpdateAvailableNotification();
}

function showModifiedExpenseNotification({report, reportAction, onClick}: ReportCommentParams) {
    BrowserNotifications.pushModifiedExpenseNotification({report, reportAction, onClick});
}

const LocalNotification: LocalNotificationModule = {
    showCommentNotification,
    showUpdateAvailableNotification,
    showModifiedExpenseNotification,
};
export default LocalNotification;
