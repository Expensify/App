import Airship from '@ua/react-native-airship';
import type UpdateUnread from './types';

/**
 * Set the App Icon badge with the number of
 * unread messages on iOS
 */
const updateUnread: UpdateUnread = (totalCount) => {
    Airship.push.iOS.setBadgeNumber(totalCount);
};

// No-op on native — document title is a web-only concept
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setPageTitle(_title: string) {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setShouldShowBranchNameInTitle(_value: boolean) {}

export default updateUnread;
export {setPageTitle, setShouldShowBranchNameInTitle};
