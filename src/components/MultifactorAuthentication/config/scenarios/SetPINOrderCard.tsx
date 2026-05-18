import React from 'react';
import createScreenWithDefaults from '@components/MultifactorAuthentication/components/OutcomeScreen/createScreenWithDefaults';
import {DefaultClientFailureScreen, DefaultServerFailureScreen} from '@components/MultifactorAuthentication/components/OutcomeScreen/FailureScreen/defaultScreens';
import type {
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioCustomConfig,
} from '@components/MultifactorAuthentication/config/types';
import {clearDraftValues} from '@libs/actions/FormActions';
import {setPersonalDetailsAndShipExpensifyCardsWithPIN} from '@libs/actions/MultifactorAuthentication';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

/**
 * Payload type for the SET_PIN_ORDER_CARD scenario.
 * Contains personal details and PIN required for UK/EU card ordering.
 */
type Payload = {
    legalFirstName: string;
    legalLastName: string;
    phoneNumber: string;
    addressCity: string;
    addressStreet: string;
    addressStreet2: string;
    addressZip: string;
    addressCountry: string;
    addressProvince: string;
    dob: string;
    pin: string;
    cardID: string;
};

/**
 * Type guard to verify the payload is a SetPINOrderCard payload.
 */
function isSetPINOrderCardPayload(payload: MultifactorAuthenticationScenarioAdditionalParams<MultifactorAuthenticationScenario> | undefined): payload is Payload {
    return !!payload && 'cardID' in payload && 'pin' in payload;
}

const ClientFailureScreen = createScreenWithDefaults(
    DefaultClientFailureScreen,
    {
        subtitle: 'multifactorAuthentication.setPin.didNotShipCard',
    },
    'ClientFailureScreen',
);

const ServerFailureScreen = createScreenWithDefaults(
    DefaultServerFailureScreen,
    {
        subtitle: 'multifactorAuthentication.setPin.didNotShipCard',
    },
    'ServerFailureScreen',
);

/**
 * Configuration for the SET_PIN_ORDER_CARD multifactor authentication scenario.
 * This scenario is used when a UK/EU cardholder sets their PIN during the card ordering process.
 *
 * Callback behavior per design doc:
 * - Success: Navigate to ExpensifyCardPage and return SKIP_OUTCOME_SCREEN
 * - Invalid PIN/personal details error: Display error in UI and return SKIP_OUTCOME_SCREEN
 * - Authentication failure: Return SHOW_OUTCOME_SCREEN to show failure screen
 */
export default {
    allowedAuthenticationMethods: [CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS_HSM, CONST.MULTIFACTOR_AUTHENTICATION.TYPE.PASSKEYS],
    action: setPersonalDetailsAndShipExpensifyCardsWithPIN,

    callback: async (isSuccessful, _callbackInput, payload) => {
        if (isSuccessful && isSetPINOrderCardPayload(payload)) {
            clearDraftValues(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM);
            Navigation.closeRHPFlow();
            Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(String(payload.cardID)));
            return CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SKIP_OUTCOME_SCREEN;
        }

        return CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN;
    },

    defaultClientFailureScreen: <ClientFailureScreen />,
    defaultServerFailureScreen: <ServerFailureScreen />,
} as const satisfies MultifactorAuthenticationScenarioCustomConfig<Payload>;

export type {Payload};
