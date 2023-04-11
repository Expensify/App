import Airship from '@ua/react-native-airship';

/**
 * Set the App Icon badge with the number of
 * unread messages on iOS
 *
 * @param {Number} totalCount
 */
function updateUnread(totalCount) {
    Airship.push.iOS.setBadgeNumber(totalCount);
}

export default updateUnread;
