import React from 'react';
import {
    DefaultClientFailureScreen,
    DefaultServerFailureScreen,
    DefaultSuccessScreen,
    NoEligibleMethodsFailureScreen,
    UnsupportedDeviceFailureScreen,
} from '@components/MultifactorAuthentication/components/OutcomeScreen';
import type {MultifactorAuthenticationDefaultUIConfig, MultifactorAuthenticationScenarioCustomConfig} from '@components/MultifactorAuthentication/config/types';
import type {MultifactorAuthenticationCallbackResponse} from '@libs/MultifactorAuthentication/Biometrics/types';
import CONST from '@src/CONST';

const DEFAULT_CONFIG = {
    MODALS: {
        cancelConfirmation: {
            title: 'common.areYouSure',
            description: 'multifactorAuthentication.biometricsTest.areYouSureToReject',
            confirmButtonText: 'multifactorAuthentication.biometricsTest.rejectAuthentication',
            cancelButtonText: 'common.cancel',
        },
    },
    successScreen: <DefaultSuccessScreen />,
    defaultClientFailureScreen: <DefaultClientFailureScreen />,
    defaultServerFailureScreen: <DefaultServerFailureScreen />,
    failureScreens: {
        [CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.NO_ELIGIBLE_METHODS]: <NoEligibleMethodsFailureScreen />,
        [CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.UNSUPPORTED_DEVICE]: <UnsupportedDeviceFailureScreen />,
    },
} as const satisfies MultifactorAuthenticationDefaultUIConfig;

const defaultCallback = (): Promise<MultifactorAuthenticationCallbackResponse> => Promise.resolve(CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN);

function customConfig<const T extends MultifactorAuthenticationScenarioCustomConfig<never>>(config: T) {
    const MODALS = {
        ...DEFAULT_CONFIG.MODALS,
        ...config.MODALS,
        cancelConfirmation: {
            ...DEFAULT_CONFIG.MODALS.cancelConfirmation,
            ...config.MODALS?.cancelConfirmation,
        },
    } as const;

    return {
        ...DEFAULT_CONFIG,
        ...config,
        MODALS,
        callback: config.callback ?? defaultCallback,
        successScreen: config.successScreen ?? DEFAULT_CONFIG.successScreen,
        defaultClientFailureScreen: config.defaultClientFailureScreen ?? DEFAULT_CONFIG.defaultClientFailureScreen,
        defaultServerFailureScreen: config.defaultServerFailureScreen ?? DEFAULT_CONFIG.defaultServerFailureScreen,
        failureScreens: {...DEFAULT_CONFIG.failureScreens, ...config.failureScreens},
    } as const;
}

export default DEFAULT_CONFIG;
export {customConfig};
