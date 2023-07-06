import {createNavigationContainerRef, NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import lodashGet from 'lodash/get';
import {useEffect, useState} from 'react';
import {AppRegistry, Pressable, Text, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Onyx, {withOnyx} from 'react-native-onyx';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Button from './src/components/Button';
import ComposeProviders from './src/components/ComposeProviders';
import CustomStatusBar from './src/components/CustomStatusBar';
import MenuItem from './src/components/MenuItem';
import OnyxProvider from './src/components/OnyxProvider';
import SafeArea from './src/components/SafeArea';
import TextInput from './src/components/TextInput';
import {KeyboardStateProvider} from './src/components/withKeyboardState';
import withLocalize, {LocaleContextProvider, withLocalizePropTypes} from './src/components/withLocalize';
import {WindowDimensionsProvider} from './src/components/withWindowDimensions';
import CONFIG from './src/CONFIG';
import * as App from './src/libs/actions/App';
import * as User from './src/libs/actions/User';
import NetworkConnection from './src/libs/NetworkConnection';
import * as Pusher from './src/libs/Pusher/pusher';
import PusherConnectionManager from './src/libs/PusherConnectionManager';
import * as UserUtils from './src/libs/UserUtils';
import ONYXKEYS from './src/ONYXKEYS';
import ShareExtensionPage from './src/pages/ShareExtensionPage';
// import additionalAppSetup from './src/setup';
import {ShareMenuReactView} from 'react-native-share-menu';
import AttachmentView from './src/components/AttachmentView';
import CONST from './src/CONST';
import * as Report from './src/libs/actions/Report';
import * as Metrics from './src/libs/Metrics';
import styles from './src/styles/styles';

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

const Message = withLocalize((props) => {
    const toDetails = props.route.params.option;
    const [attachment, setAttachment] = useState();
    const [message, setMessage] = useState('');

    useEffect(() => {
        ShareMenuReactView.data().then(({data}) => setAttachment(data[0]));
    }, []);

    return (
        <View style={{backgroundColor: '#07271F', flex: 1}}>
            <Pressable
                onPress={props.navigation.goBack}
                style={{padding: 24}}
            >
                <Text style={{color: '#E7ECE9', fontWeight: 'bold'}}>{props.translate('common.goBack')}</Text>
            </Pressable>
            <Text style={[styles.textLabelSupporting, {paddingLeft: 24}]}>{props.translate('common.to')}</Text>
            <MenuItem
                title={toDetails.text}
                description={toDetails.alternateText}
                icon={UserUtils.getAvatar(lodashGet(toDetails, 'avatar', ''), lodashGet(toDetails, 'login', ''))}
                iconHeight={40}
                iconWidth={40}
                shouldShowRightIcon
            />
            <View style={{padding: 24}}>
                <TextInput
                    inputID="addAMessage"
                    name="addAMessage"
                    label={props.translate('moneyRequestConfirmationList.whatsItFor')}
                    onChangeText={setMessage}
                    value={message}
                />
            </View>
            <View style={{padding: 24}}>
                <Text style={styles.textLabelSupporting}>{props.translate('common.share')}</Text>
                {attachment && (
                    <View style={{borderRadius: 8, height: 200, marginTop: 8, overflow: 'hidden', width: '100%'}}>
                        <AttachmentView source={attachment.data} />
                    </View>
                )}
            </View>
            <View style={{padding: 24}}>
                <Button
                    success
                    pressOnEnter
                    text={props.translate('common.share')}
                    onPress={() => {
                        const name = attachment.data.split('/').pop();
                        const source = attachment.data;
                        Report.addAttachment(toDetails.reportID, {name, source, type: attachment.mimeType, uri: source}, message);
                    }}
                />
            </View>
        </View>
    );
});

Message.propTypes = {
    ...withLocalizePropTypes,
};
Message.defaultProps = {};

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
                            name="Home"
                            component={ShareExtensionPage}
                        />
                        <Stack.Screen
                            name="Message"
                            component={Message}
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
