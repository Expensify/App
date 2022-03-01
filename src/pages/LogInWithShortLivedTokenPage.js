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

        const signedIn = this.props.session && this.props.session.authToken;
        if (!signedIn) {
            Session.signInWithShortLivedToken(accountID, email, shortLivedToken);
            return;
        }

        // User is trying to transition with a different account than the one
        // they are currently signed in as so we will sign them out, clear Onyx,
        // and cancel all network requests made with their old login. This
        // component will mount again from PublicScreens and since they are no
        // longer signed in, a request will be made to sign them in with their new account.
        if (email !== this.props.session.email) {
            Session.signOutAndRedirectToSignIn();
        }
    }

    componentDidUpdate() {
        if (!this.props.session.authToken) {
            return;
        }

        const email = lodashGet(this.props.route.params, 'email', '');

        // exitTo is URI encoded because it could contain a variable number of slashes (i.e. "workspace/new" vs "workspace/<ID>/card")
        const exitTo = decodeURIComponent(lodashGet(this.props.route.params, 'exitTo', ''));

        const signedIn = this.props.session && this.props.session.authToken;
        if (!signedIn) {
            const accountID = parseInt(lodashGet(this.props.route.params, 'accountID', ''), 10);
            const shortLivedToken = lodashGet(this.props.route.params, 'shortLivedToken', '');
            Session.signInWithShortLivedToken(accountID, email, shortLivedToken);
            return;
        }

        // User is trying to transition with a different account than the one
        // they are currently signed in as so we will sign them out, clear Onyx,
        // and cancel all network requests. This component will mount again from
        // PublicScreens and since they are no longer signed in, a request will be
        // made to sign them in with their new account.
        if (email !== this.props.session.email) {
            Session.signOutAndRedirectToSignIn();
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
    session: {
        key: ONYXKEYS.SESSION,
    },
})(LogInWithShortLivedTokenPage);
