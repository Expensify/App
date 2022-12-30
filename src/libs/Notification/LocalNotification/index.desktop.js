import BrowserNotifications from './BrowserNotifications';

function showCommentNotification({reportAction, onClick}) {
    BrowserNotifications.pushReportCommentNotification({reportAction, onClick});
}

function showUpdateAvailableNotification() {
    BrowserNotifications.pushUpdateAvailableNotification();
}

export default {
    showCommentNotification,
    showUpdateAvailableNotification,
};
