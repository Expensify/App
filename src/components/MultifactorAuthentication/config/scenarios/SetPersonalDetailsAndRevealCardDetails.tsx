import createScreenWithDefaults from '@components/MultifactorAuthentication/components/OutcomeScreen/createScreenWithDefaults';
import {DefaultClientFailureScreen, DefaultServerFailureScreen} from '@components/MultifactorAuthentication/components/OutcomeScreen/FailureScreen/defaultScreens';
import type {
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioCustomConfig,
} from '@components/MultifactorAuthentication/config/types';

import {clearDraftValues} from '@libs/actions/FormActions';
import {setPersonalDetailsAndRevealExpensifyCardWithSCA} from '@libs/actions/MultifactorAuthentication';
import Navigation from '@libs/Navigation/Navigation';
import {setRevealedVirtualCardDetails} from '@libs/RevealedCardSecretsStore';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';

/**
 * Payload type for the SET_PERSONAL_DETAILS_AND_REVEAL_CARD_DETAILS scenario.
 * Submits the user's personal details and reveals a UK/EU virtual card's PAN/expiration/CVV
 * via Strong Customer Authentication in a single backend call.
 */
type Payload = {
    cardID: string;
    legalFirstName: string;
    legalLastName: string;
    phoneNumber: string;
    addressCity: string;
    addressStreet: string;
    addressStreet2: string;
    addressZip: string;
    addressCountry: string;
    addressState: string;
    addressProvince: string;
    dob: string;
    /**
     * True when the user just filled out the missing-personal-details form and we need to
     * close that RHP and bounce back to the card page. False (or omitted) when the user
     * triggered the reveal directly from the card page — they're already there.
     */
    isFromMissingDetailsFlow?: boolean;
};

/**
 * Type guard to verify the payload is a SetPersonalDetailsAndRevealCardDetails payload.
 */
function isSetPersonalDetailsAndRevealCardDetailsPayload(payload: MultifactorAuthenticationScenarioAdditionalParams<MultifactorAuthenticationScenario> | undefined): payload is Payload {
    return !!payload && 'cardID' in payload && 'legalFirstName' in payload;
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
 * Configuration for the SET_PERSONAL_DETAILS_AND_REVEAL_CARD_DETAILS scenario.
 * Used by UK/EU virtual cardholders who need to submit missing personal details before
 * revealing their card details — both happen in a single SCA-authenticated request.
 */
export default {
    allowedAuthenticationMethods: [CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS_HSM, CONST.MULTIFACTOR_AUTHENTICATION.TYPE.PASSKEYS],
    action: setPersonalDetailsAndRevealExpensifyCardWithSCA,
    callback: async (isSuccessful, callbackInput, payload) => {
        if (isSuccessful && isSetPersonalDetailsAndRevealCardDetailsPayload(payload)) {
            const pan = typeof callbackInput.body?.pan === 'string' ? callbackInput.body.pan : '';
            const expiration = typeof callbackInput.body?.expiration === 'string' ? callbackInput.body.expiration : '';
            const cvv = typeof callbackInput.body?.cvv === 'string' ? callbackInput.body.cvv : '';
            setRevealedVirtualCardDetails(payload.cardID, {pan, expiration, cvv});
            if (payload.isFromMissingDetailsFlow) {
                clearDraftValues(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM);
                Navigation.closeRHPFlow();
                Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(String(payload.cardID)));
            }
            return CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SKIP_OUTCOME_SCREEN;
        }

        return CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN;
    },

    defaultClientFailureScreen: <ClientFailureScreen />,
    defaultServerFailureScreen: <ServerFailureScreen />,
} as const satisfies MultifactorAuthenticationScenarioCustomConfig<Payload>;

export type {Payload};
