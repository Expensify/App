import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

const useHasInstalledApp = () => {
    const [lastIOSLogin, lastIOSLoginResult] = useOnyx(ONYXKEYS.NVP_LAST_ECASH_IOS_LOGIN, {canBeMissing: true});
    const [lastAndroidLogin, lastAndroidLoginResult] = useOnyx(ONYXKEYS.NVP_LAST_ECASH_ANDROID_LOGIN, {canBeMissing: true});

    const isLastAppLoginLoaded = lastIOSLoginResult.status !== 'loading' && lastAndroidLoginResult.status !== 'loading';

    const hasInstalledApp = !!lastIOSLogin || !!lastAndroidLogin;

    return {hasInstalledApp, isLastAppLoginLoaded};
};

export default useHasInstalledApp;
