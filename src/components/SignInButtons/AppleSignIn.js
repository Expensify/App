/* eslint-disable rulesdir/prefer-early-return */
/* eslint-disable rulesdir/display-name-property */
import React from 'react';
import {View} from 'react-native';

const AppleSignIn = () => {
    React.useEffect(() => {
        if (window.AppleID) {
            window.AppleID.auth.init({
                clientId: 'com.chat.expensify.chat',
                scope: 'name email',
                redirectURI: 'https://www.expensify.com/partners/apple/loginCallback',
                state: 'state',
                usePopup: true,
            });
        }
    }, []);

    return (
        <View style={{
            width: 48, height: 48, padding: 4, backgroundColor: 'blue',
        }}
        >
            <div
                style={{fontSize: '0'}}
                id="appleid-signin"
                data-mode="logo-only"
                data-color="white"
                data-border-radius="50"
                data-border="false"
                data-border-color="white"
                data-width="40"
                data-height="40"
                data-type="sign in"
            />
        </View>

    );
};

export default AppleSignIn;
