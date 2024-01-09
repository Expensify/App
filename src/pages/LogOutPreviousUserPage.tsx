import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import {Linking} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as SessionUtils from '@libs/SessionUtils';
import Navigation from '@navigation/Navigation';
import * as SessionUserAction from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Account, Session} from '@src/types/onyx';

type LogOutPreviousUserPageOnyxProps = {
    /** The details about the account that the user is signing in with */
    account: OnyxEntry<Account>;

    /** The data about the current session which will be set once the user is authenticated and we return to this component as an AuthScreen */
    session: OnyxEntry<Session>;
};

type LogOutPreviousUserPageProps = LogOutPreviousUserPageOnyxProps & StackScreenProps<AuthScreensParamList, typeof SCREENS.TRANSITION_BETWEEN_APPS>;

function LogOutPreviousUserPage({account, session, route: {params}}: LogOutPreviousUserPageProps) {
    useEffect(() => {
        Linking.getInitialURL().then((transitionURL) => {
            const sessionEmail = session?.email;
            const isLoggingInAsNewUser = SessionUtils.isLoggingInAsNewUser(transitionURL ?? undefined, sessionEmail);

            if (isLoggingInAsNewUser) {
                SessionUserAction.signOutAndRedirectToSignIn();
            }

            // We need to signin and fetch a new authToken, if a user was already authenticated in NewDot, and was redirected to OldDot
            // and their authToken stored in Onyx becomes invalid.
            // This workflow is triggered while setting up VBBA. User is redirected from NewDot to OldDot to set up 2FA, and then redirected back to NewDot
            // On Enabling 2FA, authToken stored in Onyx becomes expired and hence we need to fetch new authToken
            const shouldForceLogin = params.shouldForceLogin === 'true';

            if (shouldForceLogin) {
                const email = params.email;
                const shortLivedAuthToken = params.shortLivedAuthToken;
                SessionUserAction.signInWithShortLivedAuthToken(email, shortLivedAuthToken);
            }

            const exitTo = params.exitTo;
            // We don't want to navigate to the exitTo route when creating a new workspace from a deep link,
            // because we already handle creating the optimistic policy and navigating to it in App.setUpPoliciesAndNavigate,
            // which is already called when AuthScreens mounts.
            if (exitTo && exitTo !== ROUTES.WORKSPACE_NEW && !account?.isLoading && !isLoggingInAsNewUser) {
                Navigation.isNavigationReady().then(() => {
                    Navigation.navigate(exitTo);
                });
            }
        });
    }, [account?.isLoading, params.email, params.exitTo, params.shortLivedAuthToken, params.shouldForceLogin, session?.email]);

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
