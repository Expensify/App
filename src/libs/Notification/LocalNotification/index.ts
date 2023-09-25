import BrowserNotifications from './BrowserNotifications';
import {LocalNotificationModule, ReportCommentParams} from './types';

function showCommentNotification({report, reportAction, onClick}: ReportCommentParams) {
    BrowserNotifications.pushReportCommentNotification({report, reportAction, onClick}, true);
}

function showUpdateAvailableNotification() {
    BrowserNotifications.pushUpdateAvailableNotification();
}

const LocalNotification: LocalNotificationModule = {
    showCommentNotification,
    showUpdateAvailableNotification,
};

export default LocalNotification;
