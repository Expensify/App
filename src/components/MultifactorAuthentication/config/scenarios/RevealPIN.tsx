import React from 'react';
import createScreenWithDefaults from '@components/MultifactorAuthentication/components/OutcomeScreen/createScreenWithDefaults';
import {DefaultClientFailureScreen, DefaultServerFailureScreen} from '@components/MultifactorAuthentication/components/OutcomeScreen/FailureScreen/defaultScreens';
import type {
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioCustomConfig,
} from '@components/MultifactorAuthentication/config/types';
import {revealPINForCard} from '@libs/actions/MultifactorAuthentication';
import {setRevealedPhysicalCardPin} from '@libs/RevealedCardSecretsStore';
import CONST from '@src/CONST';

/**
 * Payload type for the REVEAL_PIN scenario.
 * Contains the cardID for the card whose PIN is being revealed.
 */
type Payload = {
    cardID: string;
};

/**
 * Type guard to verify the payload is a RevealPIN payload.
 */
function isRevealPINPayload(payload: MultifactorAuthenticationScenarioAdditionalParams<MultifactorAuthenticationScenario> | undefined): payload is Payload {
    return !!payload && 'cardID' in payload;
}

const ClientFailureScreen = createScreenWithDefaults(
    DefaultClientFailureScreen,
    {
        subtitle: 'multifactorAuthentication.revealPin.couldNotReveal',
    },
    'ClientFailureScreen',
);

const ServerFailureScreen = createScreenWithDefaults(
    DefaultServerFailureScreen,
    {
        subtitle: 'multifactorAuthentication.revealPin.couldNotReveal',
    },
    'ServerFailureScreen',
);

/**
 * Configuration for the REVEAL_PIN multifactor authentication scenario.
 * This scenario is used when a UK/EU cardholder reveals the PIN of their physical card.
 *
 * Callback behavior:
 * - Success: Store the revealed PIN in RevealedCardSecretsStore and return SKIP_OUTCOME_SCREEN
 * - Authentication failure: Return SHOW_OUTCOME_SCREEN to show failure screen
 */
export default {
    allowedAuthenticationMethods: [CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS_HSM, CONST.MULTIFACTOR_AUTHENTICATION.TYPE.PASSKEYS],
    action: revealPINForCard,
    callback: async (isSuccessful, callbackInput, payload) => {
        if (isSuccessful && isRevealPINPayload(payload)) {
            const pin = typeof callbackInput.body?.pin === 'string' ? callbackInput.body.pin : '';
            setRevealedPhysicalCardPin(payload.cardID, pin);
            return CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SKIP_OUTCOME_SCREEN;
        }

        return CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN;
    },

    defaultClientFailureScreen: <ClientFailureScreen />,
    defaultServerFailureScreen: <ServerFailureScreen />,
} as const satisfies MultifactorAuthenticationScenarioCustomConfig<Payload>;

export type {Payload};
