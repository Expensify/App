// import { AppRegistry, View, Text } from "react-native";
//
// function MyShareComponent() {
//   return <View><Text>Rendered share component!</Text></View>
// }
//
// AppRegistry.registerComponent(
//   "ShareMenuModuleComponent",
//   () => MyShareComponent
// );
import {useEffect} from 'react';
import {AppRegistry, Pressable, ScrollView, Text, View} from 'react-native';
import 'react-native-gesture-handler';
import Onyx, {withOnyx} from 'react-native-onyx';
import CONFIG from './src/CONFIG';
import ONYXKEYS from './src/ONYXKEYS';
import ExpensifyWordmark from './src/components/ExpensifyWordmark';
import NetworkConnection from './src/libs/NetworkConnection';
import * as Pusher from './src/libs/Pusher/pusher';
import PusherConnectionManager from './src/libs/PusherConnectionManager';
import * as App from './src/libs/actions/App';
import * as User from './src/libs/actions/User';
import styles from './src/styles/styles';

const config = {
    keys: ONYXKEYS,
};

Onyx.init(config);

function BasicOnyxComponent(props) {
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
        <ScrollView
            contentContainerStyle={{padding: 24}}
            style={{flex: 1}}
        >
            <Pressable onPress={() => App.setLocale(props.preferredLocale === 'en' ? 'es' : 'en')}>
                <ExpensifyWordmark style={styles.anonymousRoomFooterLogo} />
            </Pressable>
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
                            {'\n\n'}
                        </Text>
                    ) : (
                        Object.entries(json).map(([key, value]) => (
                            <Text
                                key={key}
                                style={{color: '#E7ECE9', fontWeight: 'normal'}}
                            >
                                {key}: {JSON.stringify(value)}
                                {'\n\n'}
                            </Text>
                        ))
                    )}
                </Text>
            ))}
        </ScrollView>
    );
}

const WithHOC = withOnyx({
    account: {key: ONYXKEYS.ACCOUNT},
    preferredLocale: {key: ONYXKEYS.NVP_PREFERRED_LOCALE},
    session: {key: ONYXKEYS.SESSION},
})(BasicOnyxComponent);

function TestEntry() {
    return (
        <View style={{flex: 1, backgroundColor: '#07271F'}}>
            <WithHOC />
        </View>
    );
}

AppRegistry.registerComponent('ShareMenuModuleComponent', () => TestEntry);
