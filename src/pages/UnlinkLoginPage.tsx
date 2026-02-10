import React, {useEffect} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {PublicScreensParamList} from '@navigation/types';
import {unlinkLogin} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type UnlinkLoginPageProps = PlatformStackScreenProps<PublicScreensParamList, typeof SCREENS.UNLINK_LOGIN>;

function UnlinkLoginPage({route}: UnlinkLoginPageProps) {
    const accountID = route.params.accountID ?? CONST.DEFAULT_NUMBER_ID;
    const validateCode = route.params.validateCode ?? '';
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const prevIsLoading = usePrevious(!!account?.isLoading);

    useEffect(() => {
        unlinkLogin(Number(accountID), validateCode);
        // We only want this to run on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Only navigate when the unlink login request is completed
        if (!prevIsLoading || account?.isLoading) {
            return;
        }

        Navigation.goBack();
    }, [prevIsLoading, account?.isLoading]);

    return <FullScreenLoadingIndicator />;
}

export default UnlinkLoginPage;
