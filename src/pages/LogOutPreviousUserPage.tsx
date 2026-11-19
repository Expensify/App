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
import {getEmailFromTransitionURL, isLoggingInAsDelegate as isLoggingInAsDelegateSessionUtils, isLoggingInAsNewUser as isLoggingInAsNewUserSessionUtils} from '@libs/SessionUtils';

import Navigation from '@navigation/Navigation';
import type {AuthScreensParamList} from '@navigation/types';

import {isAnonymousUser, isDelegateSession, signInWithShortLivedAuthToken, signInWithSupportAuthToken, signOutAndRedirectToSignIn} from '@userActions/Session';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {StackActions} from '@react-navigation/native';
import React, {useEffect} from 'react';

import NotFoundPage from './ErrorPage/NotFoundPage';

type LogOutPreviousUserPageProps = PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.TRANSITION_BETWEEN_APPS>;

const SWITCH_ACCOUNT_MODAL_ID = 'switchAccount';

// This page is responsible for handling transitions from OldDot. Specifically, it logs the current user
// out if the transition is for another user.
//
// This component should not do any other navigation as that handled in App.setUpPoliciesAndNavigate
function LogOutPreviousUserPage({route}: LogOutPreviousUserPageProps) {
    const {initialURL, isLoadingInitialURL} = useInitialURLState();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [lastVisitedPath] = useOnyx(ONYXKEYS.LAST_VISITED_PATH);
    const isAccountLoading = account?.isLoading;
    const {authTokenType, shortLivedAuthToken = '', shortLivedToken = '', exitTo} = route?.params ?? {};
    const {translate, formatPhoneNumber} = useLocalize();
    const {showConfirmModal, closeModalByID} = useConfirmModal();

    // Linking.getInitialURL() only ever resolves the URL that launched the app, so only process this route when that URL carries its token.
    // HybridApp doesn't update its launch URL for later links, so we skip this check there. The old mobile app names the token shortLivedToken.
    const linkToken = shortLivedAuthToken || shortLivedToken;
    const isInitialURLForRoute = !!initialURL && (CONFIG.IS_HYBRID_APP || (!!linkToken && initialURL.includes(linkToken)));

    useEffect(() => {
        if (!initialURL || !isInitialURLForRoute) {
            return;
        }

        const sessionEmail = session?.email;
        const transitionURL = CONFIG.IS_HYBRID_APP ? `${CONST.DEEPLINK_BASE_URL}${initialURL}` : initialURL;
        const isLoggingInAsNewUser = isLoggingInAsNewUserSessionUtils(transitionURL, sessionEmail);
        const isSupportalLogin = authTokenType === CONST.AUTH_TOKEN_TYPES.SUPPORT;

        if (isLoggingInAsNewUser) {
            if (isSupportalLogin) {
                Log.info('[LogOutPreviousUserPage] Signing out for a transition to another user', false, {
                    isLinkNamingDelegator: isLoggingInAsDelegateSessionUtils(transitionURL ?? undefined),
                    isDelegateSession: isDelegateSession(session),
                    isSupportalLogin,
                });
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
                    Log.info('[LogOutPreviousUserPage] Signing out for a transition to another user', false, {
                        isLinkNamingDelegator: isLoggingInAsDelegateSessionUtils(transitionURL ?? undefined),
                        isDelegateSession: isDelegateSession(session),
                        isSupportalLogin,
                    });
                    signOutAndRedirectToSignIn(false, isSupportalLogin, true, undefined, CONST.SIGN_OUT_REASON.LOGIN_AS_NEW_USER);
                });
                return;
            }

            const linkEmail = getEmailFromTransitionURL(transitionURL);

            if (!linkEmail) {
                showConfirmModal({
                    title: translate('deeplinkWrapper.notValid'),
                    prompt: translate('deeplinkWrapper.sessionMismatch'),
                    confirmText: translate('common.buttonConfirm'),
                    shouldShowCancelButton: false,
                }).then(() => {
                    Navigation.isNavigationReady().then(() => {
                        Navigation.goBack(ROUTES.HOME);
                    });
                });
                return;
            }

            let isCancelled = false;
            showConfirmModal({
                id: SWITCH_ACCOUNT_MODAL_ID,
                title: translate('deeplinkWrapper.switchAccount.title'),
                prompt: translate('deeplinkWrapper.switchAccount.prompt', {newEmail: formatPhoneNumber(linkEmail), currentEmail: formatPhoneNumber(sessionEmail ?? '')}),
                confirmText: translate('deeplinkWrapper.switchAccount.confirm'),
                cancelText: translate('deeplinkWrapper.switchAccount.staySignedIn'),
            }).then((result) => {
                // The cleanup below closes the prompt without an answer, which must not count as "Stay signed in".
                if (isCancelled) {
                    return;
                }
                if (result.action !== ModalActions.CONFIRM) {
                    Navigation.isNavigationReady().then(() => {
                        Navigation.goBack(ROUTES.HOME);
                    });
                    return;
                }
                Log.info('[LogOutPreviousUserPage] Signing out for a transition to another user', false, {
                    isLinkNamingDelegator: isLoggingInAsDelegateSessionUtils(transitionURL ?? undefined),
                    isDelegateSession: isDelegateSession(session),
                    isSupportalLogin,
                });

                // The sign-out keeps only the top route of the root stack, and the public transition page redeems the token from that
                // route's params. Pop what the outgoing account opened on top of this page while the prompt was open, so this route survives.
                const rootState = navigationRef.getRootState();
                const topRootIndex = rootState.index ?? rootState.routes.length - 1;
                const transitionIndex = rootState.routes.findLastIndex((rootRoute, idx) => idx < topRootIndex && rootRoute.name === SCREENS.TRANSITION_BETWEEN_APPS);
                if (transitionIndex !== -1) {
                    navigationRef.dispatch({...StackActions.pop(topRootIndex - transitionIndex), target: rootState.key});
                }

                // We don't want to close react-native app in this particular case.
                signOutAndRedirectToSignIn(false, isSupportalLogin, true, undefined, CONST.SIGN_OUT_REASON.LOGIN_AS_NEW_USER);
            });

            // The prompt lives above the navigators, so close it with the page. Otherwise a later confirm would sign out whatever session is current.
            return () => {
                isCancelled = true;
                closeModalByID(SWITCH_ACCOUNT_MODAL_ID);
            };
        }

        if (isSupportalLogin) {
            // The public transition page may already have started this exact sign-in before the Public/Auth
            // navigator swap re-mounted us here. Firing it again trips the support-token rate limit, so skip
            // the duplicate but still finish the navigation.
            if (shortLivedAuthToken !== getLastShortAuthToken()) {
                signInWithSupportAuthToken(shortLivedAuthToken);
            }
            Navigation.isNavigationReady().then(() => {
                // We must call goBack() to remove the /transition route from history
                Navigation.goBack();
                // A workspace/new link goes Home, because App.setUpPoliciesAndNavigate owns that route, as in the effect below
                Navigation.navigate(exitTo && exitTo !== ROUTES.WORKSPACE_NEW ? exitTo : ROUTES.HOME);
            });
            return;
        }
        const isLoggingInAsDelegate = isLoggingInAsDelegateSessionUtils(transitionURL);

        if (isLoggingInAsDelegate) {
            return;
        }

        // Even if the user was already authenticated in NewDot, we need to reauthenticate them with shortLivedAuthToken,
        // because the old authToken stored in Onyx may be invalid.
        signInWithShortLivedAuthToken(shortLivedAuthToken, session?.authToken, false, undefined, undefined)
            .then((response) => {
                if (response?.type !== CONST.ERROR_TYPE.ACCOUNT_MISMATCH) {
                    return;
                }
                showConfirmModal({
                    title: translate('deeplinkWrapper.notValid'),
                    prompt: translate('deeplinkWrapper.sessionMismatch'),
                    confirmText: translate('common.buttonConfirm'),
                    shouldShowCancelButton: false,
                }).then(() => {
                    // Go to the home page once the user dismisses this. The exitTo navigation below only runs when !CONFIG.IS_HYBRID_APP, so nothing else leaves /transition on HybridApp.
                    Navigation.isNavigationReady().then(() => {
                        Navigation.goBack(ROUTES.HOME);
                    });
                });
            })
            .catch((error) => Log.warn('Unable to sign in with shortLivedAuthToken', {error}));

        // We only want to run this effect once on mount (when the page first loads after transitioning from OldDot)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialURL]);

    useEffect(() => {
        if (!isInitialURLForRoute) {
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
                    Navigation.navigate(exitTo);
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialURL, isAccountLoading]);

    // Once the launch URL has settled without this route's link, this mount came from tapping a link inside the app (e.g. a link in a message), which this page can't process.
    // Show a not-found page instead of hanging here.
    if (!isLoadingInitialURL && !isInitialURLForRoute) {
        return <NotFoundPage />;
    }

    // No "Go Back" button: going back would pop /transition into the outgoing user's session mid sign-out.
    return <FullScreenLoadingIndicator shouldUseGoBackButton={false} />;
}

export default LogOutPreviousUserPage;
