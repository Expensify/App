import React, {Component} from 'react';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ROUTES from '../ROUTES';
import ONYXKEYS from '../ONYXKEYS';
import * as Session from '../libs/actions/Session';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import Navigation from '../libs/Navigation/Navigation';
import CustomActions from '../libs/Navigation/CustomActions';

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

        // If the user is revisiting the component authenticated with the right account, we don't need to do anything, the componentWillUpdate when betas are loaded and redirect
        if (this.props.session.authToken && email === this.props.session.email) {
            return;
        }

        Session.signInWithShortLivedToken(accountID, email, shortLivedToken);
    }

    componentDidUpdate() {
        const email = lodashGet(this.props.route.params, 'email', '');
        if (!this.props.betas || !this.props.session.authToken || email !== this.props.session.email) {
            return;
        }

        // exitTo is URI encoded because it could contain a variable number of slashes (i.e. "workspace/new" vs "workspace/<ID>/card")
        const exitTo = decodeURIComponent(lodashGet(this.props.route.params, 'exitTo', ''));

        // We have two routes in our history, "/" and "transition". We want to dismiss the trasition route, remove it from the history
        // or else a user could be routed back to `/transition` when they close the modal.
        // Or in some cases, the home screen gets stuck in `/transition` and there is an endless spinner in the background
        CustomActions.navigateBackToRootDrawer();

        // New workspace creation is handled in AuthScreens which creates a workspace and navigates to it
        // We do not need to navigate to /workspace/new
        if (exitTo === ROUTES.WORKSPACE_NEW) {
            return;
        }

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
    betas: {
        key: ONYXKEYS.BETAS,
    },
})(LogInWithShortLivedTokenPage);
