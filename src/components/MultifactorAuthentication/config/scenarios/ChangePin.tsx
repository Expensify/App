import React from 'react';
import {DefaultSuccessScreen} from '@components/MultifactorAuthentication/components/OutcomeScreen';
import createScreenWithDefaults from '@components/MultifactorAuthentication/components/OutcomeScreen/createScreenWithDefaults';
import {DefaultClientFailureScreen} from '@components/MultifactorAuthentication/components/OutcomeScreen/FailureScreen/defaultScreens';
import type {
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioCustomConfig,
} from '@components/MultifactorAuthentication/config/types';
import {changePINForCard} from '@libs/actions/MultifactorAuthentication';
import CONST from '@src/CONST';

/**
 * Payload type for the CHANGE_PIN scenario.
 * Contains the new PIN and cardID for the card whose PIN is being changed.
 */
type Payload = {
    pin: string;
    cardID: string;
};

/**
 * Type guard to verify the payload is a ChangePin payload.
 */
function isChangePinPayload(payload: MultifactorAuthenticationScenarioAdditionalParams<MultifactorAuthenticationScenario> | undefined): payload is Payload {
    return !!payload && 'cardID' in payload && 'pin' in payload;
}

const AuthenticationCanceledFailureScreen = createScreenWithDefaults(
    DefaultClientFailureScreen,
    {
        subtitle: 'multifactorAuthentication.changePin.authenticationCanceled',
    },
    'AuthenticationCanceledFailureScreen',
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
 *
 * Callback behavior:
 * - Success: Navigate to ExpensifyCardPage and return SKIP_OUTCOME_SCREEN
 * - Authentication failure: Return SHOW_OUTCOME_SCREEN to show failure screen
 */
export default {
    allowedAuthenticationMethods: [CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS],
    action: changePINForCard,

    callback: async (isSuccessful, _callbackInput, payload) => {
        if (isSuccessful && isChangePinPayload(payload)) {
            return CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN;
        }

        return CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN;
    },

    successScreen: <ChangePINSuccessScreen />,

    failureScreens: {
        [CONST.MULTIFACTOR_AUTHENTICATION.REASON.EXPO.CANCELED]: <AuthenticationCanceledFailureScreen />,
    },
} as const satisfies MultifactorAuthenticationScenarioCustomConfig<Payload>;

export type {Payload};
