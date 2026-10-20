/** Native wallet provisioning starts only after the MFA provider signs a challenge. */
import type {MultifactorAuthenticationScenarioCustomConfig} from '@components/MultifactorAuthentication/config/types';

import {getPaymentMethods} from '@libs/actions/PaymentMethods';
import getPlatform from '@libs/getPlatform';
import Navigation from '@libs/Navigation/Navigation';
import {handleAddCardToWallet} from '@libs/Wallet';
import {getWalletDebugStack, walletDebugLog, walletDebugState} from '@libs/Wallet/walletDebugLog';
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
    action: async ({card, cardHolderName, cardDescription, signedChallenge, authenticationMethod}, context) => {
        walletDebugLog('scenario action start', false, {
            cardID: card.cardID,
            hasSignedChallenge: !!signedChallenge,
            authenticationMethod,
            hasContext: !!context,
            isAborted: !!context?.signal.aborted,
            isDispatchingAction: walletDebugState.isDispatchingAction,
        });
        try {
            const walletPromise = handleAddCardToWallet(card, cardHolderName, cardDescription, {
                authentication: {signedChallenge, authenticationMethod},
                signal: context?.signal,
            });
            walletDebugLog('handleAddCardToWallet returned', false, {
                cardID: card.cardID,
                valueType: typeof walletPromise,
                isPromise: walletPromise instanceof Promise,
                hasThen: typeof (walletPromise as Partial<Promise<unknown>> | undefined)?.then === 'function',
                isDispatchingAction: walletDebugState.isDispatchingAction,
            });
            walletPromise.then(
                (value) => walletDebugLog('handleAddCardToWallet promise fulfilled', false, {cardID: card.cardID, valueType: typeof value, value: String(value)}),
                (error: unknown) => walletDebugLog('handleAddCardToWallet promise rejected', false, {cardID: card.cardID, errorType: error instanceof Error ? error.name : typeof error}),
            );
            const status = await walletPromise;
            walletDebugLog('scenario action got status', false, {
                cardID: card.cardID,
                status: String(status),
                statusType: typeof status,
                isAborted: !!context?.signal.aborted,
                isDispatchingAction: walletDebugState.isDispatchingAction,
                stack: getWalletDebugStack(),
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
            walletDebugLog('scenario action caught', false, {
                cardID: card.cardID,
                isProvisioningError: error instanceof WalletProvisioningError,
                reason: error instanceof WalletProvisioningError ? error.response.reason : undefined,
                errorType: error instanceof Error ? error.name : typeof error,
                isAborted: !!context?.signal.aborted,
            });
            if (error instanceof WalletProvisioningError) {
                return error.response;
            }
            // Native exceptions can contain card data; the shared MFA failure UI needs only a reason.
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
