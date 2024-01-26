import Airship from '@ua/react-native-airship';
import type UpdateUnread from './types';

/**
 * Set the App Icon badge with the number of
 * unread messages on iOS
 */
const updateUnread: UpdateUnread = (totalCount) => {
    Airship.push.iOS.setBadgeNumber(totalCount);
};

export default updateUnread;
