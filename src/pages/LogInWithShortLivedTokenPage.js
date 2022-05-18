import React, {Component} from 'react';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import * as Session from '../libs/actions/Session';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import waitForOnyxToClear from '../libs/waitForOnyxToClear';

const propTypes = {
    /** The parameters needed to authenticate with a short lived token are in the URL */
    route: PropTypes.shape({
        /** Each parameter passed via the URL */
        params: PropTypes.shape({
            /** Short lived token to sign in a user */
            shortLivedToken: PropTypes.string,

            /** The email of the transitioning user */
            email: PropTypes.string,
        }),
    }),
};

const defaultProps = {
    route: null,
};

class LogInWithShortLivedTokenPage extends Component {
    componentDidMount() {
        waitForOnyxToClear()
            .then(() => {
                const email = lodashGet(this.props, 'route.params.email', '');
                const shortLivedToken = lodashGet(this.props, 'route.params.shortLivedToken', '');
                Session.signInWithShortLivedToken(email, shortLivedToken);
            });
    }

    render() {
        return <FullScreenLoadingIndicator />;
    }
}

LogInWithShortLivedTokenPage.propTypes = propTypes;
LogInWithShortLivedTokenPage.defaultProps = defaultProps;

export default LogInWithShortLivedTokenPage;
