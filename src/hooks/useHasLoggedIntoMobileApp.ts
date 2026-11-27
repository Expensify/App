import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

/**
 * Returns whether the user has ever logged into one of the Expensify mobile apps (iOS or Android).
 */
const useHasLoggedIntoMobileApp = () => {
    const [lastECashIOSLogin] = useOnyx(ONYXKEYS.NVP_LAST_ECASH_IOS_LOGIN);
    const [lastECashAndroidLogin] = useOnyx(ONYXKEYS.NVP_LAST_ECASH_ANDROID_LOGIN);
    const [lastiPhoneLogin] = useOnyx(ONYXKEYS.NVP_LAST_IPHONE_LOGIN);
    const [lastAndroidLogin] = useOnyx(ONYXKEYS.NVP_LAST_ANDROID_LOGIN);

    const hasLoggedIntoMobileApp = !!lastECashIOSLogin || !!lastECashAndroidLogin || !!lastiPhoneLogin || !!lastAndroidLogin;

    return {hasLoggedIntoMobileApp};
};

export default useHasLoggedIntoMobileApp;
