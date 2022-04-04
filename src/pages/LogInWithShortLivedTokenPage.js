import React, {Component} from 'react';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ROUTES from '../ROUTES';
import ONYXKEYS from '../ONYXKEYS';
import * as Session from '../libs/actions/Session';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import Navigation from '../libs/Navigation/Navigation';
import Log from '../libs/Log';

const propTypes = {
    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

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
    betas: null,
    route: {
        params: {},
    },
    session: {},
};

class LogInWithShortLivedTokenPage extends Component {
    componentDidMount() {
        const accountID = lodashGet(this.props.route.params, 'accountID', '');
        const email = lodashGet(this.props.route.params, 'email', '');
        const shortLivedToken = lodashGet(this.props.route.params, 'shortLivedToken', '');

        const isUserSignedIn = this.props.session && this.props.session.authToken;
        if (!isUserSignedIn) {
            Log.info('[LoginWithShortLivedTokenPage] User not signed in - signing in with short lived token');
            Session.signInWithShortLivedToken(accountID, email, shortLivedToken);
            return;
        }

        if (this.signOutIfNeeded(email)) {
            return;
        }

        Log.info('[LoginWithShortLivedTokenPage] User is signed in');

        // exitTo is URI encoded because it could contain a variable number of slashes (i.e. "workspace/new" vs "workspace/<ID>/card")
        const exitTo = decodeURIComponent(lodashGet(this.props.route.params, 'exitTo', ''));
        if (exitTo === ROUTES.WORKSPACE_NEW) {
            // New workspace creation is handled in AuthScreens, not in its own screen
            Log.info('[LoginWithShortLivedTokenPage] exitTo is workspace/new - handling new workspace creation in AuthScreens');
            return;
        }
        this.navigateToExitRoute();
    }

    componentDidUpdate() {
        this.navigateToExitRoute();
    }

    navigateToExitRoute() {
        if (!this.props.betas) {
            // Wait to navigate until the betas are loaded. Some pages like ReimbursementAccountPage require betas, so keep loading until they are available.
            return;
        }

        // exitTo is URI encoded because it could contain a variable number of slashes (i.e. "workspace/new" vs "workspace/<ID>/card")
        const exitTo = decodeURIComponent(lodashGet(this.props.route.params, 'exitTo', ''));

        // In order to navigate to a modal, we first have to dismiss the current modal. Without dismissing the current modal, if the user cancels out of the workspace modal,
        // then they will be routed back to /transition/<accountID>/<email>/<authToken>/workspace/<policyID>/card and we don't want that. We want them to go back to `/`
        // and by calling dismissModal(), the /transition/... route is removed from history so the user will get taken to `/` if they cancel out of the new workspace modal.
        Log.info('[LoginWithShortLivedTokenPage] Dismissing LoginWithShortLivedTokenPage and navigating to exitTo');
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

        Log.info('[LoginWithShortLivedTokenPage] Different user signed in - signing out');
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
    betas: {
        key: ONYXKEYS.BETAS,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
})(LogInWithShortLivedTokenPage);
