import React, {useEffect} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import {useInitialURLState} from '@components/InitialURLContextProvider';
import useOnyx from '@hooks/useOnyx';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {isLoggingInAsNewUser as isLoggingInAsNewUserSessionUtils} from '@libs/SessionUtils';
import Navigation from '@navigation/Navigation';
import type {AuthScreensParamList} from '@navigation/types';
import {signInWithShortLivedAuthToken, signInWithSupportAuthToken, signOutAndRedirectToSignIn} from '@userActions/Session';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type LogOutPreviousUserPageProps = PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.TRANSITION_BETWEEN_APPS>;

// This page is responsible for handling transitions from OldDot. Specifically, it logs the current user
// out if the transition is for another user.
//
// This component should not do any other navigation as that handled in App.setUpPoliciesAndNavigate
function LogOutPreviousUserPage({route}: LogOutPreviousUserPageProps) {
    const {initialURL} = useInitialURLState();
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const isAccountLoading = account?.isLoading;
    const {authTokenType, shortLivedAuthToken = '', exitTo} = route?.params ?? {};

    useEffect(() => {
        const sessionEmail = session?.email;
        const transitionURL = CONFIG.IS_HYBRID_APP ? `${CONST.DEEPLINK_BASE_URL}${initialURL ?? ''}` : initialURL;
        const isLoggingInAsNewUser = isLoggingInAsNewUserSessionUtils(transitionURL ?? undefined, sessionEmail);
        const isSupportalLogin = authTokenType === CONST.AUTH_TOKEN_TYPES.SUPPORT;

        if (isLoggingInAsNewUser) {
            // We don't want to close react-native app in this particular case.
            signOutAndRedirectToSignIn(false, isSupportalLogin);
            return;
        }

        if (isSupportalLogin) {
            signInWithSupportAuthToken(shortLivedAuthToken);
            Navigation.isNavigationReady().then(() => {
                // We must call goBack() to remove the /transition route from history
                Navigation.goBack();
                Navigation.navigate(ROUTES.HOME);
            });
            return;
        }

        // Even if the user was already authenticated in NewDot, we need to reauthenticate them with shortLivedAuthToken,
        // because the old authToken stored in Onyx may be invalid.
        signInWithShortLivedAuthToken(shortLivedAuthToken);

        // We only want to run this effect once on mount (when the page first loads after transitioning from OldDot)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialURL]);

    useEffect(() => {
        const sessionEmail = session?.email;
        const transitionURL = CONFIG.IS_HYBRID_APP ? `${CONST.DEEPLINK_BASE_URL}${initialURL ?? ''}` : initialURL;
        const isLoggingInAsNewUser = isLoggingInAsNewUserSessionUtils(transitionURL ?? undefined, sessionEmail);
        // We don't want to navigate to the exitTo route when creating a new workspace from a deep link,
        // because we already handle creating the optimistic policy and navigating to it in App.setUpPoliciesAndNavigate,
        // which is already called when AuthScreens mounts.
        // For HybridApp we have separate logic to handle transitions.
        if (!CONFIG.IS_HYBRID_APP && exitTo !== ROUTES.WORKSPACE_NEW && !isAccountLoading && !isLoggingInAsNewUser) {
            Navigation.isNavigationReady().then(() => {
                // remove this screen and navigate to exit route
                Navigation.goBack();
                if (exitTo) {
                    Navigation.navigate(exitTo as Route);
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialURL, isAccountLoading]);

    return <FullScreenLoadingIndicator />;
}

export default LogOutPreviousUserPage;
