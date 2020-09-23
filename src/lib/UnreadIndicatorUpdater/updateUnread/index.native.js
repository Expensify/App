import PushNotificationIOS from '@react-native-community/push-notification-ios';

/**
 * Set the App Icon badge with the number of
 * unread messages on iOS
 *
 * @param {Number} totalCount
 */
function updateUnread(totalCount) {
    console.log('setting the application badge number: ', totalCount);
    PushNotificationIOS.setApplicationIconBadgeNumber(totalCount);
}

export default updateUnread;
