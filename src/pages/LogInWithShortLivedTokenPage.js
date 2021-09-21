import React, {Component} from 'react';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';
import {signInWithShortLivedToken} from '../libs/actions/Session';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import Navigation from '../libs/Navigation/Navigation';

const propTypes = {
    /** The accountID and validateCode are passed via the URL */
    route: PropTypes.shape({
        // The name of the route
        name: PropTypes.string,

        // Unique key associated with the route
        key: PropTypes.string,

        // Each parameter passed via the URL
        params: PropTypes.shape({
            // AccountID associated with the validation link
            accountID: PropTypes.string,

            // Short lived token
            shortLivedToken: PropTypes.string,

            // URL to exit to
            exitTo: PropTypes.string,
        }),
    }),

    /** The data about the current session */
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

        // exitTo is URI encoded because it could contain a variable number of slashes (i.e. "workspace/new" vs "workspace/<ID>/card")
        const exitTo = decodeURIComponent(lodashGet(this.props.route.params, 'exitTo', ''));

        // If the user is revisiting the component authenticated or they were already logged into the right account, we simply redirect them to the exitTo
        if (this.props.session.authToken && email === this.props.session.email) {
            Navigation.navigate(exitTo);
        }

        signInWithShortLivedToken(accountID, email, shortLivedToken);
    }

    render() {
        return <FullScreenLoadingIndicator />;
    }
}

LogInWithShortLivedTokenPage.propTypes = propTypes;
LogInWithShortLivedTokenPage.defaultProps = defaultProps;

export default compose(
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(LogInWithShortLivedTokenPage);
