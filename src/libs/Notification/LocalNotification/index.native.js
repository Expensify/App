/* eslint-disable no-unused-vars */

/**
 * Local Notifications are only supported on web and desktop so these functions are a no-op on everything else
 */
export default {
    /**
     * @param {Object} report
     * @param {Object} reportAction
     * @param {Function} onClick
     */
    showCommentNotification: (report, reportAction, onClick) => {},

    showUpdateAvailableNotification: () => {},

    /**
     * @param {Object} report
     * @param {Object} reportAction
     * @param {Function} onClick
     */
    showModifiedExpenseNotification: (report, reportAction, onClick) => {},

    /**
     * @param {String} reportID
     */
    clearReportNotifications: (reportID) => {},
};
