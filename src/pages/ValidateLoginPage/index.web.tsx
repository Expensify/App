import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ExpiredValidateCodeModal from '@components/ValidateCode/ExpiredValidateCodeModal';
import JustSignedInModal from '@components/ValidateCode/JustSignedInModal';
import ValidateCodeModal from '@components/ValidateCode/ValidateCodeModal';
import useOnyx from '@hooks/useOnyx';
import Log from '@libs/Log';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {isValidValidateCode} from '@libs/ValidationUtils';
import {handleExitToNavigation, initAutoAuthState, signInWithValidateCode} from '@userActions/Session';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Session as SessionType} from '@src/types/onyx';
import type ValidateLoginPageProps from './types';

const autoAuthStateSelector = (session: OnyxEntry<SessionType>) => session?.autoAuthState;

/** If a separate-session magic-link sign-in hasn't completed in this long, it's likely stuck. */
const STUCK_DIRECT_SIGN_IN_TIMEOUT_MS = 30 * 1000;

function ValidateLoginPage({
    route: {
        params: {accountID, validateCode, exitTo},
    },
}: ValidateLoginPageProps) {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const login = credentials?.login;
    const isSignedIn = !!session?.authToken && session?.authTokenType !== CONST.AUTH_TOKEN_TYPES.ANONYMOUS;
    // When not signed in, ignore stored autoAuthState on the first render to prevent stale values
    // (e.g. FAILED from a previous magic link attempt) from briefly rendering incorrect UI.
    // Once initAutoAuthState() runs in the useEffect, the state is set to true and real values are used.
    const [hasInitialized, setHasInitialized] = useState(isSignedIn);
    const [autoAuthState] = useOnyx(ONYXKEYS.SESSION, {selector: autoAuthStateSelector});
    const effectiveAutoAuthState = hasInitialized ? autoAuthState : undefined;
    const autoAuthStateWithDefault = effectiveAutoAuthState ?? CONST.AUTO_AUTH_STATE.NOT_STARTED;
    const is2FARequired = !!account?.requiresTwoFactorAuth;
    // A magic-link sign-in that needs 2FA completes on the sign-in page: it reuses the stored
    // `credentials.validateCode`, and SignInPage renders the authenticator-code stage once
    // `requiresTwoFactorAuth` + that code are present. Send the user there to enter their code instead
    // of the informational "2FA required" modal, which is a dead end. Require the cached credentials to
    // match THIS link — `signInWithValidateCode` only caches the code on a successful 2FA-required
    // response, so a stale code left over from an earlier attempt can't redirect a later failed/expired
    // link. `exitTo` deep links route here too; the effect keeps the deferred `exitTo` navigation
    // pending so the user reaches their destination after 2FA completes.
    const canCompleteTwoFactorOnSignIn =
        is2FARequired &&
        !isSignedIn &&
        credentials?.validateCode === validateCode &&
        credentials?.accountID === Number(accountID) &&
        (autoAuthStateWithDefault === CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN || autoAuthStateWithDefault === CONST.AUTO_AUTH_STATE.FAILED);
    const isUserClickedSignIn = !login && isSignedIn && (autoAuthStateWithDefault === CONST.AUTO_AUTH_STATE.SIGNING_IN || autoAuthStateWithDefault === CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN);
    const shouldStartSignInWithValidateCode = !isUserClickedSignIn && !isSignedIn && (!!login || !!exitTo) && isValidValidateCode(validateCode);
    const isNavigatingToExitTo = isSignedIn && !!exitTo;
    // Fresh-session magic-link sign-in. Not gated on `isSignedIn` because `autoAuthState` lands
    // before `authToken` (separate Onyx broadcasts); that gap would otherwise flash a blank page.
    // Keeps the loader up across SIGNING_IN → JUST_SIGNED_IN until the redirect unmounts the page.
    // Excludes 2FA: it can't complete from here, so the 2FA modal (below) handles it instead of an
    // indefinite loader.
    const isCompletingDirectSignIn =
        !exitTo && !login && !is2FARequired && (autoAuthStateWithDefault === CONST.AUTO_AUTH_STATE.SIGNING_IN || autoAuthStateWithDefault === CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN);
    const [preferredLocale] = useOnyx(ONYXKEYS.NVP_PREFERRED_LOCALE);

    useEffect(() => {
        setHasInitialized(true);

        if (isUserClickedSignIn) {
            // Just signed in via the magic link with no cached `login` (separate-session sign-in).
            // The redirect Home lives in the focus effect below (not here) so returning to the
            // consumed `/v/...` via browser Back re-fires it instead of getting stuck on the loader.
            return;
        }
        initAutoAuthState(autoAuthStateWithDefault);

        if (!shouldStartSignInWithValidateCode) {
            if (exitTo) {
                handleExitToNavigation(exitTo);
            }
            return;
        }

        // The user has initiated the sign in process on the same browser, in another tab.
        signInWithValidateCode(Number(accountID), validateCode, preferredLocale);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Redirect Home after a separate-session magic-link sign-in. On a focus effect (not mount-only)
    // so that returning to the consumed `/v/...` via browser Back re-fires it — the route can linger
    // in the stack when forceReplace is downgraded to a push, and a mount-only effect wouldn't re-run.
    useFocusEffect(
        useCallback(() => {
            if (!isUserClickedSignIn) {
                return;
            }
            // Wait for protected routes (HOME mounts async); forceReplace so Home doesn't stack on the
            // consumed `/v/...` route.
            Navigation.waitForProtectedRoutes().then(() => {
                Navigation.navigate(ROUTES.HOME, {forceReplace: true});
            });
        }, [isUserClickedSignIn]),
    );

    useEffect(() => {
        let ignore = false;
        if (canCompleteTwoFactorOnSignIn) {
            // Surface the sign-in page so its ValidateCodeForm renders the authenticator-code stage. navigate/goBack
            // no-op from the public /v/ route, so reset the stack to TAB_NAVIGATOR (which hosts the public SignInPage).
            // The "2FA required" modal stays rendered as the fallback so a failed hand-off shows it, not a blank screen.
            Navigation.isNavigationReady().then(() => {
                // Bail if the effect re-ran (e.g. `isSignedIn` flipped true) before this resolved, so a
                // stale callback can't reset the stack out from under the new state.
                if (ignore) {
                    return;
                }
                navigationRef.reset({index: 0, routes: [{name: NAVIGATORS.TAB_NAVIGATOR}]});
            });
        }

        // Register the deferred `exitTo` destination navigation while still unauthenticated.
        // `handleExitToNavigation` waits for the authToken, so for a 2FA account it fires only after the
        // user enters their code on the sign-in page above (the token lands and resolves the shared
        // sign-in promise) — landing them on their destination instead of Home. For a non-2FA account
        // it's the normal post-sign-in handoff. The `!isSignedIn` guard registers it once and never
        // re-fires after sign-in, so the effect re-running can't queue a duplicate navigation.
        if (exitTo && !isSignedIn) {
            handleExitToNavigation(exitTo);
        }

        return () => {
            ignore = true;
        };
    }, [canCompleteTwoFactorOnSignIn, exitTo, isSignedIn]);

    // waitForProtectedRoutes()/authToken can hang (lazy AuthScreens chunk fails, token
    // never lands). We can't recover the consumed code here, but surface a stuck sign-in to
    // Sentry/Log instead of leaving an indefinitely silent spinner. Observability only — no
    // navigation/UX change. Cleared on unmount (successful redirect) or when the state changes.
    useEffect(() => {
        if (!isCompletingDirectSignIn) {
            return;
        }
        const timeoutID = setTimeout(() => {
            Log.alert('[ValidateLoginPage] Magic-link sign-in appears stuck (protected routes / authToken not ready)', {autoAuthState: autoAuthStateWithDefault});
        }, STUCK_DIRECT_SIGN_IN_TIMEOUT_MS);
        return () => clearTimeout(timeoutID);
    }, [isCompletingDirectSignIn, autoAuthStateWithDefault]);

    return (
        <>
            {autoAuthStateWithDefault === CONST.AUTO_AUTH_STATE.FAILED && !is2FARequired && <ExpiredValidateCodeModal />}
            {(autoAuthStateWithDefault === CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN || autoAuthStateWithDefault === CONST.AUTO_AUTH_STATE.FAILED) && is2FARequired && !isSignedIn && (
                <JustSignedInModal is2FARequired />
            )}
            {autoAuthStateWithDefault === CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN && isSignedIn && !exitTo && !!login && <JustSignedInModal is2FARequired={false} />}
            {/* If session.autoAuthState isn't available yet, we use shouldStartSignInWithValidateCode to conditionally render the component instead of local autoAuthState which contains a default value of NOT_STARTED */}
            {(!effectiveAutoAuthState ? !shouldStartSignInWithValidateCode : autoAuthStateWithDefault === CONST.AUTO_AUTH_STATE.NOT_STARTED && !isNavigatingToExitTo) && (
                <ValidateCodeModal
                    accountID={Number(accountID)}
                    code={validateCode}
                />
            )}
            {((!effectiveAutoAuthState ? shouldStartSignInWithValidateCode : autoAuthStateWithDefault === CONST.AUTO_AUTH_STATE.SIGNING_IN) || isCompletingDirectSignIn) && (
                <FullScreenLoadingIndicator
                    testID="validate-login-loading"
                    reasonAttributes={{
                        context: 'ValidateLoginPage',
                        isSigningIn: autoAuthStateWithDefault === CONST.AUTO_AUTH_STATE.SIGNING_IN,
                        shouldStartSignInWithValidateCode,
                        hasAutoAuthState: !!autoAuthState,
                    }}
                />
            )}
        </>
    );
}

export default ValidateLoginPage;
