import React, {Component} from 'react';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ROUTES from '../ROUTES';
import ONYXKEYS from '../ONYXKEYS';
import * as Session from '../libs/actions/Session';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import Navigation from '../libs/Navigation/Navigation';

const propTypes = {
    /** The parameters needed to authenticate with a short lived token are in the URL */
    route: PropTypes.shape({
        /** The name of the route */
        name: PropTypes.string,

        /** Unique key associated with the route */
        key: PropTypes.string,

        /** Each parameter passed via the URL */
        params: PropTypes.shape({
            /** AccountID associated with the validation link */
            accountID: PropTypes.string,

            /** Short lived token */
            shortLivedToken: PropTypes.string,

            /** URL to exit to */
            exitTo: PropTypes.string,
        }),
    }),

    /** The data about the current session which will be set once the user is authenticated and we return to this component as an AuthScreen */
    session: PropTypes.shape({
        /** The authToken for the current session */
        authToken: PropTypes.string,

        /** The authToken for the current session */
        email: PropTypes.string,
    }),
};

const defaultProps = {
    route: {
        params: {},
    },
    session: {},
};

class LogInWithShortLivedTokenPage extends Component {
    componentDidMount() {
        const accountID = parseInt(lodashGet(this.props.route.params, 'accountID', ''), 10);
        const email = lodashGet(this.props.route.params, 'email', '');
        const shortLivedToken = lodashGet(this.props.route.params, 'shortLivedToken', '');

        const isUserSignedIn = this.props.session && this.props.session.authToken;
        if (!isUserSignedIn) {
            Session.signInWithShortLivedToken(accountID, email, shortLivedToken);
            return;
        }

        this.signOutIfNeeded(email);
    }

    componentDidUpdate() {
        if (!lodashGet(this.props, 'session.authToken', null)) {
            return;
        }

        const email = lodashGet(this.props.route.params, 'email', '');

        // exitTo is URI encoded because it could contain a variable number of slashes (i.e. "workspace/new" vs "workspace/<ID>/card")
        const exitTo = decodeURIComponent(lodashGet(this.props.route.params, 'exitTo', ''));

        if (this.signOutIfNeeded(email)) {
            return;
        }

        if (exitTo === ROUTES.WORKSPACE_NEW) {
            // New workspace creation is handled in AuthScreens, not in its own screen
            return;
        }

        // In order to navigate to a modal, we first have to dismiss the current modal. But there is no current
        // modal you say? I know, it confuses me too. Without dismissing the current modal, if the user cancels out
        // of the workspace modal, then they will be routed back to
        // /transition/<accountID>/<email>/<authToken>/workspace/<policyID>/card and we don't want that. We want them to go back to `/`
        // and by calling dismissModal(), the /transition/... route is removed from history so the user will get taken to `/`
        // if they cancel out of the new workspace modal.
        Navigation.dismissModal();
        Navigation.navigate(exitTo);
    }

    /**
     * If the user is trying to transition with a different account than the one
     * they are currently signed in as we will sign them out, clear Onyx,
     * and cancel all network requests. This component will mount again from
     * PublicScreens and since they are no longer signed in, a request will be
     * made to sign them in with their new account.
     * @param {String} email The user's email passed as a route param.
     * @returns {Boolean}
     */
    signOutIfNeeded(email) {
        if (this.props.session && this.props.session.email === email) {
            return false;
        }

        Session.signOutAndRedirectToSignIn();
        return true;
    }

    render() {
        return <FullScreenLoadingIndicator />;
    }
}

LogInWithShortLivedTokenPage.propTypes = propTypes;
LogInWithShortLivedTokenPage.defaultProps = defaultProps;

export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },

    // We need to subscribe to the betas so that componentDidUpdate will run,
    // causing us to exit to the proper page.
    betas: {
        key: ONYXKEYS.BETAS,
    },
})(LogInWithShortLivedTokenPage);
