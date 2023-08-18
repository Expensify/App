import PropTypes from 'prop-types';
import {useEffect} from 'react';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import * as Browser from '../../libs/Browser';
import ROUTES from '../../ROUTES';
import * as App from '../../libs/actions/App';
import CONST from '../../CONST';
import CONFIG from '../../CONFIG';

const propTypes = {
    /** Children to render. */
    children: PropTypes.node.isRequired,
};

function isMacOSWeb() {
    return !Browser.isMobile() && typeof navigator === 'object' && typeof navigator.userAgent === 'string' && /Mac/i.test(navigator.userAgent) && !/Electron/i.test(navigator.userAgent);
}

function DeeplinkWrapper({children}) {
    useEffect(() => {
        // According to the design, we don't support unlink in Desktop app https://github.com/Expensify/App/issues/19681#issuecomment-1610353099
        const isUnsupportedDeeplinkRoute = _.some([CONST.REGEX.ROUTES.UNLINK_LOGIN], (unsupportRouteRegex) => {
            const routeRegex = new RegExp(unsupportRouteRegex);
            return routeRegex.test(window.location.pathname);
        });

        if (!isMacOSWeb() || isUnsupportedDeeplinkRoute || CONFIG.ENVIRONMENT === CONST.ENVIRONMENT.DEV) {
            return;
        }

        // If the current url path is /transition..., meaning it was opened from oldDot, during this transition period:
        // 1. The user session may not exist, because sign-in has not been completed yet.
        // 2. There may be non-idempotent operations (e.g. create a new workspace), which obviously should not be executed again in the desktop app.
        // So we need to wait until after sign-in and navigation are complete before starting the deeplink redirect.
        if (Str.startsWith(window.location.pathname, Str.normalizeUrl(ROUTES.TRANSITION_BETWEEN_APPS))) {
            App.beginDeepLinkRedirectAfterTransition();
            return;
        }

        // Match any magic link (/v/<account id>/<6 digit code>)
        const isMagicLink = CONST.REGEX.ROUTES.VALIDATE_LOGIN.test(window.location.pathname);

        App.beginDeepLinkRedirect(!isMagicLink);
    }, []);

    return children;
}

DeeplinkWrapper.propTypes = propTypes;
export default DeeplinkWrapper;
