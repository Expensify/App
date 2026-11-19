/** Native wallet provisioning starts only after the MFA provider signs a challenge. */
import createScreenWithDefaults from '@components/MultifactorAuthentication/components/OutcomeScreen/createScreenWithDefaults';
import {DefaultServerFailureScreen} from '@components/MultifactorAuthentication/components/OutcomeScreen/FailureScreen/defaultScreens';
import type {MultifactorAuthenticationScenarioCustomConfig} from '@components/MultifactorAuthentication/config/types';

import {getPaymentMethods} from '@libs/actions/PaymentMethods';
import getPlatform from '@libs/getPlatform';
import Navigation from '@libs/Navigation/Navigation';
import {handleAddCardToWallet} from '@libs/Wallet';
import WalletProvisioningError from '@libs/Wallet/WalletProvisioningError';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Card} from '@src/types/onyx';

import React from 'react';

const WalletFailureScreen = createScreenWithDefaults(
    DefaultServerFailureScreen,
    {
        headerTitle: 'multifactorAuthentication.addToWallet.failedHeader',
        title: 'multifactorAuthentication.addToWallet.failedTitle',
        subtitle: 'multifactorAuthentication.addToWallet.failedSubtitle',
    },
    'WalletFailureScreen',
);

type Payload = {
    card: Card;
    cardHolderName: string;
    cardDescription: string;
};

export default {
    allowedAuthenticationMethods: [CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS_HSM],
    // Hermes V1 does not suspend at await inside async arrow functions with destructured parameters, so destructure in the body.
    action: async (params, context) => {
        const {card, cardHolderName, cardDescription, signedChallenge, authenticationMethod} = params;
        try {
            const status = await handleAddCardToWallet(card, cardHolderName, cardDescription, {
                authentication: {signedChallenge, authenticationMethod},
                signal: context?.signal,
            });
            if (status === 'success' && !context?.signal.aborted) {
                return {httpStatusCode: 200, reason: undefined, message: undefined};
            }
            return {
                httpStatusCode: undefined,
                reason:
                    status === 'canceled' || context?.signal.aborted
                        ? CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.CANCELED
                        : CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.WALLET_PROVISIONING_FAILED,
                message: undefined,
            };
        } catch (error) {
            if (error instanceof WalletProvisioningError) {
                return {...error.response, reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.WALLET_PROVISIONING_FAILED};
            }
            // Native exceptions can contain card data. Only the wallet failure reason is exposed.
            return {
                httpStatusCode: undefined,
                reason: context?.signal.aborted
                    ? CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.CANCELED
                    : CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.WALLET_PROVISIONING_FAILED,
                message: undefined,
            };
        }
    },
    failureScreens: {
        [CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.WALLET_PROVISIONING_FAILED]: <WalletFailureScreen />,
    },
    callback: async (isSuccessful, input, payload) => {
        // Dismissing the wallet sheet is a user choice, so no failure screen is shown.
        if (!isSuccessful && input.message === CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.CANCELED) {
            return CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SKIP_OUTCOME_SCREEN;
        }
        if (!isSuccessful || !payload || !('card' in payload)) {
            return CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN;
        }
        getPaymentMethods();
        if (getPlatform() === CONST.PLATFORM.IOS) {
            Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_ADDED_TO_WALLET.getRoute(String(payload.card.cardID)));
        }
        return CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SKIP_OUTCOME_SCREEN;
    },
} as const satisfies MultifactorAuthenticationScenarioCustomConfig<Payload>;

export type {Payload};
