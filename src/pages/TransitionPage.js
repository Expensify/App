import React, {Component} from 'react';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import AppNavigatorContext from '../libs/Navigation/AppNavigator/AppNavigatorContext';
import ROUTES from '../ROUTES';
import ONYXKEYS from '../ONYXKEYS';
import {signInWithShortLivedToken} from '../libs/actions/Session';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import Navigation from '../libs/Navigation/Navigation';
import * as User from '../libs/actions/User';
import * as Policy from '../libs/actions/Policy';
import Growl from '../libs/Growl';
import Permissions from '../libs/Permissions';

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

    account: PropTypes.shape({
        /** An error message, present only if authentication fails */
        error: PropTypes.string,
    }),

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    route: {
        params: {},
    },
    session: {},
    account: {},
    betas: null,
};

class TransitionPage extends Component {
    constructor(props) {
        super(props);
        this.accountID = parseInt(lodashGet(this.props.route.params, 'accountID', ''), 10);
        this.email = lodashGet(this.props.route.params, 'email', '');
        this.shortLivedToken = lodashGet(this.props.route.params, 'shortLivedToken', '');
        this.encryptedAuthToken = lodashGet(this.props.route.params, 'encryptedAuthToken', '');

        // exitTo is URI encoded because it could contain a variable number of slashes (i.e. "workspace/new" vs "workspace/<ID>/card")
        this.exitTo = decodeURIComponent(lodashGet(this.props.route.params, 'exitTo', ''));
        this.shouldCreateNewPolicy = Str.startsWith(this.exitTo, ROUTES.WORKSPACE_NEW);
        this.isCreatingNewPolicy = false;
    }

    componentDidMount() {
        // First, make sure we're logged in to the correct account
        if (!this.isCorrectUserLoggedIn(this.props.session)) {
            signInWithShortLivedToken(this.accountID, this.email, this.shortLivedToken, this.encryptedAuthToken);
            return;
        }

        // Next, make sure betas are loaded
        if (!this.props.betas) {
            User.getBetas();
            return;
        }

        // Lastly, create a new policy if needed
        this.maybeCreateNewPolicy();
    }

    componentDidUpdate(prevProps) {
        // If there was a sign-in error, reroute to home
        if (this.props.account.error) {
            this.context.exitSharedStack();
            Navigation.navigate();
            Growl.error('Error: Login failed');
            return;
        }

        // Load betas if we've just signed in
        if (!this.isCorrectUserLoggedIn(prevProps.session) && this.isCorrectUserLoggedIn(this.props.session) && !this.props.betas) {
            User.getBetas();
            return;
        }

        this.maybeCreateNewPolicy();

        // Stay in the transition page until we're logged in, our betas are loaded, and we've created our new policy
        if (!this.isCorrectUserLoggedIn(this.props.session)
            || !this.props.betas
            || (this.shouldCreateNewPolicy && this.isCreatingNewPolicy)) {
            return;
        }

        // Navigate to exitTo unless we created a new policy – in that case we automatically route to the new policy
        if (!this.shouldCreateNewPolicy) {
            Navigation.navigate(this.exitTo);
        }
    }

    /**
     * @param {Object} session
     * @returns {Boolean}
     */
    isCorrectUserLoggedIn(session) {
        return session.authToken && session.email === this.email;
    }

    maybeCreateNewPolicy() {
        if (this.shouldCreateNewPolicy
            && !this.isCreatingNewPolicy
            && this.isCorrectUserLoggedIn(this.props.session)
            && (Permissions.canUseFreePlan(this.props.betas) || Permissions.canUseDefaultRooms(this.props.betas))) {
            this.isCreatingNewPolicy = true;
            Policy.create();
        }
    }

    render() {
        return <FullScreenLoadingIndicator />;
    }
}

TransitionPage.propTypes = propTypes;
TransitionPage.defaultProps = defaultProps;
TransitionPage.contextType = AppNavigatorContext;

export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
    account: {
        key: ONYXKEYS.ACCOUNT,
    },
    betas: {
        key: ONYXKEYS.BETAS,
    },
})(TransitionPage);
