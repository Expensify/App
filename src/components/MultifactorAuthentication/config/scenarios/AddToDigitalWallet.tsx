/** Native wallet provisioning starts only after the MFA provider signs a challenge. */
import createScreenWithDefaults from '@components/MultifactorAuthentication/components/OutcomeScreen/createScreenWithDefaults';
import {DefaultServerFailureScreen} from '@components/MultifactorAuthentication/components/OutcomeScreen/FailureScreen/defaultScreens';
import type {MultifactorAuthenticationScenarioCustomConfig} from '@components/MultifactorAuthentication/config/types';

import {getPaymentMethods} from '@libs/actions/PaymentMethods';
import refreshCardWalletStatus from '@libs/actions/refreshCardWalletStatus';
import getPlatform from '@libs/getPlatform';
import {isSignedChallengeFailure} from '@libs/MultifactorAuthentication/shared/helpers';
import Navigation from '@libs/Navigation/Navigation';
import {handleAddCardToWallet} from '@libs/Wallet';
import WalletProvisioningError from '@libs/Wallet/WalletProvisioningError';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Card} from '@src/types/onyx';

import type {TokenizationStatus} from '@expensify/react-native-wallet';

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

/** Keeps the wallet sheet cancel apart from the MFA flow cancel, which shows the default failure screen. */
function getFailureReason(status: TokenizationStatus, isAborted: boolean | undefined) {
    if (isAborted) {
        return CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.CANCELED;
    }
    return status === 'canceled'
        ? CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.WALLET_PROVISIONING_CANCELED
        : CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.WALLET_PROVISIONING_FAILED;
}

type Payload = {
    card: Card;
    cardHolderName: string;
    cardDescription: string;
};

export default {
    allowedAuthenticationMethods: [CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS_HSM],
    shouldHideModalOnSuccess: true,
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
                reason: getFailureReason(status, context?.signal.aborted),
                message: undefined,
            };
        } catch (error) {
            if (error instanceof WalletProvisioningError) {
                // A rejected challenge is an MFA failure, not a wallet one, so it keeps the default failure screens
                if (isSignedChallengeFailure(error.response.httpStatusCode, error.response.message)) {
                    return error.response;
                }

                // The backend reason is prefixed to message so telemetry still sees it.
                return {
                    ...error.response,
                    reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.WALLET_PROVISIONING_FAILED,
                    message: [error.response.reason, error.response.message].filter(Boolean).join(' - '),
                };
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
        if (!isSuccessful && input.message === CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.WALLET_PROVISIONING_CANCELED) {
            return CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SKIP_OUTCOME_SCREEN;
        }
        if (!isSuccessful || !payload || !('card' in payload)) {
            return CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN;
        }
        getPaymentMethods();
        refreshCardWalletStatus(payload.card);
        if (getPlatform() === CONST.PLATFORM.IOS) {
            Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_ADDED_TO_WALLET.getRoute(String(payload.card.cardID)));
        }
        return CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SKIP_OUTCOME_SCREEN;
    },
} as const satisfies MultifactorAuthenticationScenarioCustomConfig<Payload>;

export type {Payload};
