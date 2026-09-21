import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import {useInitialURLState} from '@components/InitialURLContextProvider';
import {ModalActions} from '@components/Modal/Global/ModalContext';

import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import Log from '@libs/Log';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import navigationRef from '@libs/Navigation/navigationRef';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getLastShortAuthToken} from '@libs/Network/NetworkStore';
import {isLoggingInAsDelegate as isLoggingInAsDelegateSessionUtils, isLoggingInAsNewUser as isLoggingInAsNewUserSessionUtils} from '@libs/SessionUtils';

import Navigation from '@navigation/Navigation';
import type {AuthScreensParamList} from '@navigation/types';

import {isAnonymousUser, signInWithShortLivedAuthToken, signInWithSupportAuthToken, signOutAndRedirectToSignIn} from '@userActions/Session';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useEffect, useState} from 'react';

type LogOutPreviousUserPageProps = PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.TRANSITION_BETWEEN_APPS>;

// This page is responsible for handling transitions from OldDot. Specifically, it logs the current user
// out if the transition is for another user.
//
// This component should not do any other navigation as that handled in App.setUpPoliciesAndNavigate
function LogOutPreviousUserPage({route}: LogOutPreviousUserPageProps) {
    const {initialURL} = useInitialURLState();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [lastVisitedPath] = useOnyx(ONYXKEYS.LAST_VISITED_PATH);
    const isAccountLoading = account?.isLoading;
    const {authTokenType, shortLivedAuthToken = '', exitTo} = route?.params ?? {};
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const [hasCancelledSwitch, setHasCancelledSwitch] = useState(false);

    useEffect(() => {
        const sessionEmail = session?.email;
        const transitionURL = CONFIG.IS_HYBRID_APP ? `${CONST.DEEPLINK_BASE_URL}${initialURL ?? ''}` : initialURL;
        const isLoggingInAsNewUser = isLoggingInAsNewUserSessionUtils(transitionURL ?? undefined, sessionEmail);
        const isSupportalLogin = authTokenType === CONST.AUTH_TOKEN_TYPES.SUPPORT;

        const linkEmail = new URLSearchParams(transitionURL ?? undefined).get('email');

        if (isLoggingInAsNewUser) {
            if (isSupportalLogin) {
                // We don't want to close react-native app in this particular case.
                signOutAndRedirectToSignIn(false, isSupportalLogin, true, undefined, CONST.SIGN_OUT_REASON.LOGIN_AS_NEW_USER);
                return;
            }

            if (isAnonymousUser(session)) {
                // We don't want to close react-native app in this particular case.
                Navigation.isNavigationReady().then(() => {
                    if (lastVisitedPath) {
                        try {
                            // Rebuilt like a cold start restore of this path, so the sign-in modal opens over the last public room instead of a blank loader.
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                            navigationRef.resetRoot({...getAdaptedStateFromPath(lastVisitedPath as Route), stale: true});
                        } catch (error) {
                            // A path saved by an older build may no longer exist.
                            Log.warn('Unable to restore the last visited path for an anonymous user', {error});
                            Navigation.goBack();
                        }
                    } else {
                        // We must call goBack() to remove the /transition route from history
                        Navigation.goBack();
                    }
                    signOutAndRedirectToSignIn(false, isSupportalLogin, true, undefined, CONST.SIGN_OUT_REASON.LOGIN_AS_NEW_USER);
                });
                return;
            }

            showConfirmModal({
                title: translate('deeplinkWrapper.switchAccount.title'),
                prompt: translate('deeplinkWrapper.switchAccount.prompt', {newEmail: linkEmail ?? '', currentEmail: sessionEmail ?? ''}),
                confirmText: translate('deeplinkWrapper.switchAccount.confirm'),
                cancelText: translate('common.cancel'),
            }).then((result) => {
                if (result.action !== ModalActions.CONFIRM) {
                    setHasCancelledSwitch(true);
                    return;
                }
                // We don't want to close react-native app in this particular case.
                signOutAndRedirectToSignIn(false, isSupportalLogin, true, undefined, CONST.SIGN_OUT_REASON.LOGIN_AS_NEW_USER);
            });
            return;
        }

        if (isSupportalLogin) {
            // The public transition page may already have started this exact sign-in before the Public/Auth
            // navigator swap re-mounted us here. Firing it again trips the support-token rate limit, so skip
            // the duplicate but still finish navigating home.
            if (shortLivedAuthToken !== getLastShortAuthToken()) {
                signInWithSupportAuthToken(shortLivedAuthToken);
            }
            Navigation.isNavigationReady().then(() => {
                // We must call goBack() to remove the /transition route from history
                Navigation.goBack();
                Navigation.navigate(ROUTES.HOME);
            });
            return;
        }
        const isLoggingInAsDelegate = isLoggingInAsDelegateSessionUtils(transitionURL ?? undefined);

        if (isLoggingInAsDelegate) {
            return;
        }

        // Even if the user was already authenticated in NewDot, we need to reauthenticate them with shortLivedAuthToken,
        // because the old authToken stored in Onyx may be invalid.
        signInWithShortLivedAuthToken(shortLivedAuthToken, session?.authToken, false).then((response) => {
            if (response?.type !== CONST.ERROR_TYPE.SESSION_MISMATCH) {
                return;
            }
            showConfirmModal({
                title: translate('deeplinkWrapper.notValid'),
                prompt: translate('deeplinkWrapper.sessionMismatch'),
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
            });
        });

        // We only want to run this effect once on mount (when the page first loads after transitioning from OldDot)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialURL]);

    useEffect(() => {
        if (hasCancelledSwitch) {
            Navigation.isNavigationReady().then(() => {
                Navigation.goBack(ROUTES.HOME);
            });
            return;
        }

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
                Navigation.goBack(ROUTES.HOME);
                if (exitTo) {
                    Navigation.navigate(exitTo as Route);
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialURL, isAccountLoading, hasCancelledSwitch]);

    return <FullScreenLoadingIndicator />;
}

export default LogOutPreviousUserPage;
