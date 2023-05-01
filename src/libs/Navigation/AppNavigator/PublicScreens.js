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
import AppleSignInScript from '../../../pages/signin/AppleSignInScript';
import FullScreenLoadingIndicator from '../../../components/FullscreenLoadingIndicator';
import GoogleSignInButton from '../../signInWithGoogle';

const RootStack = createStackNavigator();

const AppleAuthScreen = () => (
    <View style={{
        height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center',
    }}
    >
        <AppleSignInScript />
    </View>
);

const GoogleAuthScreen = () => {
    const [expensifyLoginResponse, setExpensifyLoginResponse] = useState(undefined);
    const onCredentialResponse = useCallback(({credential}) => {
        console.log('CREDENTIAL', credential);

        setExpensifyLoginResponse(true);

        // Expensify API call
        // Session.beginGoogleSignIn(credential);
        //
    }, []);

    const webLink = useCallback(() => {

    }, []);

    useEffect(() => {
        window.open('new-expensify://foo/settings');
    }, [expensifyLoginResponse]);

    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            {expensifyLoginResponse ? (
                <>
                    <Text>Click "Open Expensify" to open the desktop app.</Text>
                    <Text onPress={webLink}>You can also use Expensify in the web browser.</Text>
                </>
            ) : (
                <>
                    <Text>Click the button below to continue signing in with Google</Text>
                    <GoogleSignInButton clientId="807764306985-v0oiotjog2tnvge6kcodr39v23na515c.apps.googleusercontent.com" onCredentialResponse={onCredentialResponse} />
                </>
            )}
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
