import BrowserNotifications from './BrowserNotifications.js';
import {LocalNotificationModule, ReportCommentParams} from './types.js';

function showCommentNotification({report, reportAction, onClick}: ReportCommentParams) {
    BrowserNotifications.pushReportCommentNotification({report, reportAction, onClick});
}

function showUpdateAvailableNotification() {
    BrowserNotifications.pushUpdateAvailableNotification();
}

const LocalNotification: LocalNotificationModule = {
    showCommentNotification,
    showUpdateAvailableNotification,
};
export default LocalNotification;
