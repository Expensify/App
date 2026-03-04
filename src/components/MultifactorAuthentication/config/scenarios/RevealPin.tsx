import React from 'react';
import createScreenWithDefaults from '@components/MultifactorAuthentication/components/OutcomeScreen/createScreenWithDefaults';
import {DefaultClientFailureScreen} from '@components/MultifactorAuthentication/components/OutcomeScreen/FailureScreen/defaultScreens';
import type {
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioCustomConfig,
} from '@components/MultifactorAuthentication/config/types';
import {revealPINForCard} from '@libs/actions/MultifactorAuthentication';
import {setRevealedPIN} from '@libs/CardPINStore';
import CONST from '@src/CONST';

/**
 * Payload type for the REVEAL_PIN scenario.
 * Contains the cardID for the card whose PIN is being revealed.
 */
type Payload = {
    cardID: string;
};

/**
 * Type guard to verify the payload is a RevealPin payload.
 */
function isRevealPinPayload(payload: MultifactorAuthenticationScenarioAdditionalParams<MultifactorAuthenticationScenario> | undefined): payload is Payload {
    return !!payload && 'cardID' in payload;
}

const AuthenticationCanceledFailureScreen = createScreenWithDefaults(
    DefaultClientFailureScreen,
    {
        subtitle: 'multifactorAuthentication.revealPin.authenticationCanceled',
    },
    'AuthenticationCanceledFailureScreen',
);

/**
 * Configuration for the REVEAL_PIN multifactor authentication scenario.
 * This scenario is used when a UK/EU cardholder reveals the PIN of their physical card.
 *
 * Callback behavior:
 * - Success: Store the revealed PIN in CardPINStore and return SKIP_OUTCOME_SCREEN
 * - Authentication failure: Return SHOW_OUTCOME_SCREEN to show failure screen
 */
export default {
    allowedAuthenticationMethods: [CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS],
    action: revealPINForCard,

    callback: async (isSuccessful, callbackInput, payload) => {
        if (isSuccessful && isRevealPinPayload(payload)) {
            const pin = callbackInput.body?.pin as string | undefined;
            if (pin) {
                setRevealedPIN(payload.cardID, pin);
            }
            return CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SKIP_OUTCOME_SCREEN;
        }

        return CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN;
    },

    failureScreens: {
        [CONST.MULTIFACTOR_AUTHENTICATION.REASON.EXPO.CANCELED]: <AuthenticationCanceledFailureScreen />,
    },
} as const satisfies MultifactorAuthenticationScenarioCustomConfig<Payload>;

export type {Payload};
