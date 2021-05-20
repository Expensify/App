import commonNotifications from './common';

export default {
    ...commonNotifications,

    // This notification is unused on iOS/Android
    showUpdateAvailableNotification: () => {},
};
