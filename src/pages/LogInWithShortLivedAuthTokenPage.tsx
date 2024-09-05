import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import {NativeModules} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {PublicScreensParamList} from '@libs/Navigation/types';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Account} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import SessionExpiredPage from './ErrorPage/SessionExpiredPage';

type LogInWithShortLivedAuthTokenPageOnyxProps = {
    /** The details about the account that the user is signing in with */
    account: OnyxEntry<Account>;
};

type LogInWithShortLivedAuthTokenPageProps = LogInWithShortLivedAuthTokenPageOnyxProps & StackScreenProps<PublicScreensParamList, typeof SCREENS.TRANSITION_BETWEEN_APPS>;

function LogInWithShortLivedAuthTokenPage({route, account}: LogInWithShortLivedAuthTokenPageProps) {
    const {email = '', shortLivedAuthToken = '', shortLivedToken = '', authTokenType, exitTo, error} = route?.params ?? {};

    useEffect(() => {
        // We have to check for both shortLivedAuthToken and shortLivedToken, as the old mobile app uses shortLivedToken, and is not being actively updated.
        const token = shortLivedAuthToken || shortLivedToken;

        if (!account?.isLoading && authTokenType === CONST.AUTH_TOKEN_TYPES.SUPPORT) {
            Session.signInWithSupportAuthToken(shortLivedAuthToken);
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
            Session.signInWithShortLivedAuthToken(email, token);
            return;
        }

        // If an error is returned as part of the route, ensure we set it in the onyxData for the account
        if (error) {
            Session.setAccountError(error);
        }

        // For HybridApp we have separate logic to handle transitions.
        if (!NativeModules.HybridAppModule && exitTo) {
            Navigation.isNavigationReady().then(() => {
                Navigation.navigate(exitTo as Route);
            });
        }
        // The only dependencies of the effect are based on props.route
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [route]);

    if (account?.isLoading) {
        return <FullScreenLoadingIndicator />;
    }

    return <SessionExpiredPage />;
}

LogInWithShortLivedAuthTokenPage.displayName = 'LogInWithShortLivedAuthTokenPage';

export default function LogInWithShortLivedAuthTokenPageOnyx(props: Omit<LogInWithShortLivedAuthTokenPageProps, keyof LogInWithShortLivedAuthTokenPageOnyxProps>) {
    const [account, accountMetadata] = useOnyx(ONYXKEYS.ACCOUNT);

    if (isLoadingOnyxValue(accountMetadata)) {
        return null;
    }

    return (
        <LogInWithShortLivedAuthTokenPage
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            account={account}
        />
    );
}
