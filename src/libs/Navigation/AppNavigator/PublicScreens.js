/* eslint-disable react/destructuring-assignment */
import React, {useCallback, useEffect, useState} from 'react';
import {View, Platform, Button} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import SignInPage from '../../../pages/signin/SignInPage';
import SetPasswordPage from '../../../pages/SetPasswordPage';
import ValidateLoginPage from '../../../pages/ValidateLoginPage';
import LogInWithShortLivedAuthTokenPage from '../../../pages/LogInWithShortLivedAuthTokenPage';
import SCREENS from '../../../SCREENS';
import defaultScreenOptions from './defaultScreenOptions';
import Text from '../../../components/Text';
import GoogleSignIn from '../../../components/SignInButtons/GoogleSignIn';
import AppleSignIn from '../../../components/SignInButtons/AppleSignIn';

const RootStack = createStackNavigator();

const AppleAuthScreen = () => (
    <View
        style={{
            height: '100%',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
        }}
    >
        <View
            style={{
                flexDirection: 'row',
                width: '100%',
                justifyContent: 'center',
            }}
        >
            <AppleSignIn />
        </View>
    </View>
);

const GoogleAuthScreen = () => (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <GoogleSignIn id="google-sign-in-desktop" />
    </View>
);

const AppleAuthScreenReceiver = ({route}) => {
    const {
        params: {token},
    } = route;
    const [showToken, setShowToken] = useState(false);
    useEffect(() => {
        window.open('new-expensify://settings');
    }, []);
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
            name="GoogleOAuth"
            options={defaultScreenOptions}
            component={GoogleAuthScreen}
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
