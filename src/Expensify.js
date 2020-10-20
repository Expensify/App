import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {recordCurrentlyViewedReportID, recordCurrentRoute} from './libs/actions/App';
import SignInPage from './pages/SignInPage';
import HomePage from './pages/home/HomePage';
import Ion from './libs/Ion';
import * as ActiveClientManager from './libs/ActiveClientManager';
import IONKEYS from './IONKEYS';
import withIon from './components/withIon';
import styles from './styles/StyleSheet';
import Log from './libs/Log';

import {
    Route,
    Router,
    Redirect,
    Switch
} from './libs/Router';
import ROUTES from './ROUTES';

// Initialize the store when the app loads for the first time
Ion.init({
    keys: IONKEYS,
    safeEvictionKeys: [IONKEYS.COLLECTION.REPORT_ACTIONS],
    initialKeyStates: {

        // Clear any loading and error messages so they do not appear on app startup
        [IONKEYS.SESSION]: {loading: false, error: ''},
    }
});
Ion.registerLogger(({level, message}) => {
    console.debug(message);

    if (level === Log.LEVEL.ALERT) {
        Log.alert(message);
    }
});

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

        this.removeLoadingState = this.removeLoadingState.bind(this);

        this.state = {
            isLoading: true,
            authToken: null,
        };
    }

    componentDidMount() {
        Ion.connect({
            key: IONKEYS.SESSION,
            callback: this.removeLoadingState,
        });
    }

    /**
     * When the authToken is updated, the app should remove the loading state and handle the authToken
     *
     * @param {object} session
     * @param {string} session.authToken
     */
    removeLoadingState(session) {
        this.setState({
            authToken: session ? session.authToken : null,
            isLoading: false,
        });
    }

    render() {
        // Until the authToken has been initialized from Ion, display a blank page
        if (this.state.isLoading) {
            return (
                <View style={styles.genericView} />
            );
        }
        const redirectTo = !this.state.authToken ? ROUTES.SIGNIN : this.props.redirectTo;
        return (
            <Router>
                {/* If there is ever a property for redirecting, we do the redirect here */}
                {/* Leave this as a ternary or else iOS throws an error about text not being wrapped in <Text> */}
                {redirectTo ? <Redirect to={redirectTo} /> : null}
                <Route path="*" render={recordCurrentRoute} />
                <Route path={ROUTES.REPORT} exact render={recordCurrentlyViewedReportID} />

                <Switch>
                    <Route
                        exact
                        path="/"
                        render={() => (
                            this.state.authToken
                                ? <Redirect to={ROUTES.HOME} />
                                : <Redirect to={ROUTES.SIGNIN} />
                        )}
                    />
                    <Route path={[ROUTES.SIGNIN_WITH_EXITTO, ROUTES.SIGNIN]} component={SignInPage} />
                    <Route path={[ROUTES.HOME, ROUTES.ROOT]} component={HomePage} />
                </Switch>
            </Router>
        );
    }
}

Expensify.propTypes = propTypes;
Expensify.defaultProps = defaultProps;

export default withIon({
    redirectTo: {
        key: IONKEYS.APP_REDIRECT_TO,

        // Prevent the prefilling of Ion data or else the app will always redirect to what the last value was set to.
        // This ends up in a situation where you go to a report, refresh the page, and then rather than seeing the
        // report you are brought back to the root of the site (ie. "/").
        initWithStoredValues: false,
    },
})(Expensify);
