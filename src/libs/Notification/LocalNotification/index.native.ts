import {LocalNotificationModule} from './types';

// Local Notifications are not currently supported on mobile so we'll just noop here.
const LocalNotification: LocalNotificationModule = {
    showCommentNotification: () => {},
    showUpdateAvailableNotification: () => {},
    showModifiedExpenseNotification: () => {},
};

export default LocalNotification;
