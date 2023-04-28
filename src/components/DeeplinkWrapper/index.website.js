import PropTypes from 'prop-types';
import {PureComponent} from 'react';
import Str from 'expensify-common/lib/str';
import * as Browser from '../../libs/Browser';
import ROUTES from '../../ROUTES';
import * as App from '../../libs/actions/App';
import CONST from '../../CONST';
import CONFIG from '../../CONFIG';

const propTypes = {
    /** Children to render. */
    children: PropTypes.node.isRequired,
};

class DeeplinkWrapper extends PureComponent {
    componentDidMount() {
        if (!this.isMacOSWeb() || CONFIG.ENVIRONMENT === CONST.ENVIRONMENT.DEV) {
            return;
        }

        // If the current page is opened from oldDot, there maybe non-idempotent operations (e.g. create a new workspace) during the transition period,
        // which obviously should not be executed again in the desktop app.
        // We only need to begin the deeplink redirect after sign-in and navigation are completed.
        if (Str.startsWith(window.location.pathname, Str.normalizeUrl(ROUTES.TRANSITION_BETWEEN_APPS))) {
            App.beginDeepLinkRedirectAfterTransition();
            return;
        }
        App.beginDeepLinkRedirect();
    }

    isMacOSWeb() {
        return !Browser.isMobile() && (
            typeof navigator === 'object'
            && typeof navigator.userAgent === 'string'
            && /Mac/i.test(navigator.userAgent)
            && !/Electron/i.test(navigator.userAgent)
        );
    }

    render() {
        return this.props.children;
    }
}

DeeplinkWrapper.propTypes = propTypes;
export default DeeplinkWrapper;
