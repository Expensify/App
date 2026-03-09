import React from 'react';
import {useMultifactorAuthenticationState} from '@components/MultifactorAuthentication/Context';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {SECURE_STORE_VALUES} from '@libs/MultifactorAuthentication/Biometrics/SecureStore';
import type {AuthTypeName} from '@libs/MultifactorAuthentication/Biometrics/types';
import type {TranslationPaths} from '@src/languages/types';

/* eslint-disable @typescript-eslint/naming-convention */
const AUTH_TYPE_TRANSLATION_KEY = {
    Unknown: 'multifactorAuthentication.biometricsTest.authType.unknown',
    None: 'multifactorAuthentication.biometricsTest.authType.none',
    Credentials: 'multifactorAuthentication.biometricsTest.authType.credentials',
    Biometrics: 'multifactorAuthentication.biometricsTest.authType.biometrics',
    'Face ID': 'multifactorAuthentication.biometricsTest.authType.faceId',
    'Touch ID': 'multifactorAuthentication.biometricsTest.authType.touchId',
    'Optic ID': 'multifactorAuthentication.biometricsTest.authType.opticId',
} as const satisfies Record<AuthTypeName, TranslationPaths>;
/* eslint-enable @typescript-eslint/naming-convention */

function AuthenticationMethodDescription() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {authenticationMethod} = useMultifactorAuthenticationState();

    const authType = translate(AUTH_TYPE_TRANSLATION_KEY[authenticationMethod?.name ?? SECURE_STORE_VALUES.AUTH_TYPE.UNKNOWN.NAME]);

    return <Text style={[styles.textAlignCenter, styles.textSupporting]}>{translate('multifactorAuthentication.biometricsTest.successfullyAuthenticatedUsing', {authType})}</Text>;
}

AuthenticationMethodDescription.displayName = 'AuthenticationMethodDescription';

export default AuthenticationMethodDescription;
