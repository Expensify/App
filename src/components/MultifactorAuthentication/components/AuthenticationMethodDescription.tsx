import React from 'react';
import {useMultifactorAuthenticationState} from '@components/MultifactorAuthentication/Context';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import NATIVE_BIOMETRICS_HSM_VALUES from '@libs/MultifactorAuthentication/NativeBiometricsHSM/VALUES';
import type {AuthTypeName} from '@libs/MultifactorAuthentication/shared/types';
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
    Passkey: 'multifactorAuthentication.biometricsTest.authType.passkey',
} as const satisfies Record<AuthTypeName, TranslationPaths>;
/* eslint-enable @typescript-eslint/naming-convention */

function AuthenticationMethodDescription() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {authenticationMethod} = useMultifactorAuthenticationState();

    const authType = translate(AUTH_TYPE_TRANSLATION_KEY[authenticationMethod?.name ?? NATIVE_BIOMETRICS_HSM_VALUES.AUTH_TYPE.UNKNOWN.NAME]);

    return <Text style={[styles.textAlignCenter, styles.textSupporting]}>{translate('multifactorAuthentication.biometricsTest.successfullyAuthenticatedUsing', authType)}</Text>;
}

AuthenticationMethodDescription.displayName = 'AuthenticationMethodDescription';

export default AuthenticationMethodDescription;
