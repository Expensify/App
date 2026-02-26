import React from 'react';
import AuthenticationMethodDescription from '@components/MultifactorAuthentication/components/AuthenticationMethodDescription';
import {DefaultSuccessScreen} from '@components/MultifactorAuthentication/components/OutcomeScreen';
import type {MultifactorAuthenticationScenarioCustomConfig} from '@components/MultifactorAuthentication/config/types';
import {troubleshootMultifactorAuthentication} from '@userActions/MultifactorAuthentication';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

export default {
    allowedAuthenticationMethods: [CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS],
    action: troubleshootMultifactorAuthentication,
    screen: SCREENS.MULTIFACTOR_AUTHENTICATION.BIOMETRICS_TEST,
    pure: true,
    successScreen: <DefaultSuccessScreen customSubtitle={<AuthenticationMethodDescription />} />,
} as const satisfies MultifactorAuthenticationScenarioCustomConfig;
