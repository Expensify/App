import BrowserNotifications from './BrowserNotifications';

function showCommentNotification({report, reportAction, onClick}) {
    BrowserNotifications.pushReportCommentNotification({report, reportAction, onClick}, true);
}

function showUpdateAvailableNotification() {
    BrowserNotifications.pushUpdateAvailableNotification();
}

export default {
    showCommentNotification,
    showUpdateAvailableNotification,
};
