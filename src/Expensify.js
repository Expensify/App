import React, {Component} from 'react';
import {Beforeunload} from 'react-beforeunload';
import SignInPage from './page/SignInPage';
import HomePage from './page/HomePage/HomePage';
import * as Store from './store/Store';
import * as ActiveClientManager from './lib/ActiveClientManager';
import {verifyAuthToken} from './store/actions/SessionActions';
import STOREKEYS from './store/STOREKEYS';
import WithStore from './components/WithStore';
import {
    Route,
    Router,
    Redirect,
    Switch
} from './lib/Router';

// Initialize the store when the app loads for the first time
Store.init();

class Expensify extends Component {
    render() {
        return (
            <Beforeunload onBeforeunload={ActiveClientManager.removeClient}>
                <Router>
                    {/* If there is ever a property for redirecting, we do the redirect here */}
                    {this.state && this.state.redirectTo && <Redirect to={this.state.redirectTo} />}

                    <Switch>
                        <Route path="/signin" component={SignInPage} />
                        <Route path="/" component={HomePage} />
                    </Switch>
                </Router>
            </Beforeunload>
        );
    }
}

export default WithStore({
    redirectTo: {
        key: STOREKEYS.APP_REDIRECT_TO,
        loader: () => {
            // Verify that our authToken is OK to use
            verifyAuthToken();

            // Initialize this client as being an active client
            ActiveClientManager.init();
        },
    },
})(Expensify);
