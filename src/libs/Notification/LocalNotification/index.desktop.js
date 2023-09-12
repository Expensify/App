import BrowserNotifications from './BrowserNotifications';

function showCommentNotification({report, reportAction, onClick}) {
    BrowserNotifications.pushReportCommentNotification({report, reportAction, onClick});
}

function showUpdateAvailableNotification() {
    BrowserNotifications.pushUpdateAvailableNotification();
}

function showModifiedExpenseNotification({report, reportAction, onClick}) {
    BrowserNotifications.pushModifiedExpenseNotification({report, reportAction, onClick});
}

export default {
    showCommentNotification,
    showUpdateAvailableNotification,
    showModifiedExpenseNotification,
};
