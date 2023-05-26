import React from 'react';
import {View} from 'react-native';
import AppleSignIn from '../../../components/SignInButtons/AppleSignIn';

/* Dedicated screen that the desktop app links to on the web app, as Apple/Google
 * sign-in cannot work fully within Electron, so we escape to web and redirect
 * to desktop once we have an Expensify auth token.
 */
function AppleSignInDesktopPage() {
    return (
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
                <AppleSignIn isDesktopFlow />
            </View>
        </View>
    );
}

export default AppleSignInDesktopPage;
