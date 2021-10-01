import React, {Component} from 'react';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import AppNavigatorContext from '../../libs/Navigation/AppNavigator/AppNavigatorContext';
import ONYXKEYS from '../../ONYXKEYS';
import {signInWithShortLivedToken} from '../../libs/actions/Session';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import Navigation from '../../libs/Navigation/Navigation';
import * as User from '../../libs/actions/User';
import Growl from '../../libs/Growl';

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
    }

    componentDidMount() {
        // If the user is already authenticated with the right account, just refresh betas. No need to re-authenticate.
        if (this.isCorrectUserLoggedIn(this.props.session)) {
            User.getBetas();
            return;
        }

        signInWithShortLivedToken(this.accountID, this.email, this.shortLivedToken, this.encryptedAuthToken);
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

        // Stay in the transition page until we're logged in and our betas are loaded
        if (!this.isCorrectUserLoggedIn(this.props.session) || !this.props.betas) {
            return;
        }

        // exitTo is URI encoded because it could contain a variable number of slashes (i.e. "workspace/new" vs "workspace/<ID>/card")
        const exitTo = decodeURIComponent(lodashGet(this.props.route.params, 'exitTo', ''));
        Navigation.navigate(exitTo);
    }

    /**
     * @param {Object} session
     * @returns {Boolean}
     */
    isCorrectUserLoggedIn(session) {
        return session.authToken && session.email === this.email;
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
