import type {LocalNotificationModule} from './types';

// Local Notifications are not currently supported on mobile so we'll just no-op here.
const LocalNotification: LocalNotificationModule = {
    showCommentNotification: () => {},
    showUpdateAvailableNotification: () => {},
    showModifiedExpenseNotification: () => {},
    clearReportNotifications: () => {},
};

export default LocalNotification;
