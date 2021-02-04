import React, {Component} from 'react';
import {View} from 'react-native';
import Onyx, {withOnyx} from 'react-native-onyx';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import SidebarPage from './pages/home/SidebarPage';
import SettingsPage from './pages/SettingsPage';
import listenToStorageEvents from './libs/listenToStorageEvents';
import * as ActiveClientManager from './libs/ActiveClientManager';
import ONYXKEYS from './ONYXKEYS';
import RootNavigator from './Navigator/RootNavigator';

import styles from './styles/styles';
import Log from './libs/Log';

import PushNotification from './libs/Notification/PushNotification';

import MainView from './pages/home/MainView';
import SettingsModal from './components/SettingsModal';

// Initialize the store when the app loads for the first time
Onyx.init({
    keys: ONYXKEYS,
    safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
    initialKeyStates: {

        // Clear any loading and error messages so they do not appear on app startup
        [ONYXKEYS.SESSION]: {loading: false},
        [ONYXKEYS.ACCOUNT]: {loading: false, error: ''},
    },
    registerStorageEventListener: (onStorageEvent) => {
        listenToStorageEvents(onStorageEvent);
    },
});
Onyx.registerLogger(({level, message}) => {
    if (level === 'alert') {
        Log.alert(message, 0, {}, false);
    } else {
        Log.client(message);
    }
});

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
        Onyx.connect({
            key: ONYXKEYS.SESSION,
            callback: this.removeLoadingState,
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.accountID && this.state.accountID !== prevState.accountID) {
            PushNotification.register(this.state.accountID);
        }
    }

    /**
     * When the authToken is updated, the app should remove the loading state and handle the authToken
     *
     * @param {Object} session
     * @param {String} session.authToken
     */
    removeLoadingState(session) {
        this.setState({
            authToken: session ? session.authToken : null,
            accountID: session ? session.accountID : null,
            isLoading: false,
        });
    }

    render() {
        // Until the authToken has been initialized from Onyx, display a blank page
        if (this.state.isLoading) {
            return (
                <View style={styles.genericView} />
            );
        }

        return (
            <SafeAreaProvider>
                <RootNavigator
                    authenticated={this.state.authToken}
                    routes={[
                        {
                            path: '/',
                            Component: SidebarPage,
                            position: 'sidebar',
                        },
                        {
                            path: '/r',
                            Component: MainView,
                            additionalPaths: '/',
                        },
                        {
                            path: '/settings',
                            Component: SettingsPage,
                            ModalComponent: SettingsModal,
                            isModal: true,
                        },
                    ]}
                />
            </SafeAreaProvider>
        );
    }
}

Expensify.defaultProps = defaultProps;

export default withOnyx({
})(Expensify);
