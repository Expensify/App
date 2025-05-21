import {useEffect, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

const useHasInstalledApp = () => {
    const [lastIOSLogin] = useOnyx(ONYXKEYS.NVP_LAST_ECASH_IOS_LOGIN, {canBeMissing: true});
    const [lastAndroidLogin] = useOnyx(ONYXKEYS.NVP_LAST_ECASH_ANDROID_LOGIN, {canBeMissing: true});
    const [isLastAppLoginLoaded, setIsLastAppLoginLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLastAppLoginLoaded(true);
        }, 200);

        return () => clearTimeout(timer);
    }, []);

    const hasInstalledApp = !!lastIOSLogin || !!lastAndroidLogin;

    return {hasInstalledApp, isLastAppLoginLoaded};
};

export default useHasInstalledApp;
