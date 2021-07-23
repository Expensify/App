import React, {Component} from 'react';
import {AppState, LogBox} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import CustomStatusBar from './components/CustomStatusBar';
import ErrorBoundary from './components/ErrorBoundary';
import Expensify from './Expensify';
import Log from './libs/Log';

LogBox.ignoreLogs([
    // Basically it means that if the app goes in the background and back to foreground on Android,
    // the timer is lost. Currently Expensify is using a 30 minutes interval to refresh personal details.
    // More details here: https://git.io/JJYeb
    'Setting a timer for a long period of time',

    // Caused by rn-fetch-blob. Can safely ignore as it has no impact on features.
    'Require cycle: node_modules/rn-fetch-blob',
]);

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            appState: AppState.currentState,
        };
        this.handleAppStateChange = this.handleAppStateChange.bind(this);
    }

    componentDidMount() {
        AppState.addEventListener('change', this.handleAppStateChange);
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this.handleAppStateChange);
    }

    handleAppStateChange(nextAppState) {
        if (nextAppState.match(/inactive|background/) && this.state.appState === 'active') {
            Log.info('Flushing logs as app is going inactive', true);
        }
        this.setState({appState: nextAppState});
    }

    render() {
        return (
            <SafeAreaProvider>
                <CustomStatusBar />
                <ErrorBoundary errorMessage="E.cash crash caught by error boundary">
                    <Expensify />
                </ErrorBoundary>
            </SafeAreaProvider>
        );
    }
}

App.displayName = 'App';

export default App;
