import React, {Component} from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import Onyx, {withOnyx} from 'react-native-onyx';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import SignInPage from './pages/signin/SignInPage';
import SidebarPage from './pages/home/SidebarPage';
import SettingsPage from './pages/SettingsPage';
import listenToStorageEvents from './libs/listenToStorageEvents';
import * as ActiveClientManager from './libs/ActiveClientManager';
import ONYXKEYS from './ONYXKEYS';
import RootNavigator from './Navigator/RootNavigator';
import CONST from './CONST';
import styles from './styles/styles';
import Log from './libs/Log';
import Navigator from './Navigator';
import ROUTES from './ROUTES';
import PushNotification from './libs/Notification/PushNotification';

import MainView from './pages/home/MainView';

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

const Test = (props) => (
    <View>
        <TouchableOpacity
            onPress={() => {
                Navigator.dismissModal();
            }}
        >
            <Text>Go to root</Text>
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => {
                Navigator.goBack();
            }}
        >
            <Text>Go back</Text>
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => {
                Navigator.navigate('/settings/test2');
            }}
        >
            <Text>Go test 2</Text>
        </TouchableOpacity>
    </View>
);

const TestTwo = (props) => (
    <View>
        <TouchableOpacity
            onPress={() => {
                Navigator.dismissModal();
            }}
        >
            <Text>Go to root</Text>
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => {
                Navigator.goBack();
            }}
        >
            <Text>Go back one</Text>
        </TouchableOpacity>
    </View>
);

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
                    publicRoute={{
                        Component: SignInPage,
                        path: 'SignIn',
                        options: {
                            headerShown: false,
                            animationTypeForReplace: 'pop',
                        },
                    }}
                    sidebarRoute={{
                        path: 'Home',
                        Component: SidebarPage,
                    }}
                    modalRoutes={[
                        {
                            path: 'Settings',
                            title: 'Settings',
                            modalType: CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED,
                            subRoutes: [
                                {
                                    path: 'Root',
                                    title: 'Settings',
                                    Component: SettingsPage,
                                },
                                {
                                    path: 'Test',
                                    title: 'Settings | Test',
                                    Component: Test,
                                },
                                {
                                    path: 'Test2',
                                    title: 'Settings | Test 2',
                                    Component: TestTwo,
                                },
                            ],
                        },
                    ]}
                    mainRoutes={[
                        {
                            path: 'Report',
                            Component: MainView,
                            additionalPaths: '',
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
