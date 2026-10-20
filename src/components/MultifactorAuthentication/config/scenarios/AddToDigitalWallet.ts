/** Native wallet provisioning starts only after the MFA provider signs a challenge. */
import type {MultifactorAuthenticationScenarioCustomConfig} from '@components/MultifactorAuthentication/config/types';

import {getPaymentMethods} from '@libs/actions/PaymentMethods';
import getPlatform from '@libs/getPlatform';
import Navigation from '@libs/Navigation/Navigation';
import {handleAddCardToWallet} from '@libs/Wallet';
import WalletProvisioningError from '@libs/Wallet/WalletProvisioningError';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Card} from '@src/types/onyx';

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
                        : CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.UNRECOGNIZED,
                message: undefined,
            };
        } catch (error) {
            if (error instanceof WalletProvisioningError) {
                return error.response;
            }
            // Native exceptions can contain card data. The shared MFA failure UI only needs a reason.
            return {
                httpStatusCode: undefined,
                reason: context?.signal.aborted ? CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.CANCELED : CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.UNHANDLED_EXCEPTION,
                message: undefined,
            };
        }
    },
    callback: async (isSuccessful, _input, payload) => {
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
