import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {withOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '../FullscreenLoadingIndicator';
import styles from '../../styles/styles';
import CONST from '../../CONST';
import CONFIG from '../../CONFIG';
import * as Browser from '../../libs/Browser';
import ONYXKEYS from '../../ONYXKEYS';
import * as Session from '../../libs/actions/Session';

const propTypes = {
    /** Children to render. */
    children: PropTypes.node.isRequired,

    /** Session info for the currently logged-in user. */
    session: PropTypes.shape({

        /** Currently logged-in user email */
        email: PropTypes.string,

        /** Currently logged-in user authToken */
        authToken: PropTypes.string,

        /** The short-lived auth token for navigating to desktop app */
        shortLivedAuthToken: PropTypes.string,
    }),
};

const defaultProps = {
    session: {
        email: '',
        authToken: '',
        shortLivedAuthToken: '',
    },
};

class DeeplinkWrapper extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            isShortLivedAuthTokenLoading: this.isMacOSWeb() && CONFIG.ENVIRONMENT !== CONST.ENVIRONMENT.DEV,
        };
    }

    componentDidMount() {
        if (!this.isMacOSWeb() || CONFIG.ENVIRONMENT === CONST.ENVIRONMENT.DEV) {
            return;
        }

        // Since there is no way to know if a previous short-lived authToken is still valid,
        // any previous short-lived authToken must be cleared out and a new one must be fetched
        // so that the popup window will only open when we know the short-lived authToken is valid.
        Session.removeShortLivedAuthToken();

        if (!this.props.session.authToken) {
            this.openRouteInDesktopApp();
            return;
        }
        Session.getShortLivedAuthToken();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.session.shortLivedAuthToken || !this.props.session.shortLivedAuthToken) {
            return;
        }

        // Now that there is a shortLivedAuthToken, the route to the desktop app can be opened.
        this.openRouteInDesktopApp();
    }

    openRouteInDesktopApp() {
        this.setState({
            isShortLivedAuthTokenLoading: false,
        });

        const params = new URLSearchParams();
        params.set('exitTo', `${window.location.pathname}${window.location.search}${window.location.hash}`);
        const session = this.props.session;
        if (session.email && session.shortLivedAuthToken) {
            params.set('email', session.email);
            params.set('shortLivedAuthToken', session.shortLivedAuthToken);
        }
        const expensifyUrl = new URL(CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL);
        const expensifyDeeplinkUrl = `${CONST.DEEPLINK_BASE_URL}${expensifyUrl.host}/transition?${params.toString()}`;

        // This check is necessary for Safari, otherwise, if the user
        // does NOT have the Expensify desktop app installed, it's gonna
        // show an error in the page saying that the address is invalid
        if (CONST.BROWSER.SAFARI === Browser.getBrowser()) {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            iframe.contentWindow.location.href = expensifyDeeplinkUrl;

            // Since we're creating an iframe for Safari to handle deeplink,
            // we need to give Safari some time to open the pop-up window.
            // After that we can just remove the iframe.
            setTimeout(() => {
                if (!iframe.parentNode) {
                    return;
                }
                iframe.parentNode.removeChild(iframe);
            }, 0);
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
        if (this.state.isShortLivedAuthTokenLoading) {
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
