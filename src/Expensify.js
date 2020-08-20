import React, {Component} from 'react';
import {View} from 'react-native';
import get from 'lodash.get';

// import {Beforeunload} from 'react-beforeunload';
import SignInPage from './page/SignInPage';
import HomePage from './page/HomePage/HomePage';
import Ion from './lib/Ion';
import * as ActiveClientManager from './lib/ActiveClientManager';
import {verifyAuthToken} from './lib/actions/ActionsSession';
import IONKEYS from './IONKEYS';
import WithIon from './components/WithIon';
import styles from './style/StyleSheet';

import {
    Route,
    Router,
    Redirect,
    Switch
} from './lib/Router';

// Initialize the store when the app loads for the first time
Ion.init();

class Expensify extends Component {
    constructor(props) {
        super(props);

        this.recordCurrentRoute = this.recordCurrentRoute.bind(this);

        this.state = {
            loading: true,
            authenticated: false,
        };
    }

    componentDidMount() {
        // We need to delay initializing the main app so we can check for an authToken and
        // redirect to the signin page if we do not have one. Otherwise when the app inits
        // we will fall through to the homepage and the user will see a brief flash of the main
        // app experience.
        Ion.get(IONKEYS.SESSION)
            .then((response) => {
                this.setState({loading: false, authenticated: Boolean(get(response, 'authToken', false))});
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
        const redirectTo = this.props.redirectTo || (!this.state.authenticated && '/signin');

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

export default WithIon({
    redirectTo: {
        key: IONKEYS.APP_REDIRECT_TO,
        loader: () => {
            // Verify that our authToken is OK to use
            verifyAuthToken();

            // Initialize this client as being an active client
            ActiveClientManager.init();
        },
    },
})(Expensify);
