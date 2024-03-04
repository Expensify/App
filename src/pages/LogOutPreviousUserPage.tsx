import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import {Linking} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Navigation from '@libs/Navigation/Navigation';
import * as SessionUtils from '@libs/SessionUtils';
import type {AuthScreensParamList} from '@navigation/types';
import * as SessionActions from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Session} from '@src/types/onyx';

type LogOutPreviousUserPageOnyxProps = {
    /** The data about the current session which will be set once the user is authenticated and we return to this component as an AuthScreen */
    session: OnyxEntry<Session>;
};

type LogOutPreviousUserPageProps = LogOutPreviousUserPageOnyxProps & StackScreenProps<AuthScreensParamList, typeof SCREENS.TRANSITION_BETWEEN_APPS>;

// This page is responsible for handling transitions from OldDot. Specifically, it logs the current user
// out if the transition is for another user.
//
// This component should not do any other navigation as that handled in App.setUpPoliciesAndNavigate
function LogOutPreviousUserPage({session, route}: LogOutPreviousUserPageProps) {
    useEffect(() => {
        Linking.getInitialURL().then((transitionURL) => {
            const sessionEmail = session?.email;
            const isLoggingInAsNewUser = SessionUtils.isLoggingInAsNewUser(transitionURL ?? undefined, sessionEmail);
            const isSupportalLogin = route.params.authTokenType === CONST.AUTH_TOKEN_TYPES.SUPPORT;

            if (isLoggingInAsNewUser) {
                SessionActions.signOutAndRedirectToSignIn(false, isSupportalLogin);
            }

            if (isSupportalLogin) {
                SessionActions.signInWithSupportAuthToken(route.params.shortLivedAuthToken ?? '');
                Navigation.isNavigationReady().then(() => {
                    // We must call goBack() to remove the /transition route from history
                    Navigation.goBack();
                    Navigation.navigate(ROUTES.HOME);
                });
                return;
            }

            // We need to signin and fetch a new authToken, if a user was already authenticated in NewDot, and was redirected to OldDot
            // and their authToken stored in Onyx becomes invalid.
            // This workflow is triggered while setting up VBBA. User is redirected from NewDot to OldDot to set up 2FA, and then redirected back to NewDot
            // On Enabling 2FA, authToken stored in Onyx becomes expired and hence we need to fetch new authToken
            const shouldForceLogin = route.params.shouldForceLogin === 'true';
            if (shouldForceLogin) {
                const email = route.params.email ?? '';
                const shortLivedAuthToken = route.params.shortLivedAuthToken ?? '';
                SessionActions.signInWithShortLivedAuthToken(email, shortLivedAuthToken);
            }
        });

        // We only want to run this effect once on mount (when the page first loads after transitioning from OldDot)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <FullScreenLoadingIndicator />;
}

LogOutPreviousUserPage.displayName = 'LogOutPreviousUserPage';

export default withOnyx<LogOutPreviousUserPageProps, LogOutPreviousUserPageOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(LogOutPreviousUserPage);
