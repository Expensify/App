import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

function AppleSignInScript() {
    const [forceRender, setForceRender] = useState(undefined);
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
                usePopup: true,
            });
            setForceRender(true);
        };

        document.body.appendChild(script);
        document.addEventListener('AppleIDSignInOnSuccess', (event) => {
            //
            // Handle successful response.
            console.log(event.detail.data);
        });

        // Listen for authorization failures.
        document.addEventListener('AppleIDSignInOnFailure', (event) => {
            // Handle error.
            console.log(event.detail.error);
        });
    }, []);

    useEffect(() => { console.log('forceRender:', forceRender); }, [forceRender]);

    return (
        <View style={{width: 40, height: 40, marginRight: 20}}>
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
}

export default AppleSignInScript;
