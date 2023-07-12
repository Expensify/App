import {createNavigationContainerRef, NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {useEffect} from 'react';
import {AppRegistry} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Onyx, {withOnyx} from 'react-native-onyx';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import ComposeProviders from './src/components/ComposeProviders';
import CustomStatusBar from './src/components/CustomStatusBar';
import OnyxProvider from './src/components/OnyxProvider';
import SafeArea from './src/components/SafeArea';
import {KeyboardStateProvider} from './src/components/withKeyboardState';
import {LocaleContextProvider} from './src/components/withLocalize';
import {WindowDimensionsProvider} from './src/components/withWindowDimensions';
import CONFIG from './src/CONFIG';
import * as App from './src/libs/actions/App';
import * as User from './src/libs/actions/User';
import NetworkConnection from './src/libs/NetworkConnection';
import * as Pusher from './src/libs/Pusher/pusher';
import PusherConnectionManager from './src/libs/PusherConnectionManager';
import ONYXKEYS from './src/ONYXKEYS';
import ShareExtensionPage from './src/pages/ShareExtensionPage';
import ShareMessagePage from './src/pages/ShareMessagePage';
// import additionalAppSetup from './src/setup';
import CONST from './src/CONST';
import * as Metrics from './src/libs/Metrics';

// TODO: can/should we use additionalAppSetup here?
Onyx.init({
    keys: ONYXKEYS,

    // Increase the cached key count so that the app works more consistently for accounts with large numbers of reports
    maxCachedKeysCount: 10000,
    safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
    captureMetrics: Metrics.canCaptureOnyxMetrics(),
    initialKeyStates: {
        // Clear any loading and error messages so they do not appear on app startup
        [ONYXKEYS.SESSION]: {loading: false},
        [ONYXKEYS.ACCOUNT]: CONST.DEFAULT_ACCOUNT_DATA,
        [ONYXKEYS.NETWORK]: {isOffline: false},
        [ONYXKEYS.IOU]: {
            loading: false,
            error: false,
        },
        [ONYXKEYS.IS_SIDEBAR_LOADED]: false,
        [ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT]: true,
    },
});

// eslint-disable-next-line
export const navigationRef = createNavigationContainerRef();

const Stack = createStackNavigator();

const ShareExtension = withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
})((props) => {
    useEffect(() => {
        NetworkConnection.listenForReconnect();
        NetworkConnection.onReconnect(() => App.reconnectApp());
        PusherConnectionManager.init();
        Pusher.init({
            appKey: CONFIG.PUSHER.APP_KEY,
            cluster: CONFIG.PUSHER.CLUSTER,
            authEndpoint: `${CONFIG.EXPENSIFY.DEFAULT_API_ROOT}api?command=AuthenticatePusher`,
        }).then(() => {
            User.subscribeToUserEvents();
        });

        App.openApp();
        App.setUpPoliciesAndNavigate(props.session);
    }, [props.session]);

    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <ComposeProviders
                components={[
                    OnyxProvider,
                    SafeAreaProvider,
                    // PortalProvider,
                    SafeArea,
                    LocaleContextProvider,
                    WindowDimensionsProvider,
                    KeyboardStateProvider,
                    // PickerStateProvider,
                ]}
            >
                <CustomStatusBar />
                {/* this appears to require firebase */}
                {/* <ErrorBoundary errorMessage="NewExpensify crash caught by error boundary"> */}
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator screenOptions={{headerShown: false}}>
                        <Stack.Screen
                            name="Share"
                            component={ShareExtensionPage}
                        />
                        <Stack.Screen
                            name="ShareMessage"
                            component={ShareMessagePage}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
                {/* </ErrorBoundary> */}
            </ComposeProviders>
        </GestureHandlerRootView>
    );
});

AppRegistry.registerComponent('ShareMenuModuleComponent', () => ShareExtension);
// this also appears to require firebase
// additionalAppSetup();
