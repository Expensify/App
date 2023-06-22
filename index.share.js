import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {useEffect, useState} from 'react';
import {AppRegistry, Pressable, ScrollView, Text, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Onyx, {withOnyx} from 'react-native-onyx';
// import OnyxProvider from './src/components/OnyxProvider';
// import {SafeAreaProvider} from 'react-native-safe-area-context';
import CONFIG from './src/CONFIG';
import ONYXKEYS from './src/ONYXKEYS';
import ExpensifyWordmark from './src/components/ExpensifyWordmark';
// import SafeArea from './src/components/SafeArea';
// import {KeyboardStateProvider} from './src/components/withKeyboardState';
import ComposeProviders from './src/components/ComposeProviders';
import CustomStatusBar from './src/components/CustomStatusBar';
import HeaderWithCloseButton from './src/components/HeaderWithCloseButton';
import OptionsSelector from './src/components/OptionsSelector';
import withLocalize, {LocaleContextProvider} from './src/components/withLocalize';
import {WindowDimensionsProvider} from './src/components/withWindowDimensions';
import NetworkConnection from './src/libs/NetworkConnection';
import * as Pusher from './src/libs/Pusher/pusher';
import PusherConnectionManager from './src/libs/PusherConnectionManager';
import * as App from './src/libs/actions/App';
import * as User from './src/libs/actions/User';
import compose from './src/libs/compose';
import styles from './src/styles/styles';

Onyx.init({keys: ONYXKEYS});

const Home = compose(
    withLocalize,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
        personalDetails: {key: ONYXKEYS.PERSONAL_DETAILS},
        preferredLocale: {key: ONYXKEYS.NVP_PREFERRED_LOCALE},
        session: {key: ONYXKEYS.SESSION},
    }),
)(function HomePage(props) {
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

    const [searchValue, setSearchValue] = useState();

    return (
        <View style={{backgroundColor: '#07271F', flex: 1}}>
            <HeaderWithCloseButton
                title={props.translate('common.share')}
                onCloseButtonPress={() => console.log('close share extension')}
            />
            <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                <OptionsSelector
                    sections={[]}
                    value={searchValue}
                    // onSelectRow={this.selectReport}
                    onChangeText={setSearchValue}
                    // headerMessage={this.state.headerMessage}
                    hideSectionHeaders
                    showTitleTooltip
                    // shouldShowOptions={didScreenTransitionEnd && isOptionsDataReady}
                    textInputLabel={props.translate('optionsSelector.nameEmailOrPhoneNumber')}
                    // onLayout={this.searchRendered}
                    // safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                />
            </View>
            <View style={{padding: 48}} />
            <ScrollView contentContainerStyle={{padding: 24}}>
                <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
                    <Pressable onPress={() => App.setLocale(props.preferredLocale === 'en' ? 'es' : 'en')}>
                        <ExpensifyWordmark style={styles.anonymousRoomFooterLogo} />
                    </Pressable>
                    <Pressable onPress={() => props.navigation.navigate('Message')}>
                        <Text style={{color: '#E7ECE9', fontWeight: 'bold'}}>{props.translate('common.next')}</Text>
                    </Pressable>
                </View>
                <View style={{padding: 24}} />
                {Object.entries(props).map(([prop, json]) => (
                    <Text
                        key={prop}
                        style={{color: '#E7ECE9', fontWeight: 'bold'}}
                    >
                        {prop.toUpperCase()}
                        {'\n\n'}
                        {typeof json === 'string' ? (
                            <Text style={{color: '#E7ECE9', fontWeight: 'normal'}}>
                                {json}
                                {'\n'}
                            </Text>
                        ) : (
                            Object.entries(json).map(([key, value]) => (
                                <Text
                                    key={key}
                                    style={{color: '#E7ECE9', fontWeight: 'normal'}}
                                >
                                    {key}: {JSON.stringify(value)}
                                    {'\n'}
                                </Text>
                            ))
                        )}
                    </Text>
                ))}
            </ScrollView>
        </View>
    );
});

const Message = compose(withLocalize)(function MessagePage(props) {
    return (
        <Pressable
            onPress={props.navigation.goBack}
            style={{alignItems: 'center', backgroundColor: '#07271F', flex: 1, justifyContent: 'center'}}
        >
            <Text style={{color: '#E7ECE9', fontWeight: 'bold'}}>{props.translate('common.goBack')}</Text>
        </Pressable>
    );
});

const Stack = createStackNavigator();

const ShareExtension = () => (
    <GestureHandlerRootView style={{flex: 1}}>
        <ComposeProviders
            components={[
                // OnyxProvider,
                // SafeAreaProvider,
                // PortalProvider,
                // SafeArea,
                LocaleContextProvider,
                WindowDimensionsProvider,
                // KeyboardStateProvider,
                // PickerStateProvider,
            ]}
        >
            <CustomStatusBar />
            {/* this appears to require firebase */}
            {/* <ErrorBoundary errorMessage="NewExpensify crash caught by error boundary"> */}
            <NavigationContainer>
                <Stack.Navigator screenOptions={{headerShown: false}}>
                    <Stack.Screen
                        name="Home"
                        component={Home}
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

AppRegistry.registerComponent('ShareMenuModuleComponent', () => ShareExtension);
