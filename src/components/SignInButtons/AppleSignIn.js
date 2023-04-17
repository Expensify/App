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
        <View style={{width: 60, height: 60, backgroundColor: 'blue'}}>
            <div id="appleid-signin" data-mode="logo-only" data-color="white" data-border-radius="50" data-height="40" data-width="40" />
        </View>
    );
};

export default AppleSignIn;
