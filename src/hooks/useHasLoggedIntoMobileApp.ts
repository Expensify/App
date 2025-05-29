import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Returns whether the user has ever logged into one of the Expensify mobile apps (iOS or Android),
 * along with a flag indicating if the login data has finished loading.
 */
const useHasLoggedIntoMobileApp = () => {
    const [lastECashIOSLogin, lastECashIOSLoginResult] = useOnyx(ONYXKEYS.NVP_LAST_ECASH_IOS_LOGIN, {canBeMissing: true});
    const [lastECashAndroidLogin, lastECashAndroidLoginResult] = useOnyx(ONYXKEYS.NVP_LAST_ECASH_ANDROID_LOGIN, {canBeMissing: true});
    const [lastiPhoneLogin, lastiPhoneLoginResult] = useOnyx(ONYXKEYS.NVP_LAST_IPHONE_LOGIN, {canBeMissing: true});
    const [lastAndroidLogin, lastAndroidLoginResult] = useOnyx(ONYXKEYS.NVP_LAST_ANDROID_LOGIN, {canBeMissing: true});

    const hasLoggedIntoMobileApp = !!lastECashIOSLogin || !!lastECashAndroidLogin || !!lastiPhoneLogin || !!lastAndroidLogin;

    const isLastMobileAppLoginLoaded =
        lastECashIOSLoginResult.status !== 'loading' &&
        lastECashAndroidLoginResult.status !== 'loading' &&
        lastiPhoneLoginResult.status !== 'loading' &&
        lastAndroidLoginResult.status !== 'loading';

    return {hasLoggedIntoMobileApp, isLastMobileAppLoginLoaded};
};

export default useHasLoggedIntoMobileApp;
