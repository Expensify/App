import React from 'react';
import createScreenWithDefaults from '@components/MultifactorAuthentication/components/OutcomeScreen/createScreenWithDefaults';
import DefaultSuccessScreen from '@components/MultifactorAuthentication/components/OutcomeScreen/SuccessScreen/defaultScreens';
import type {
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioCustomConfig,
} from '@components/MultifactorAuthentication/config/types';
import {unblockCardPIN} from '@libs/actions/MultifactorAuthentication';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

/**
 * Payload type for the UNBLOCK_CARD_PIN scenario.
 * Contains cardID and isOfflinePINMarket flag to determine success experience.
 */
type Payload = {
    cardID: string;
    isOfflinePINMarket: boolean;
};

/**
 * Type guard to verify the payload is an UnblockCardPIN payload.
 */
function isUnblockCardPINPayload(payload: MultifactorAuthenticationScenarioAdditionalParams<MultifactorAuthenticationScenario> | undefined): payload is Payload {
    return !!payload && 'cardID' in payload && 'isOfflinePINMarket' in payload;
}

const CardUnlockedSuccessScreen = createScreenWithDefaults(
    DefaultSuccessScreen,
    {
        title: 'multifactorAuthentication.unblockCardPIN.cardUnlockedTitle',
        headerTitle: 'multifactorAuthentication.unblockCardPIN.cardUnlockedHeader',
        subtitle: 'multifactorAuthentication.unblockCardPIN.cardUnlockedSubtitle',
        illustration: 'Fireworks',
    },
    'CardUnlockedSuccessScreen',
);

/**
 * Configuration for the UNBLOCK_CARD_PIN multifactor authentication scenario.
 * This scenario is used when a UK/EU cardholder needs to unlock their PIN-blocked card.
 *
 * Callback behavior per design doc:
 * - Online market success: Return SHOW_OUTCOME_SCREEN → shows Card Unlocked success screen
 * - Offline market success: Return SKIP_OUTCOME_SCREEN → navigate to ChangePINATMRequirementPage
 * - Authentication failure: Return SHOW_OUTCOME_SCREEN to show failure screen
 */
export default {
    allowedAuthenticationMethods: [CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS, CONST.MULTIFACTOR_AUTHENTICATION.TYPE.PASSKEYS],
    action: unblockCardPIN,
    callback: async (isSuccessful, _callbackInput, payload) => {
        if (isSuccessful && isUnblockCardPINPayload(payload)) {
            if (payload.isOfflinePINMarket) {
                Navigation.closeRHPFlow();
                Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_CHANGE_PIN_ATM_REQUIREMENT.getRoute(payload.cardID));
                return CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SKIP_OUTCOME_SCREEN;
            }
            return CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN;
        }
        return CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN;
    },
    successScreen: <CardUnlockedSuccessScreen />,
} as const satisfies MultifactorAuthenticationScenarioCustomConfig<Payload>;

export type {Payload};
