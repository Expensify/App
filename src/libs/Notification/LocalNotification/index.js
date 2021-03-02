import BrowserNotifications from './BrowserNotifications';

function showCommentNotification({reportAction, onClick}) {
    BrowserNotifications.pushReportCommentNotification({reportAction, onClick});
}

function showUpdateAvailableNotification({version}) {
    BrowserNotifications.pushUpdateAvailableNotification({version});
}

export default {
    showCommentNotification,
    showUpdateAvailableNotification,
};
