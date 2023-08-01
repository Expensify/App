import PropTypes from 'prop-types';
import {useRef, useState, useEffect} from 'react';
import Str from 'expensify-common/lib/str';
import * as Browser from '../../libs/Browser';
import ROUTES from '../../ROUTES';
import * as App from '../../libs/actions/App';
import CONST from '../../CONST';
import CONFIG from '../../CONFIG';
import shouldShowDeeplink from '../../libs/Navigation/shouldShowDeeplink';
import navigationRef from '../../libs/Navigation/navigationRef';
import Navigation from '../../libs/Navigation/Navigation';

const propTypes = {
    /** Children to render. */
    children: PropTypes.node.isRequired,
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
        App.beginDeepLinkRedirect();
    }
}
function DeeplinkWrapper({children, isAuthenticated}) {
    CONFIG.ENVIRONMENT = CONST.ENVIRONMENT.STAGING;
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
                // get initial route
                const initialRoute = navigationRef.current.getCurrentRoute();
                setCurrentScreen(initialRoute.name);

                removeListener.current = navigationRef.current.addListener('state', (event) => {
                    // accessing routes here should be in a navigation lib fn in case the state shape changes in the future
                    setCurrentScreen(event.data.state.routes.slice(-1).name);
                });
            });
        }
    }, [hasShownPrompt, isAuthenticated]);
    useEffect(() => {
        if (!isMacOSWeb() || CONFIG.ENVIRONMENT === CONST.ENVIRONMENT.DEV) {
            return;
        }
        // Extra guard, but removing the listener should prevent this from firing
        if (hasShownPrompt) {
            return;
        }

        if (isAuthenticated) {
            promptToOpenInDesktopApp();
            setHasShownPrompt(true);
        } else {
            // Navigation state is not set up yet, we're unsure if we should show the deep link prompt or not
            if (currentScreen === undefined || isAuthenticated === false) {
                return;
            }

            const shouldPrompt = shouldShowDeeplink(currentScreen, isAuthenticated);
            if (shouldPrompt === false) {
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
