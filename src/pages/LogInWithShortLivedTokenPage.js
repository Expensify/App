import {Component} from 'react';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {signInWithShortLivedToken} from '../libs/actions/Session';

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
};

const defaultProps = {
    route: {
        params: {},
    },
};
class LogInWithShortLivedTokenPage extends Component {
    componentDidMount() {
        const accountID = parseInt(lodashGet(this.props.route.params, 'accountID', ''), 10);
        const email = lodashGet(this.props.route.params, 'email', '');
        const shortLivedToken = lodashGet(this.props.route.params, 'shortLivedToken', '');
        const encryptedAuthToken = lodashGet(this.props.route.params, 'encryptedAuthToken', '');

        // exitTo is URI encoded because it could contain slashes (i.e. "workspace/new")
        const exitTo = decodeURIComponent(lodashGet(this.props.route.params, 'exitTo', ''));

        signInWithShortLivedToken(accountID, email, shortLivedToken, encryptedAuthToken, exitTo);
    }

    render() {
        // Don't render anything here since we will redirect the user once we've attempted to validate their login
        return null;
    }
}

LogInWithShortLivedTokenPage.propTypes = propTypes;
LogInWithShortLivedTokenPage.defaultProps = defaultProps;

export default LogInWithShortLivedTokenPage;
