import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';

import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {PublicScreensParamList} from '@navigation/types';

import {unlinkLogin} from '@userActions/Session';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import React, {useEffect} from 'react';

type UnlinkLoginPageProps = PlatformStackScreenProps<PublicScreensParamList, typeof SCREENS.UNLINK_LOGIN>;

function UnlinkLoginPage({route}: UnlinkLoginPageProps) {
    const accountID = route.params.accountID ?? CONST.DEFAULT_NUMBER_ID;
    const validateCode = route.params.validateCode ?? '';
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
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

        if (navigationRef.current?.canGoBack()) {
            Navigation.goBack();
            return;
        }

        // A tab opened from the unlink email has UNLINK_LOGIN as its only public root route, so bare goBack()
        // no-ops and this loader never unmounts. Reset to TAB_NAVIGATOR (which hosts the public SignInPage) so
        // the unlink result renders.
        let ignore = false;
        Navigation.isNavigationReady().then(() => {
            // Bail if the effect re-ran before this resolved, so a stale callback can't reset the stack
            // out from under the new state.
            if (ignore) {
                return;
            }
            navigationRef.reset({
                index: 0,
                routes: [{name: NAVIGATORS.TAB_NAVIGATOR}],
            });
        });
        return () => {
            ignore = true;
        };
    }, [prevIsLoading, account?.isLoading]);

    // No "Go Back" button: this is a deep-link entry point, so there is usually no history to pop back to.
    return <FullScreenLoadingIndicator shouldUseGoBackButton={false} />;
}

export default UnlinkLoginPage;
