/* eslint-disable react/destructuring-assignment */
import React, {useEffect, useState} from 'react';
import {View, Platform, Button} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import SignInPage from '../../../pages/signin/SignInPage';
import SetPasswordPage from '../../../pages/SetPasswordPage';
import ValidateLoginPage from '../../../pages/ValidateLoginPage';
import LogInWithShortLivedAuthTokenPage from '../../../pages/LogInWithShortLivedAuthTokenPage';
import SCREENS from '../../../SCREENS';
import defaultScreenOptions from './defaultScreenOptions';
import Text from '../../../components/Text';
import AppleSignInScript from '../../../pages/signin/AppleSignInScript';
import FullScreenLoadingIndicator from '../../../components/FullscreenLoadingIndicator';

const RootStack = createStackNavigator();
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const AppleAuthScreen = () => {
    useEffect(() => {
        const clientId = 'com.infinitered.expensify.test';
        const redirectURI = 'https://exptest.ngrok.io/appleauth';
        const scope = 'name email';
        const state = '';
        const script = document.createElement('script');
        script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
        script.async = true;
        script.onload = () => {
            window.AppleID.auth.init({
                clientId,
                scope,
                redirectURI,
                state,
                usePopup: false,
            });
            console.log('😇calling fn');
            window.AppleID.auth.signIn().then((result) => {
                console.log('got a result', result);

                // window.location.replace('new-expensify://deeplink/siwa/token');
            });
        };

        document.body.appendChild(script);
    }, []);
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            {Platform.OS === 'web' && <AppleSignInScript />}
            <Text>Redirecting you Apple to sign in...</Text>
        </View>
    );
};

const AppleAuthScreenReceiver = ({route}) => {
    const {params: {token}} = route;
    const [showToken, setShowToken] = useState(false);
    useEffect(() => { window.open('new-expensify://settings'); }, []);
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>User has been signed in.</Text>
            <Button onPress={() => setShowToken(!showToken)} title="Show Token" />
            {showToken && (
            <Text>
                TOKEN:
                {' '}
                {token}
            </Text>
            )}
            <Text>Redirecting you back to the app...</Text>
        </View>
    );
};

const PublicScreens = () => (
    <RootStack.Navigator>
        <RootStack.Screen
            name={SCREENS.HOME}
            options={defaultScreenOptions}
            component={SignInPage}
        />
        <RootStack.Screen
            name={SCREENS.TRANSITION_FROM_OLD_DOT}
            options={defaultScreenOptions}
            component={LogInWithShortLivedAuthTokenPage}
        />
        <RootStack.Screen
            name="ValidateLogin"
            options={defaultScreenOptions}
            component={ValidateLoginPage}
        />
        <RootStack.Screen
            name="SetPassword"
            options={defaultScreenOptions}
            component={SetPasswordPage}
        />
        <RootStack.Screen
            name="AppleOAuth"
            options={defaultScreenOptions}
            component={AppleAuthScreen}
        />
        <RootStack.Screen
            name="AppleOAuthReceiver"
            options={defaultScreenOptions}
            component={AppleAuthScreenReceiver}
        />
    </RootStack.Navigator>
);

PublicScreens.displayName = 'PublicScreens';
export default PublicScreens;
