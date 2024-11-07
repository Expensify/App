import {Str} from 'expensify-common';
import {useEffect, useRef, useState} from 'react';
import * as Browser from '@libs/Browser';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import shouldPreventDeeplinkPrompt from '@libs/Navigation/shouldPreventDeeplinkPrompt';
import * as App from '@userActions/App';
import * as Link from '@userActions/Link';
import * as Session from '@userActions/Session';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type DeeplinkWrapperProps from './types';

function isMacOSWeb(): boolean {
    return !Browser.isMobile() && typeof navigator === 'object' && typeof navigator.userAgent === 'string' && /Mac/i.test(navigator.userAgent) && !/Electron/i.test(navigator.userAgent);
}

function promptToOpenInDesktopApp(initialUrl = '') {
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
        App.beginDeepLinkRedirectAfterTransition();
    } else {
        // Match any magic link (/v/<account id>/<6 digit code>)
        const isMagicLink = CONST.REGEX.ROUTES.VALIDATE_LOGIN.test(window.location.pathname);

        App.beginDeepLinkRedirect(!isMagicLink, Link.getInternalNewExpensifyPath(initialUrl));
    }
}

function DeeplinkWrapper({children, isAuthenticated, autoAuthState, initialUrl}: DeeplinkWrapperProps) {
    const [currentScreen, setCurrentScreen] = useState<string | undefined>();
    const [hasShownPrompt, setHasShownPrompt] = useState(false);
    const removeListener = useRef<() => void>();

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
        const isConnectionCompleteRoute = window.location.pathname.replace('/', '') === ROUTES.CONNECTION_COMPLETE;

        // Making a few checks to exit early before checking authentication status
        if (
            !isMacOSWeb() ||
            isUnsupportedDeeplinkRoute ||
            hasShownPrompt ||
            isConnectionCompleteRoute ||
            CONFIG.ENVIRONMENT === CONST.ENVIRONMENT.DEV ||
            autoAuthState === CONST.AUTO_AUTH_STATE.NOT_STARTED ||
            Session.isAnonymousUser()
        ) {
            return;
        }
        // We want to show the prompt immediately if the user is already authenticated.
        // Otherwise, we want to wait until the navigation state is set up
        // and we know the user is on a screen that supports deeplinks.
        if (isAuthenticated) {
            promptToOpenInDesktopApp(initialUrl);
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
    }, [currentScreen, hasShownPrompt, isAuthenticated, autoAuthState, initialUrl]);

    return children;
}

DeeplinkWrapper.displayName = 'DeeplinkWrapper';

export default DeeplinkWrapper;
