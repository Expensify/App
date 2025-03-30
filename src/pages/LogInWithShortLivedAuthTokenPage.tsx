import React, {useEffect, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Log from '@libs/Log';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {PublicScreensParamList} from '@libs/Navigation/types';
import {getSearchParamFromUrl} from '@libs/Url';
import {setAccountError, signInWithShortLivedAuthToken, signInWithSupportAuthToken} from '@userActions/Session';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import SessionExpiredPage from './ErrorPage/SessionExpiredPage';

type LogInWithShortLivedAuthTokenPageProps = PlatformStackScreenProps<PublicScreensParamList, typeof SCREENS.TRANSITION_BETWEEN_APPS>;

function LogInWithShortLivedAuthTokenPage({route}: LogInWithShortLivedAuthTokenPageProps) {
    const {shortLivedAuthToken = '', shortLivedToken = '', authTokenType, exitTo, error} = route?.params ?? {};
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {initialValue: {isLoading: true}});
    // State to track whether the system is waiting for navigation for the delegator to show loader
    const [isWaitForNavigationForDelegator, setIsWaitForNavigationForDelegator] = useState(false);

    useEffect(() => {
        // We have to check for both shortLivedAuthToken and shortLivedToken, as the old mobile app uses shortLivedToken, and is not being actively updated.
        const token = shortLivedAuthToken || shortLivedToken;
        const delegatorEmail = getSearchParamFromUrl(getCurrentUrl(), 'delegatorEmail');

        if (!account?.isLoading && authTokenType === CONST.AUTH_TOKEN_TYPES.SUPPORT) {
            signInWithSupportAuthToken(shortLivedAuthToken);
            Navigation.isNavigationReady().then(() => {
                // We must call goBack() to remove the /transition route from history
                Navigation.goBack();
                Navigation.navigate(ROUTES.HOME);
            });
            return;
        }

        // Try to authenticate using the shortLivedToken if we're not already trying to load the accounts
        if (token && !account?.isLoading) {
            Log.info('LogInWithShortLivedAuthTokenPage - Successfully received shortLivedAuthToken. Signing in...');
            signInWithShortLivedAuthToken(token);
            return;
        }

        // If an error is returned as part of the route, ensure we set it in the onyxData for the account
        if (error) {
            setAccountError(error);
        }

        // For HybridApp and for delegator from OldDot we have separate logic to handle transitions.
        if (!CONFIG.IS_HYBRID_APP && exitTo && !delegatorEmail) {
            Navigation.isNavigationReady().then(() => {
                Navigation.navigate(exitTo as Route);
            });
            return;
        }
        if (!CONFIG.IS_HYBRID_APP && delegatorEmail) {
            setIsWaitForNavigationForDelegator(true);
        }
        // The only dependencies of the effect are based on props.route
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [route]);

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (account?.isLoading || isWaitForNavigationForDelegator) {
        return <FullScreenLoadingIndicator />;
    }

    return <SessionExpiredPage />;
}

LogInWithShortLivedAuthTokenPage.displayName = 'LogInWithShortLivedAuthTokenPage';

export default LogInWithShortLivedAuthTokenPage;
