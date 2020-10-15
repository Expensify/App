import BrowserNotifications from './BrowserNotifications';

function showCommentNotification({reportAction, onClick}) {
    BrowserNotifications.pushReportCommentNotification({reportAction, onClick});
}

export default {
    showCommentNotification,
};
