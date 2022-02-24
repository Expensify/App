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

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** An error message to display to the user */
        error: PropTypes.string,

        /** Whether or not a sign on form is loading (being submitted) */
        loading: PropTypes.bool,
    }),

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    route: {
        params: {},
    },
    session: {},
    betas: null,
};

class LogInWithShortLivedTokenPage extends Component {
    componentDidMount() {
        const accountID = parseInt(lodashGet(this.props.route.params, 'accountID', ''), 10);
        const email = lodashGet(this.props.route.params, 'email', '');
        const shortLivedToken = lodashGet(this.props.route.params, 'shortLivedToken', '');

        // If the account is loading don't send more requests
        if (this.props.account && this.props.account.loading) {
            return;
        }

        // User is trying to transition with a different account than the one they are currently signed in as so we will sign out and then sign in with the new authToken
        if (email !== this.props.session.email) {
            Session.signOutAndRedirectToSignIn();
            Session.signInWithShortLivedToken(accountID, email, shortLivedToken);
            return;
        }

        // If the user is revisiting the component authenticated with the right account, we don't need to do anything, the componentWillUpdate when betas are loaded and redirect
        if (this.props.session.authToken && email === this.props.session.email) {
            return;
        }

        Session.signInWithShortLivedToken(accountID, email, shortLivedToken);
    }

    componentDidUpdate() {
        if (!this.props.betas || !this.props.session.authToken) {
            return;
        }

        const email = lodashGet(this.props.route.params, 'email', '');

        // exitTo is URI encoded because it could contain a variable number of slashes (i.e. "workspace/new" vs "workspace/<ID>/card")
        const exitTo = decodeURIComponent(lodashGet(this.props.route.params, 'exitTo', ''));

        // User is signing in to a different account sign them out and sign in again
        if (email !== this.props.session.email) {
            const accountID = parseInt(lodashGet(this.props.route.params, 'accountID', ''), 10);
            const shortLivedToken = lodashGet(this.props.route.params, 'shortLivedToken', '');
            Session.signOutAndRedirectToSignIn();
            Session.signInWithShortLivedToken(accountID, email, shortLivedToken);
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

    render() {
        return <FullScreenLoadingIndicator />;
    }
}

LogInWithShortLivedTokenPage.propTypes = propTypes;
LogInWithShortLivedTokenPage.defaultProps = defaultProps;

export default withOnyx({
    account: {
        key: ONYXKEYS.ACCOUNT,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
    betas: {
        key: ONYXKEYS.BETAS,
    },
})(LogInWithShortLivedTokenPage);
