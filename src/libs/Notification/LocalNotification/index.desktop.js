import BrowserNotifications from './BrowserNotifications';

/**
 * @param {Object} report
 * @param {Object} reportAction
 * @param {Function} onClick
 */
function showCommentNotification(report, reportAction, onClick) {
    BrowserNotifications.pushReportCommentNotification(report, reportAction, onClick);
}

function showUpdateAvailableNotification() {
    BrowserNotifications.pushUpdateAvailableNotification();
}

/**
 * @param {Object} report
 * @param {Object} reportAction
 * @param {Function} onClick
 */
function showModifiedExpenseNotification(report, reportAction, onClick) {
    BrowserNotifications.pushModifiedExpenseNotification(report, reportAction, onClick);
}

export default {
    showCommentNotification,
    showUpdateAvailableNotification,
    showModifiedExpenseNotification,
};
