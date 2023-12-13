import {RouteProp} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {Linking} from 'react-native';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import * as SessionUtils from '@libs/SessionUtils';
import Navigation from '@navigation/Navigation';
import * as SessionUserAction from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {Route} from '@src/ROUTES';
import type {Account, Session} from '@src/types/onyx';

type LogOutPreviousUserPageOnyxProps = {
    /** The details about the account that the user is signing in with */
    account: OnyxEntry<Account>;

    /** The data about the current session which will be set once the user is authenticated and we return to this component as an AuthScreen */
    session: OnyxEntry<Session>;
};

type LogOutPreviousUserPageProps = LogOutPreviousUserPageOnyxProps & {
    route: RouteProp<{params: {shouldForceLogin?: string; email?: string; shortLivedAuthToken?: string; exitTo?: Route}}>;
};

function LogOutPreviousUserPage({account = {isLoading: false}, session, route}: LogOutPreviousUserPageProps) {
    useEffect(() => {
        Linking.getInitialURL().then((transitionURL) => {
            const sessionEmail = session?.email;
            const isLoggingInAsNewUser = SessionUtils.isLoggingInAsNewUser(transitionURL, sessionEmail);

            if (isLoggingInAsNewUser) {
                SessionUserAction.signOutAndRedirectToSignIn();
            }

            // We need to signin and fetch a new authToken, if a user was already authenticated in NewDot, and was redirected to OldDot
            // and their authToken stored in Onyx becomes invalid.
            // This workflow is triggered while setting up VBBA. User is redirected from NewDot to OldDot to set up 2FA, and then redirected back to NewDot
            // On Enabling 2FA, authToken stored in Onyx becomes expired and hence we need to fetch new authToken
            const shouldForceLogin = route.params?.shouldForceLogin === 'true';

            if (shouldForceLogin) {
                const email = route.params?.email ?? '';
                const shortLivedAuthToken = route.params?.shortLivedAuthToken ?? '';
                SessionUserAction.signInWithShortLivedAuthToken(email, shortLivedAuthToken);
            }

            const exitTo = route.params?.exitTo ?? '';
            // We don't want to navigate to the exitTo route when creating a new workspace from a deep link,
            // because we already handle creating the optimistic policy and navigating to it in App.setUpPoliciesAndNavigate,
            // which is already called when AuthScreens mounts.
            if (exitTo && exitTo !== ROUTES.WORKSPACE_NEW && !account?.isLoading && !isLoggingInAsNewUser) {
                Navigation.isNavigationReady().then(() => {
                    Navigation.navigate(exitTo);
                });
            }
        });
    }, [account?.isLoading, route.params?.email, route.params?.exitTo, route.params?.shortLivedAuthToken, route.params?.shouldForceLogin, session?.email]);

    return <FullScreenLoadingIndicator />;
}

LogOutPreviousUserPage.displayName = 'LogOutPreviousUserPage';

export default withOnyx<LogOutPreviousUserPageProps, LogOutPreviousUserPageOnyxProps>({
    account: {
        key: ONYXKEYS.ACCOUNT,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
})(LogOutPreviousUserPage);
