import type {StackScreenProps} from '@react-navigation/stack';
import React, {useContext, useEffect} from 'react';
import {NativeModules} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import {InitialURLContext} from '@components/InitialURLContextProvider';
import * as SessionUtils from '@libs/SessionUtils';
import Navigation from '@navigation/Navigation';
import type {AuthScreensParamList} from '@navigation/types';
import * as SessionActions from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Session} from '@src/types/onyx';

type LogOutPreviousUserPageOnyxProps = {
    /** The data about the current session which will be set once the user is authenticated and we return to this component as an AuthScreen */
    session: OnyxEntry<Session>;

    /** Is the account loading? */
    isAccountLoading: boolean;
};

type LogOutPreviousUserPageProps = LogOutPreviousUserPageOnyxProps & StackScreenProps<AuthScreensParamList, typeof SCREENS.TRANSITION_BETWEEN_APPS>;

// This page is responsible for handling transitions from OldDot. Specifically, it logs the current user
// out if the transition is for another user.
//
// This component should not do any other navigation as that handled in App.setUpPoliciesAndNavigate
function LogOutPreviousUserPage({session, route, isAccountLoading}: LogOutPreviousUserPageProps) {
    const initialURL = useContext(InitialURLContext);

    useEffect(() => {
        const sessionEmail = session?.email;
        const transitionURL = NativeModules.HybridAppModule ? `${CONST.DEEPLINK_BASE_URL}${initialURL ?? ''}` : initialURL;
        const isLoggingInAsNewUser = SessionUtils.isLoggingInAsNewUser(transitionURL ?? undefined, sessionEmail);
        const isSupportalLogin = route.params.authTokenType === CONST.AUTH_TOKEN_TYPES.SUPPORT;

        if (isLoggingInAsNewUser) {
            // We don't want to close react-native app in this particular case.
            SessionActions.signOutAndRedirectToSignIn(false, isSupportalLogin, false);
            return;
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
        // We only want to run this effect once on mount (when the page first loads after transitioning from OldDot)
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [initialURL]);

    useEffect(() => {
        const exitTo = route.params.exitTo as Route | null;
        const sessionEmail = session?.email;
        const transitionURL = NativeModules.HybridAppModule ? `${CONST.DEEPLINK_BASE_URL}${initialURL ?? ''}` : initialURL;
        const isLoggingInAsNewUser = SessionUtils.isLoggingInAsNewUser(transitionURL ?? undefined, sessionEmail);
        // We don't want to navigate to the exitTo route when creating a new workspace from a deep link,
        // because we already handle creating the optimistic policy and navigating to it in App.setUpPoliciesAndNavigate,
        // which is already called when AuthScreens mounts.
        // For HybridApp we have separate logic to handle transitions.
        if (!NativeModules.HybridAppModule && exitTo && exitTo !== ROUTES.WORKSPACE_NEW && !isAccountLoading && !isLoggingInAsNewUser) {
            Navigation.isNavigationReady().then(() => {
                // remove this screen and navigate to exit route
                Navigation.goBack();
                Navigation.navigate(exitTo);
            });
        }
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [initialURL, isAccountLoading]);

    return <FullScreenLoadingIndicator />;
}

LogOutPreviousUserPage.displayName = 'LogOutPreviousUserPage';

export default withOnyx<LogOutPreviousUserPageProps, LogOutPreviousUserPageOnyxProps>({
    isAccountLoading: {
        key: ONYXKEYS.ACCOUNT,
        selector: (account) => account?.isLoading ?? false,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
})(LogOutPreviousUserPage);
