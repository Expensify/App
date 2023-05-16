import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {withOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '../FullscreenLoadingIndicator';
import styles from '../../styles/styles';
import CONST from '../../CONST';
import CONFIG from '../../CONFIG';
import * as Browser from '../../libs/Browser';
import ONYXKEYS from '../../ONYXKEYS';
import * as Authentication from '../../libs/Authentication';

const propTypes = {
    /** Children to render. */
    children: PropTypes.node.isRequired,

    /** Session info for the currently logged-in user. */
    session: PropTypes.shape({
        /** Currently logged-in user email */
        email: PropTypes.string,

        /** Currently logged-in user authToken */
        authToken: PropTypes.string,
    }),
};

const defaultProps = {
    session: {
        email: '',
        authToken: '',
    },
};

class DeeplinkWrapper extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            appInstallationCheckStatus:
                this.isMacOSWeb() && CONFIG.ENVIRONMENT !== CONST.ENVIRONMENT.DEV ? CONST.DESKTOP_DEEPLINK_APP_STATE.CHECKING : CONST.DESKTOP_DEEPLINK_APP_STATE.NOT_INSTALLED,
        };
        this.focused = true;
    }

    componentDidMount() {
        if (!this.isMacOSWeb() || CONFIG.ENVIRONMENT === CONST.ENVIRONMENT.DEV) {
            return;
        }

        window.addEventListener('blur', () => {
            this.focused = false;
        });

        const expensifyUrl = new URL(CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL);
        const params = new URLSearchParams();
        params.set('exitTo', `${window.location.pathname}${window.location.search}${window.location.hash}`);
        if (!this.props.session.authToken) {
            const expensifyDeeplinkUrl = `${CONST.DEEPLINK_BASE_URL}${expensifyUrl.host}/transition?${params.toString()}`;
            this.openRouteInDesktopApp(expensifyDeeplinkUrl);
            return;
        }
        Authentication.getShortLivedAuthToken()
            .then((shortLivedAuthToken) => {
                params.set('email', this.props.session.email);
                params.set('shortLivedAuthToken', `${shortLivedAuthToken}`);
                const expensifyDeeplinkUrl = `${CONST.DEEPLINK_BASE_URL}${expensifyUrl.host}/transition?${params.toString()}`;
                this.openRouteInDesktopApp(expensifyDeeplinkUrl);
            })
            .catch(() => {
                // If the request is successful, we call the updateAppInstallationCheckStatus before the prompt pops up.
                // If not, we only need to make sure that the state will be updated.
                this.updateAppInstallationCheckStatus();
            });
    }

    updateAppInstallationCheckStatus() {
        setTimeout(() => {
            if (!this.focused) {
                this.setState({appInstallationCheckStatus: CONST.DESKTOP_DEEPLINK_APP_STATE.INSTALLED});
            } else {
                this.setState({appInstallationCheckStatus: CONST.DESKTOP_DEEPLINK_APP_STATE.NOT_INSTALLED});
            }
        }, 500);
    }

    openRouteInDesktopApp(expensifyDeeplinkUrl) {
        this.updateAppInstallationCheckStatus();

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
        return !Browser.isMobile() && typeof navigator === 'object' && typeof navigator.userAgent === 'string' && /Mac/i.test(navigator.userAgent) && !/Electron/i.test(navigator.userAgent);
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
    session: {key: ONYXKEYS.SESSION},
})(DeeplinkWrapper);
