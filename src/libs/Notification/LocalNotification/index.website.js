import BrowserNotifications from './BrowserNotifications';

/**
 * @param {Object} options
 * @param {Object} options.report
 * @param {Object} options.reportAction
 * @param {Function} options.onClick
 */
function showCommentNotification({report, reportAction, onClick}) {
    BrowserNotifications.pushReportCommentNotification({report, reportAction, onClick}, true);
}

function showUpdateAvailableNotification() {
    BrowserNotifications.pushUpdateAvailableNotification();
}

/**
 * @param {Object} options
 * @param {Object} options.report
 * @param {Object} options.reportAction
 * @param {Function} options.onClick
 */
function showModifiedExpenseNotification({report, reportAction, onClick}) {
    BrowserNotifications.pushModifiedExpenseNotification({report, reportAction, onClick}, true);
}

export default {
    showCommentNotification,
    showUpdateAvailableNotification,
    showModifiedExpenseNotification,
};
