import React, {Component} from 'react';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import * as Session from '../libs/actions/Session';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';

const propTypes = {
    /** The parameters needed to authenticate with a short lived token are in the URL */
    route: PropTypes.shape({
        /** Each parameter passed via the URL */
        params: PropTypes.shape({
            /** Short lived authToken to sign in a user */
            shortLivedAuthToken: PropTypes.string,

            /** The email of the transitioning user */
            email: PropTypes.string,
        }),
    }).isRequired,
};

class LogInWithShortLivedAuthTokenPage extends Component {
    componentDidMount() {
        const email = lodashGet(this.props, 'route.params.email', '');
        const shortLivedAuthToken = lodashGet(this.props, 'route.params.shortLivedAuthToken', '');
        Session.signInWithShortLivedAuthToken(email, shortLivedAuthToken);
    }

    render() {
        return <FullScreenLoadingIndicator />;
    }
}

LogInWithShortLivedAuthTokenPage.propTypes = propTypes;

export default LogInWithShortLivedAuthTokenPage;
