import React, {Component} from 'react';
import SignInPage from './page/SignInPage';
import HomePage from './page/HomePage/HomePage';
import * as Store from './store/Store';
import * as ActiveClientManager from './lib/ActiveClientManager';
import {verifyAuthToken} from './store/actions/SessionActions';
import STOREKEYS from './store/STOREKEYS';
import {
    Route,
    Router,
    Redirect,
    Switch
} from './lib/Router';

// Initialize the store when the app loads for the first time
Store.init();

export default class Expensify extends Component {
    constructor(props) {
        super(props);

        this.state = {
            redirectTo: null,
        };
    }

    async componentDidMount() {
        // Listen for when the app wants to redirect to a specific URL
        Store.subscribe(STOREKEYS.APP_REDIRECT_TO, (redirectTo) => {
            this.setState({redirectTo});
        });

        // Verify that our authToken is OK to use
        verifyAuthToken();

        // Initialize this client as being an active client
        await ActiveClientManager.init();

        // TODO: Refactor window events
        // window.addEventListener('beforeunload', () => {
        //   ActiveClientManager.removeClient();
        // });
    }

    render() {
        return (
            <Router>
                {/* If there is ever a property for redirecting, we do the redirect here */}
                {this.state.redirectTo && <Redirect to={this.state.redirectTo} />}

                <Switch>
                    <Route path="/signin" component={SignInPage} />
                    <Route path="/" component={HomePage} />
                </Switch>
            </Router>
        );
    }
}
