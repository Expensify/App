import React, {useEffect} from 'react';
import {View, Platform} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import SignInPage from '../../../pages/signin/SignInPage';
import SetPasswordPage from '../../../pages/SetPasswordPage';
import ValidateLoginPage from '../../../pages/ValidateLoginPage';
import LogInWithShortLivedAuthTokenPage from '../../../pages/LogInWithShortLivedAuthTokenPage';
import SCREENS from '../../../SCREENS';
import defaultScreenOptions from './defaultScreenOptions';
import Text from '../../../components/Text';
import AppleSignInScript from '../../../pages/signin/AppleSignInScript';

const RootStack = createStackNavigator();

const AppleAuthScreen = () => {
    useEffect(() => {
        const clientId = 'com.infinitered.expensify.test';
        const redirectURI = 'https://exptest.serveo.net/appleauth';
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
                usePopup: true,
            });
            console.log('😇calling fn');
            window.AppleID.auth.signIn().then((result) => {
                console.log('got a result', result);
                window.open(`new-expensify://signintoken/appleauthtoken/${result.authorization.id_token}`);
            });
        };

        document.body.appendChild(script);
    }, []);
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            {Platform.OS === 'web' && <AppleSignInScript />}
            <Text>Redirecting you to sign in...</Text>
        </View>
    );
};

const AppleAuthScreenReceiver = ({route}) => {
    const {params: {token}} = route;
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>
                TOKEN:
                {' '}
                {token}
            </Text>
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
            name="Concierge"
            options={defaultScreenOptions}
            component={ConciergePage}
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
