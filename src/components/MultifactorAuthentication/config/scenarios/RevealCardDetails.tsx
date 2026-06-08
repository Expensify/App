import React from 'react';
import createScreenWithDefaults from '@components/MultifactorAuthentication/components/OutcomeScreen/createScreenWithDefaults';
import {DefaultClientFailureScreen, DefaultServerFailureScreen} from '@components/MultifactorAuthentication/components/OutcomeScreen/FailureScreen/defaultScreens';
import type {
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioCustomConfig,
} from '@components/MultifactorAuthentication/config/types';
import {revealCardDetailsWithSCA} from '@libs/actions/MultifactorAuthentication';
import {setRevealedVirtualCardDetails} from '@libs/RevealedCardSecretsStore';
import CONST from '@src/CONST';

/**
 * Payload type for the REVEAL_CARD_DETAILS scenario.
 * Contains the cardID for the virtual card whose details are being revealed.
 */
type Payload = {
    cardID: string;
};

/**
 * Type guard to verify the payload is a RevealCardDetails payload.
 */
function isRevealCardDetailsPayload(payload: MultifactorAuthenticationScenarioAdditionalParams<MultifactorAuthenticationScenario> | undefined): payload is Payload {
    return !!payload && 'cardID' in payload;
}

const ClientFailureScreen = createScreenWithDefaults(
    DefaultClientFailureScreen,
    {
        subtitle: 'multifactorAuthentication.revealCardDetail.couldNotReveal',
    },
    'ClientFailureScreen',
);

const ServerFailureScreen = createScreenWithDefaults(
    DefaultServerFailureScreen,
    {
        subtitle: 'multifactorAuthentication.revealCardDetail.couldNotReveal',
    },
    'ServerFailureScreen',
);

/**
 * Configuration for the REVEAL_CARD_DETAILS multifactor authentication scenario.
 * Used by UK/EU virtual cardholders to reveal their card details (PAN/expiration/CVV)
 * via Strong Customer Authentication instead of the email magic-code flow.
 *
 * Callback behavior:
 * - Success: Store the revealed details in RevealedCardSecretsStore and return SKIP_OUTCOME_SCREEN
 * - Authentication failure: Return SHOW_OUTCOME_SCREEN to show failure screen
 */
export default {
    allowedAuthenticationMethods: [CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS_HSM, CONST.MULTIFACTOR_AUTHENTICATION.TYPE.PASSKEYS],
    action: revealCardDetailsWithSCA,
    callback: async (isSuccessful, callbackInput, payload) => {
        if (isSuccessful && isRevealCardDetailsPayload(payload)) {
            const pan = typeof callbackInput.body?.pan === 'string' ? callbackInput.body.pan : '';
            const expiration = typeof callbackInput.body?.expiration === 'string' ? callbackInput.body.expiration : '';
            const cvv = typeof callbackInput.body?.cvv === 'string' ? callbackInput.body.cvv : '';
            setRevealedVirtualCardDetails(payload.cardID, {pan, expiration, cvv});
            return CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SKIP_OUTCOME_SCREEN;
        }

        return CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN;
    },

    defaultClientFailureScreen: <ClientFailureScreen />,
    defaultServerFailureScreen: <ServerFailureScreen />,
} as const satisfies MultifactorAuthenticationScenarioCustomConfig<Payload>;

export type {Payload};
