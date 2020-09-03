import React, {Component} from 'react';
import {Platform, View} from 'react-native';
import PropTypes from 'prop-types';

// import {Beforeunload} from 'react-beforeunload';
import SignInPage from './page/SignInPage';
import HomePage from './page/home/HomePage';
import Ion from './lib/Ion';
import * as ActiveClientManager from './lib/ActiveClientManager';
import IONKEYS from './IONKEYS';
import withIon from './components/withIon';
import styles from './style/StyleSheet';

import {
    Route,
    Router,
    Redirect,
    Switch
} from './lib/Router';
import ROUTES from './ROUTES';

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

        // Initialize this client as being an active client
        ActiveClientManager.init();

        this.recordCurrentRoute = this.recordCurrentRoute.bind(this);
        this.removeLoadingState = this.removeLoadingState.bind(this);

        this.state = {
            isLoading: true,
            authToken: null,
        };
    }

    componentDidMount() {
        Ion.connect({key: IONKEYS.SESSION, path: 'authToken', callback: this.removeLoadingState});
    }

    /**
     * When the authToken is updated, the app should remove the loading state and handle the authToken
     *
     * @param {string} authToken
     */
    removeLoadingState(authToken) {
        this.setState({
            authToken,
            isLoading: false,
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
        // Until the authToken has been initialized from Ion, display a blank page
        if (this.state.isLoading) {
            return (
                <View style={styles.genericView} />
            );
        }

        const redirectTo = !this.state.authToken
            ? ROUTES.SIGNIN
            : this.props.redirectTo;

        return (

            // TODO: Mobile does not support Beforeunload
            // <Beforeunload onBeforeunload={ActiveClientManager.removeClient}>
            <Router>
                {/* If there is ever a property for redirecting, we do the redirect here */}
                {/* Leave this as a ternary or else iOS throws an error about text not being wrapped in <Text> */}
                {redirectTo ? <Redirect to={redirectTo} /> : null}
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
        key: IONKEYS.APP.REDIRECT_TO,

        // Prevent the prefilling of Ion data or else the app will always redirect to what the last value was set to.
        // This ends up in a situation where you go to a report, refresh the page, and then rather than seeing the
        // report you are brought back to the root of the site (ie. "/").
        initWithStoredValues: false,
    }
})(Expensify);
