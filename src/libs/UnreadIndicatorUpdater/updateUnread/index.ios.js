import {UrbanAirship} from 'urbanairship-react-native';

/**
 * Set the App Icon badge with the number of
 * unread messages on iOS
 *
 * @param {Number} totalCount
 */
function updateUnread(totalCount) {
    if (totalCount === -1) {
        UrbanAirship.setBadgeNumber(1);
    } else {
        UrbanAirship.setBadgeNumber(totalCount);
    }
}

export default updateUnread;
