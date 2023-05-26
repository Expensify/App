import React from 'react';
import appleAuth from '@invertase/react-native-apple-authentication';
import Log from '../../../libs/Log';
import ButtonBase from '../ButtonBase';
import AppleLogoIcon from '../../../../assets/images/signIn/apple-logo.svg';
import * as Session from '../../../libs/actions/Session';

function appleSignInRequest() {
    return appleAuth
        .performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,

            // FULL_NAME must come first, see https://github.com/invertase/react-native-apple-authentication/issues/293
            requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
        })
        .then((response) =>
            appleAuth.getCredentialStateForUser(response.user).then((credentialState) => {
                if (credentialState !== appleAuth.State.AUTHORIZED) {
                    Log.error('Authentication failed. Original response: ', response);
                    throw new Error('Authentication failed');
                }
                return response.identityToken;
            }),
        );
}

const AppleSignIn = () => {
    const handleSignIn = () => {
        appleSignInRequest()
            .then((token) => Session.beginAppleSignIn(token))
            .catch((e) => {
                Log.error('Apple authentication failed', e);
            });
    };
    return (
        <ButtonBase
            onPress={handleSignIn}
            icon={<AppleLogoIcon />}
        />
    );
};

AppleSignIn.displayName = 'AppleSignIn';

export default AppleSignIn;
