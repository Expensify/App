import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';

// import {Beforeunload} from 'react-beforeunload';
import SignInPage from './page/SignInPage';
import HomePage from './page/HomePage/HomePage';
import Ion from './lib/Ion';
import * as ActiveClientManager from './lib/ActiveClientManager';
import {verifyAuthToken} from './lib/actions/Session';
import IONKEYS from './IONKEYS';
import withIon from './components/withIon';
import styles from './style/StyleSheet';

import {
    Route,
    Router,
    Redirect,
    Switch
} from './lib/Router';

// Initialize the store when the app loads for the first time
Ion.init();

const propTypes = {
    /* Ion Props */

    // A route set by Ion that we will redirect to if present. Always empty on app init.
    redirectTo: PropTypes.string,
};

const defaultProps = {
    redirectTo: '',
};

class Expensify extends Component {
    constructor(props) {
        super(props);

        this.recordCurrentRoute = this.recordCurrentRoute.bind(this);

        this.state = {
            loading: true,
            authToken: '',
        };
    }

    componentDidMount() {
        // We need to delay initializing the main app so we can check for an authToken and
        // redirect to the signin page if we do not have one. Otherwise when the app inits
        // we will fall through to the homepage and the user will see a brief flash of the main
        // app experience.
        Ion.get(IONKEYS.SESSION, 'authToken', '')
            .then((authToken) => {
                this.setState({loading: false, authToken});
            });
    }

    /**
     * Keep the current route match stored in Ion so other libs can access it
     *
     * @param {object} params.match
     */
    recordCurrentRoute({match}) {
        Ion.set(IONKEYS.CURRENT_URL, match.url);
    }

    render() {
        if (this.state.loading) {
            return (
                <View style={styles.genericView} />
            );
        }

        // We can only have a redirectTo if this is not the initial render so if we have one we'll
        // always navigate to it. If we are not authenticated by this point then we'll force navigate to sign in.
        const redirectTo = this.props.redirectTo || (!this.state.authToken && '/signin');

        return (

            // TODO: Mobile does not support Beforeunload
            // <Beforeunload onBeforeunload={ActiveClientManager.removeClient}>
            <Router>
                {/* If there is ever a property for redirecting, we do the redirect here */}
                {redirectTo && <Redirect to={redirectTo} />}
                <Route path="*" render={this.recordCurrentRoute} />

                <Switch>
                    <Route path={['/signin/exitTo/:exitTo*', '/signin']} component={SignInPage} />
                    <Route path="/" component={HomePage} />
                </Switch>
            </Router>

        // </Beforeunload>
        );
    }
}

Expensify.propTypes = propTypes;
Expensify.defaultProps = defaultProps;

export default withIon({
    redirectTo: {
        key: IONKEYS.APP_REDIRECT_TO,
        loader: () => {
            // Verify that our authToken is OK to use
            verifyAuthToken();

            // Initialize this client as being an active client
            ActiveClientManager.init();
        },

        // Prevent the prefilling of Ion data or else the app will always redirect to what the last value was set to.
        // This ends up in a situation where you go to a report, refresh the page, and then rather than seeing the
        // report you are brought back to the root of the site (ie. "/").
        initWithStoredValues: false,
    },
})(Expensify);
