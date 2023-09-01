import PropTypes from 'prop-types';
import {useRef, useState, useEffect} from 'react';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import * as Browser from '../../libs/Browser';
import ROUTES from '../../ROUTES';
import * as App from '../../libs/actions/App';
import CONST from '../../CONST';
import CONFIG from '../../CONFIG';
import shouldPreventDeeplinkPrompt from '../../libs/Navigation/shouldPreventDeeplinkPrompt';
import navigationRef from '../../libs/Navigation/navigationRef';
import Navigation from '../../libs/Navigation/Navigation';

const propTypes = {
    /** Children to render. */
    children: PropTypes.node.isRequired,
    /** User authentication status */
    isAuthenticated: PropTypes.bool.isRequired,
};

function isMacOSWeb() {
    return !Browser.isMobile() && typeof navigator === 'object' && typeof navigator.userAgent === 'string' && /Mac/i.test(navigator.userAgent) && !/Electron/i.test(navigator.userAgent);
}

function promptToOpenInDesktopApp() {
    // If the current url path is /transition..., meaning it was opened from oldDot, during this transition period:
    // 1. The user session may not exist, because sign-in has not been completed yet.
    // 2. There may be non-idempotent operations (e.g. create a new workspace), which obviously should not be executed again in the desktop app.
    // So we need to wait until after sign-in and navigation are complete before starting the deeplink redirect.
    if (Str.startsWith(window.location.pathname, Str.normalizeUrl(ROUTES.TRANSITION_BETWEEN_APPS))) {
        App.beginDeepLinkRedirectAfterTransition();
    } else {
        // Match any magic link (/v/<account id>/<6 digit code>)
        const isMagicLink = CONST.REGEX.ROUTES.VALIDATE_LOGIN.test(window.location.pathname);

        App.beginDeepLinkRedirect(!isMagicLink);
    }
}
function DeeplinkWrapper({children, isAuthenticated}) {
    const [currentScreen, setCurrentScreen] = useState();
    const [hasShownPrompt, setHasShownPrompt] = useState(false);
    const removeListener = useRef();

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
                const initialRoute = navigationRef.current.getCurrentRoute();
                setCurrentScreen(initialRoute.name);

                removeListener.current = navigationRef.current.addListener('state', (event) => {
                    setCurrentScreen(Navigation.getRouteNameFromStateEvent(event));
                });
            });
        }
    }, [hasShownPrompt, isAuthenticated]);
    useEffect(() => {
        // According to the design, we don't support unlink in Desktop app https://github.com/Expensify/App/issues/19681#issuecomment-1610353099
        const isUnsupportedDeeplinkRoute = _.some([CONST.REGEX.ROUTES.UNLINK_LOGIN], (unsupportRouteRegex) => {
            const routeRegex = new RegExp(unsupportRouteRegex);
            return routeRegex.test(window.location.pathname);
        });
        // Making a few checks to exit early before checking authentication status
        if (!isMacOSWeb() || isUnsupportedDeeplinkRoute || CONFIG.ENVIRONMENT === CONST.ENVIRONMENT.DEV || hasShownPrompt) {
            return;
        }
        // We want to show the prompt immediately if the user is already authenticated.
        // Otherwise, we want to wait until the navigation state is set up
        // and we know the user is on a screen that supports deeplinks.
        if (isAuthenticated) {
            promptToOpenInDesktopApp();
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
    }, [currentScreen, hasShownPrompt, isAuthenticated]);

    return children;
}

DeeplinkWrapper.propTypes = propTypes;
export default DeeplinkWrapper;
