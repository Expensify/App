import React, {PureComponent} from 'react';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ROUTES from '../ROUTES';
import ONYXKEYS from '../ONYXKEYS';
import {loadBetasAndFetchPolicies, executeActionsThenReroute} from '../libs/actions/Transition';
import {signInWithShortLivedToken} from '../libs/actions/Session';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';

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

class TransitionPage extends PureComponent {
    componentDidMount() {
        const accountID = lodashGet(this.props.route.params, 'accountID', '');
        const email = lodashGet(this.props.route.params, 'email', '');
        const shortLivedToken = lodashGet(this.props.route.params, 'shortLivedToken', '');
        const encryptedAuthToken = lodashGet(this.props.route.params, 'encryptedAuthToken', '');

        // exitTo is URI encoded because it could contain a variable number of slashes (i.e. "workspace/new" vs "workspace/<ID>/card")
        const exitTo = decodeURIComponent(lodashGet(this.props.route.params, 'exitTo', '')) || ROUTES.HOME;

        // Define the ordered sequence of actions we need to run before rerouting to `exitTo`
        const actions = [loadBetasAndFetchPolicies];
        if (!this.props.session.authToken || email !== this.props.session.email) {
            actions.unshift(() => signInWithShortLivedToken(accountID, email, shortLivedToken, encryptedAuthToken));
        }

        executeActionsThenReroute(actions, exitTo);
    }

    render() {
        return <FullScreenLoadingIndicator />;
    }
}

TransitionPage.propTypes = propTypes;
TransitionPage.defaultProps = defaultProps;

export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(TransitionPage);
