import React from 'react';
import {DefaultSuccessScreen} from '@components/MultifactorAuthentication/components/OutcomeScreen';
import createScreenWithDefaults from '@components/MultifactorAuthentication/components/OutcomeScreen/createScreenWithDefaults';
import {DefaultClientFailureScreen, DefaultServerFailureScreen} from '@components/MultifactorAuthentication/components/OutcomeScreen/FailureScreen/defaultScreens';
import type {MultifactorAuthenticationScenarioCustomConfig} from '@components/MultifactorAuthentication/config/types';
import {changePINForCard} from '@libs/actions/MultifactorAuthentication';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';

/**
 * Payload type for the CHANGE_PIN scenario.
 * Contains the new PIN and cardID for the card whose PIN is being changed.
 */
type Payload = {
    pin: string;
    cardID: string;
};

const ClientFailureScreen = createScreenWithDefaults(
    DefaultClientFailureScreen,
    {
        subtitle: 'multifactorAuthentication.changePin.didNotChange',
    },
    'ClientFailureScreen',
);

const ServerFailureScreen = createScreenWithDefaults(
    DefaultServerFailureScreen,
    {
        subtitle: 'multifactorAuthentication.changePin.didNotChange',
    },
    'ServerFailureScreen',
);

const ChangePINSuccessScreen = createScreenWithDefaults(
    DefaultSuccessScreen,
    {
        headerTitle: 'cardPage.pinChangedHeader',
        title: 'cardPage.pinChanged',
        subtitle: 'cardPage.pinChangedDescription',
        illustration: 'Fireworks',
    },
    'ChangePINSuccessScreen',
);

/**
 * Configuration for the CHANGE_PIN multifactor authentication scenario.
 * This scenario is used when a UK/EU cardholder changes the PIN of their physical card.
 */
export default {
    allowedAuthenticationMethods: [CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS_HSM, CONST.MULTIFACTOR_AUTHENTICATION.TYPE.PASSKEYS],
    action: changePINForCard,
    callback: async () => {
        // ChangePINPage is in the RHP and the outcome screen renders in the sibling MFA modal navigator.
        // Pop it first so closing the modal returns to card details instead of the stale set-PIN screen.
        Navigation.goBack();
        return CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN;
    },
    successScreen: <ChangePINSuccessScreen />,
    defaultClientFailureScreen: <ClientFailureScreen />,
    defaultServerFailureScreen: <ServerFailureScreen />,
} as const satisfies MultifactorAuthenticationScenarioCustomConfig<Payload>;

export type {Payload};
