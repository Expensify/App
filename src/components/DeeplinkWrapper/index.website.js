import _ from 'underscore';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {withOnyx} from 'react-native-onyx';
import deeplinkRoutes from './deeplinkRoutes';
import FullScreenLoadingIndicator from '../FullscreenLoadingIndicator';
import styles from '../../styles/styles';
import CONST from '../../CONST';
import CONFIG from '../../CONFIG';
import * as Browser from '../../libs/Browser';
import ONYXKEYS from '../../ONYXKEYS';

const propTypes = {
    /** Children to render. */
    children: PropTypes.node.isRequired,

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    betas: [],
};

class DeeplinkWrapper extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            appInstallationCheckStatus: (this.isMacOSWeb() && CONFIG.ENVIRONMENT !== CONST.ENVIRONMENT.DEV)
                ? CONST.DESKTOP_DEEPLINK_APP_STATE.CHECKING : CONST.DESKTOP_DEEPLINK_APP_STATE.NOT_INSTALLED,
        };
    }

    componentDidMount() {
        if (!this.isMacOSWeb() || CONFIG.ENVIRONMENT === CONST.ENVIRONMENT.DEV) {
            return;
        }

        let focused = true;

        window.addEventListener('blur', () => {
            focused = false;
        });

        setTimeout(() => {
            if (!focused) {
                this.setState({appInstallationCheckStatus: CONST.DESKTOP_DEEPLINK_APP_STATE.INSTALLED});
            } else {
                this.setState({appInstallationCheckStatus: CONST.DESKTOP_DEEPLINK_APP_STATE.NOT_INSTALLED});
            }
        }, 500);

        // check if pathname matches with deeplink routes
        const matchedRoute = _.find(deeplinkRoutes, (route) => {
            if (route.isDisabled && route.isDisabled(this.props.betas)) {
                return false;
            }
            const routeRegex = new RegExp(route.pattern);
            return routeRegex.test(window.location.pathname);
        });

        if (matchedRoute) {
            this.openRouteInDesktopApp();
        }
    }

    openRouteInDesktopApp() {
        const expensifyUrl = new URL(CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL);
        const expensifyDeeplinkUrl = `${CONST.DEEPLINK_BASE_URL}${expensifyUrl.host}${window.location.pathname}${window.location.search}${window.location.hash}`;

        // This check is necessary for Safari, otherwise, if the user
        // does NOT have the Expensify desktop app installed, it's gonna
        // show an error in the page saying that the address is invalid
        if (CONST.BROWSER.SAFARI === Browser.getBrowser()) {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            iframe.contentWindow.location.href = expensifyDeeplinkUrl;

            // Since we're creating an iframe for Safari to handle
            // deeplink we need to give this iframe some time for
            // it to do what it needs to do. After that we can just
            // remove the iframe.
            setTimeout(() => {
                if (!iframe.parentNode) {
                    return;
                }

                iframe.parentNode.removeChild(iframe);
            }, 100);
        } else {
            window.location.href = expensifyDeeplinkUrl;
        }
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
        if (this.state.appInstallationCheckStatus === CONST.DESKTOP_DEEPLINK_APP_STATE.CHECKING) {
            return <FullScreenLoadingIndicator style={styles.flex1} />;
        }

        return this.props.children;
    }
}

DeeplinkWrapper.propTypes = propTypes;
DeeplinkWrapper.defaultProps = defaultProps;
export default withOnyx({
    betas: {key: ONYXKEYS.BETAS},
})(DeeplinkWrapper);
