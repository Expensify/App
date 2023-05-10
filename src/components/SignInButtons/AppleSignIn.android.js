import React from 'react';
import {appleAuthAndroid} from '@invertase/react-native-apple-authentication';
import ButtonBase from './ButtonBase';
import AppleLogoIcon from '../../../assets/images/signIn/apple-logo.svg';
import {beginAppleSignIn} from '../../libs/actions/Session';

function performAppleAuthRequest() {
    appleAuthAndroid.configure({
        clientId: 'com.expensify.expensifylite.AppleSignIn',
        redirectUri: 'https://www.expensify.com/partners/apple/loginCallback',
        responseType: appleAuthAndroid.ResponseType.ALL,
        scope: appleAuthAndroid.Scope.ALL,
    });
    return appleAuthAndroid.signIn()
        .then((response) => { console.log('TOKEN!!!!', response.id_token); beginAppleSignIn({token: response.id_token}); })
        .catch((e) => {
            console.error('Request to sign in with Apple failed. Error: ', e);
            throw e;
        });
}

const AppleSignIn = () => <ButtonBase onPress={performAppleAuthRequest} icon={<AppleLogoIcon />} />;

AppleSignIn.displayName = 'AppleSignIn';

export default AppleSignIn;
