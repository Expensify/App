import React, {useEffect} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useOnyx from '@hooks/useOnyx';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {PublicScreensParamList} from '@libs/Navigation/types';
import {getLastShortAuthToken} from '@libs/Network/NetworkStore';
import {setAccountError, signInWithShortLivedAuthToken, signInWithSupportAuthToken} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import SessionExpiredPage from './ErrorPage/SessionExpiredPage';

type LogInWithShortLivedAuthTokenPageProps = PlatformStackScreenProps<PublicScreensParamList, typeof SCREENS.TRANSITION_BETWEEN_APPS>;

function LogInWithShortLivedAuthTokenPage({route}: LogInWithShortLivedAuthTokenPageProps) {
    const {shortLivedAuthToken = '', shortLivedToken = '', authTokenType, exitTo, error} = route?.params ?? {};
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});

    useEffect(() => {
        // We have to check for both shortLivedAuthToken and shortLivedToken, as the old mobile app uses shortLivedToken, and is not being actively updated.
        const token = shortLivedAuthToken || shortLivedToken;

        // This is to prevent re-authenticating when logging out if the initial URL (deep link) hasn't changed.
        if (token === getLastShortAuthToken()) {
            return;
        }

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

        if (exitTo) {
            Navigation.isNavigationReady().then(() => {
                // We must call goBack() to remove the /transition route from history
                Navigation.goBack();
                Navigation.navigate(exitTo as Route);
            });
        }
        // The only dependencies of the effect are based on props.route
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route]);

    if (account?.isLoading) {
        return <FullScreenLoadingIndicator />;
    }

    return <SessionExpiredPage />;
}

export default LogInWithShortLivedAuthTokenPage;
