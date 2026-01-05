import {isActingAsDelegateSelector} from '@selectors/Account';
import {accountIDSelector} from '@selectors/Session';
import {Str} from 'expensify-common';
import {useEffect, useRef, useState} from 'react';
import useOnyx from '@hooks/useOnyx';
import {isMobile} from '@libs/Browser';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import shouldPreventDeeplinkPrompt from '@libs/Navigation/helpers/shouldPreventDeeplinkPrompt';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {getSearchParamFromUrl} from '@libs/Url';
import {beginDeepLinkRedirect, beginDeepLinkRedirectAfterTransition} from '@userActions/App';
import {getInternalNewExpensifyPath} from '@userActions/Link';
import {isAnonymousUser} from '@userActions/Session';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type DeeplinkWrapperProps from './types';

function isMacOSWeb(): boolean {
    return !isMobile() && typeof navigator === 'object' && typeof navigator.userAgent === 'string' && /Mac/i.test(navigator.userAgent) && !/Electron/i.test(navigator.userAgent);
}

function promptToOpenInDesktopApp(currentUserAccountID?: number, initialUrl = '') {
    // If the current url path is /transition..., meaning it was opened from oldDot, during this transition period:
    // 1. The user session may not exist, because sign-in has not been completed yet.
    // 2. There may be non-idempotent operations (e.g. create a new workspace), which obviously should not be executed again in the desktop app.
    // So we need to wait until after sign-in and navigation are complete before starting the deeplink redirect.
    if (Str.startsWith(window.location.pathname, Str.normalizeUrl(ROUTES.TRANSITION_BETWEEN_APPS))) {
        const params = new URLSearchParams(window.location.search);
        // If the user is redirected from the desktop app, don't prompt the user to open in desktop.
        if (params.get('referrer') === 'desktop') {
            return;
        }
        beginDeepLinkRedirectAfterTransition();
    } else {
        // Match any magic link (/v/<account id>/<6 digit code>)
        const isMagicLink = CONST.REGEX.ROUTES.VALIDATE_LOGIN.test(window.location.pathname);
        const shouldAuthenticateWithCurrentAccount = !isMagicLink || (isMagicLink && !!currentUserAccountID && window.location.pathname.includes(currentUserAccountID.toString()));

        beginDeepLinkRedirect(shouldAuthenticateWithCurrentAccount, isMagicLink, getInternalNewExpensifyPath(initialUrl));
    }
}

function DeeplinkWrapper({children, isAuthenticated, autoAuthState, initialUrl}: DeeplinkWrapperProps) {
    const [currentScreen, setCurrentScreen] = useState<string | undefined>();
    const [hasShownPrompt, setHasShownPrompt] = useState(false);
    const removeListener = useRef<(() => void) | undefined>(undefined);
    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {
        selector: isActingAsDelegateSelector,
        canBeMissing: true,
    });
    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {
        selector: accountIDSelector,
        canBeMissing: true,
    });
    const isActingAsDelegateRef = useRef(isActingAsDelegate);
    const delegatorEmailRef = useRef(getSearchParamFromUrl(getCurrentUrl(), 'delegatorEmail'));

    useEffect(() => {
        // If we've shown the prompt and still have a listener registered,
        // remove the listener and reset its ref to undefined
        if (hasShownPrompt && removeListener.current !== undefined) {
            removeListener.current();
            removeListener.current = undefined;
        }

        if (isAuthenticated === false) {
            setHasShownPrompt(false);
            Navigation.isNavigationReady().then(() => {
                // Get initial route
                const initialRoute = navigationRef.current?.getCurrentRoute();
                setCurrentScreen(initialRoute?.name);

                removeListener.current = navigationRef.current?.addListener('state', (event) => {
                    setCurrentScreen(Navigation.getRouteNameFromStateEvent(event));
                });
            });
        }
    }, [hasShownPrompt, isAuthenticated]);

    useEffect(() => {
        // According to the design, we don't support unlink in Desktop app https://github.com/Expensify/App/issues/19681#issuecomment-1610353099
        const routeRegex = new RegExp(CONST.REGEX.ROUTES.UNLINK_LOGIN);
        const isUnsupportedDeeplinkRoute = routeRegex.test(window.location.pathname);
        const route = window.location.pathname.replace('/', '');
        const isConnectionCompleteRoute = route === ROUTES.CONNECTION_COMPLETE || route === ROUTES.BANK_CONNECTION_COMPLETE;

        // Making a few checks to exit early before checking authentication status
        if (
            !isMacOSWeb() ||
            isUnsupportedDeeplinkRoute ||
            hasShownPrompt ||
            isConnectionCompleteRoute ||
            CONFIG.ENVIRONMENT === CONST.ENVIRONMENT.DEV ||
            autoAuthState === CONST.AUTO_AUTH_STATE.NOT_STARTED ||
            isAnonymousUser() ||
            !!delegatorEmailRef.current ||
            isActingAsDelegateRef.current
        ) {
            return;
        }
        // We want to show the prompt immediately if the user is already authenticated.
        // Otherwise, we want to wait until the navigation state is set up
        // and we know the user is on a screen that supports deeplinks.
        if (isAuthenticated) {
            promptToOpenInDesktopApp(currentUserAccountID, initialUrl);
            setHasShownPrompt(true);
        } else {
            // Navigation state is not set up yet, we're unsure if we should show the deep link prompt or not
            if (currentScreen === undefined || isAuthenticated === false) {
                return;
            }

            const preventPrompt = shouldPreventDeeplinkPrompt(currentScreen);
            if (preventPrompt === true) {
                return;
            }

            promptToOpenInDesktopApp();
            setHasShownPrompt(true);
        }
    }, [currentScreen, hasShownPrompt, isAuthenticated, autoAuthState, initialUrl, currentUserAccountID]);

    return children;
}

export default DeeplinkWrapper;
