import {issuerEncryptPayloadCallback} from '@libs/actions/Wallet';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import type {Card} from '@src/types/onyx';

import type {IOSAddPaymentPassData, IOSCardData, IOSEncryptPayload, TokenizationStatus} from '@expensify/react-native-wallet';
import type {TurboModule} from 'react-native';

import {addCardToAppleWallet, addListener, checkWalletAvailability, getCardStatusByIdentifier, getCardStatusBySuffix} from '@expensify/react-native-wallet';
import {AppState, TurboModuleRegistry} from 'react-native';

import type {AddCardToWalletOptions} from './types';

import {walletDebugCapture, walletDebugLog} from './walletDebugLog';
import WalletProvisioningError from './WalletProvisioningError';

// DEBUG ONLY: everything tagged [WalletDebug] is temporary instrumentation for an ad hoc build.
type DebugWalletModule = TurboModule & {
    IOSPresentAddPaymentPassView(cardData: IOSCardData): Promise<IOSAddPaymentPassData>;
    IOSHandleAddPaymentPassResponse(payload: IOSEncryptPayload): Promise<IOSAddPaymentPassData | null>;
};

// Same cached native instance the wallet library uses, so the native call order stays identical.
const DebugNativeWallet = TurboModuleRegistry.get<DebugWalletModule>('RNWallet');

let debugCallCount = 0;
let hasDebugEventListener = false;

function describeDebugNativeResult(result: unknown) {
    if (result === null || result === undefined) {
        return {isNull: true, resultType: String(result)};
    }
    if (typeof result !== 'object') {
        return {isNull: false, resultType: typeof result};
    }
    const status = (result as {status?: unknown}).status;
    return {isNull: false, resultType: 'object', keys: Object.keys(result).join(','), status: String(status), statusType: typeof status};
}

function describeDebugError(error: unknown) {
    if (error instanceof WalletProvisioningError) {
        return {errorType: 'WalletProvisioningError', reason: error.response.reason, httpStatusCode: error.response.httpStatusCode};
    }
    if (error instanceof Error) {
        return {errorType: error.name, code: String((error as Error & {code?: unknown}).code), message: error.message};
    }
    return {errorType: typeof error};
}

function toDebugTokenizationStatus(stateID: number): TokenizationStatus {
    switch (stateID) {
        case -1:
            return 'error';
        case 0:
            return 'success';
        case 1:
            return 'canceled';
        default:
            throw new Error(`Unknown tokenization status: ${stateID}`);
    }
}

/** Mirrors addCardToAppleWallet from @expensify/react-native-wallet 0.1.22 line for line, plus logs of the raw native results. */
async function debugAddCardToAppleWallet(
    callID: number,
    cardData: IOSCardData,
    issuerCallback: (nonce: string, nonceSignature: string, certificates: string[]) => Promise<IOSEncryptPayload>,
): Promise<TokenizationStatus> {
    const presentStartTime = Date.now();
    walletDebugLog('IOSPresentAddPaymentPassView call', false, {callID, appState: AppState.currentState, hasNativeModule: !!DebugNativeWallet});
    let passData: IOSAddPaymentPassData | undefined;
    try {
        passData = await DebugNativeWallet?.IOSPresentAddPaymentPassView(cardData);
    } catch (error) {
        walletDebugLog('IOSPresentAddPaymentPassView rejected', false, {callID, ms: Date.now() - presentStartTime, appState: AppState.currentState, ...describeDebugError(error)});
        throw error;
    }
    walletDebugLog('IOSPresentAddPaymentPassView resolved', false, {
        callID,
        ms: Date.now() - presentStartTime,
        appState: AppState.currentState,
        ...describeDebugNativeResult(passData),
    });
    if (!passData || passData.status !== 0) {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Matches the library exactly.
        return toDebugTokenizationStatus(passData?.status || -1);
    }

    let attempt = 0;
    async function addPaymentPassToWallet(paymentPassData: IOSAddPaymentPassData): Promise<number> {
        attempt++;
        const responseData = await issuerCallback(paymentPassData.nonce, paymentPassData.nonceSignature, paymentPassData.certificates);
        const handleStartTime = Date.now();
        walletDebugLog('IOSHandleAddPaymentPassResponse call', false, {callID, attempt, appState: AppState.currentState});
        let response: IOSAddPaymentPassData | null | undefined;
        try {
            response = await DebugNativeWallet?.IOSHandleAddPaymentPassResponse(responseData);
        } catch (error) {
            walletDebugLog('IOSHandleAddPaymentPassResponse rejected', false, {
                callID,
                attempt,
                ms: Date.now() - handleStartTime,
                appState: AppState.currentState,
                ...describeDebugError(error),
            });
            throw error;
        }
        walletDebugLog('IOSHandleAddPaymentPassResponse resolved', false, {
            callID,
            attempt,
            ms: Date.now() - handleStartTime,
            appState: AppState.currentState,
            ...describeDebugNativeResult(response),
        });
        if (response) {
            return addPaymentPassToWallet(response);
        }
        return 0;
    }
    const status = await addPaymentPassToWallet(passData);
    return toDebugTokenizationStatus(status);
}

function checkIfWalletIsAvailable(): Promise<boolean> {
    return checkWalletAvailability();
}

async function handleAddCardToWallet(card: Card, cardHolderName: string, cardDescription: string, {authentication, signal}: AddCardToWalletOptions = {}): Promise<TokenizationStatus> {
    const data = {
        network: CONST.COMPANY_CARDS.CARD_TYPE.VISA,
        lastDigits: card.lastFourPAN,
        cardDescription,
        cardHolderName,
    } as IOSCardData;

    debugCallCount++;
    const callID = debugCallCount;
    walletDebugLog('handleAddCardToWallet start', false, {
        callID,
        cardID: card.cardID,
        hasAuthentication: !!authentication,
        isAborted: !!signal?.aborted,
        appState: AppState.currentState,
        lastDigitsLength: card.lastFourPAN?.length ?? 0,
        hasCardHolderName: !!cardHolderName,
        hasCardDescription: !!cardDescription,
    });

    if (!authentication) {
        return addCardToAppleWallet(data, (nonce, nonceSignature, certificates) => issuerEncryptPayloadCallback(nonce, nonceSignature, certificates, card.cardID));
    }

    if (!hasDebugEventListener) {
        hasDebugEventListener = true;
        addListener('onCardActivated', (event) => {
            walletDebugLog('onCardActivated event', false, {latestCallID: debugCallCount, status: event?.status, appState: AppState.currentState});
        });
    }
    signal?.addEventListener('abort', () => {
        walletDebugLog('signal aborted', false, {callID, appState: AppState.currentState});
    });

    if (signal?.aborted) {
        walletDebugLog('handleAddCardToWallet end', true, {callID, status: 'canceled', path: 'abortedBeforeStart'});
        return 'canceled';
    }

    let didRequestProvisioning = false;
    let provisioningFailure: unknown;
    try {
        const status = await debugAddCardToAppleWallet(callID, data, async (nonce, nonceSignature, certificates) => {
            const issuerStartTime = Date.now();
            walletDebugLog('issuer callback start', false, {
                callID,
                didRequestProvisioning,
                isAborted: !!signal?.aborted,
                appState: AppState.currentState,
                certificateCount: certificates?.length ?? 0,
            });
            try {
                // Apple's Try Again callback must not replay a consumed signed challenge.
                // Wallet 0.1.22 has no public abort API; rejection cannot dismiss its sheet.
                if (didRequestProvisioning || signal?.aborted) {
                    throw new Error('Wallet attempt requires fresh authentication');
                }
                didRequestProvisioning = true;
                const payload = await issuerEncryptPayloadCallback(nonce, nonceSignature, certificates, card.cardID, authentication);
                walletDebugLog('issuer callback payload', false, {
                    callID,
                    ms: Date.now() - issuerStartTime,
                    isAborted: !!signal?.aborted,
                    appState: AppState.currentState,
                    hasEncryptedPassData: !!payload?.encryptedPassData,
                    hasActivationData: !!payload?.activationData,
                    hasEphemeralPublicKey: !!payload?.ephemeralPublicKey,
                });
                if (signal?.aborted) {
                    throw new Error('Wallet attempt canceled');
                }
                return payload;
            } catch (error) {
                walletDebugLog('issuer callback threw', false, {callID, ms: Date.now() - issuerStartTime, isFirstFailure: !provisioningFailure, ...describeDebugError(error)});
                provisioningFailure ??= error;
                throw error;
            }
        });
        const endParams = {
            callID,
            status,
            isAborted: !!signal?.aborted,
            didRequestProvisioning,
            hasProvisioningFailure: !!provisioningFailure,
            appState: AppState.currentState,
        };
        walletDebugLog('handleAddCardToWallet end', true, endParams);
        walletDebugCapture(`handleAddCardToWallet end: ${status}`, endParams);
        if (provisioningFailure) {
            throw provisioningFailure;
        }
        if (status === 'success' && !didRequestProvisioning) {
            throw new Error('Wallet completed without provisioning');
        }
        return signal?.aborted ? 'canceled' : status;
    } catch (error) {
        const threwParams = {
            callID,
            isAborted: !!signal?.aborted,
            didRequestProvisioning,
            appState: AppState.currentState,
            ...describeDebugError(error),
            ...(provisioningFailure ? {provisioningFailure: describeDebugError(provisioningFailure)} : {}),
        };
        walletDebugLog('handleAddCardToWallet threw', true, threwParams);
        walletDebugCapture('handleAddCardToWallet threw', threwParams);
        // A subsequent native rejection must not replace the original server failure.
        throw provisioningFailure ?? error;
    }
}

function isCardInWallet(card: Card): Promise<boolean> {
    const panReferenceID = card.nameValuePairs?.expensifyCard_panReferenceID;
    if (!panReferenceID) {
        return Promise.resolve(false);
    }

    let callback = null;
    if (card.token) {
        callback = getCardStatusByIdentifier(panReferenceID, CONST.COMPANY_CARDS.CARD_TYPE.VISA);
    } else if (card.lastFourPAN) {
        callback = getCardStatusBySuffix(card.lastFourPAN);
    }

    if (callback) {
        return callback
            .then((status) => {
                Log.info(`Card status: ${status}`);
                return status === 'active';
            })
            .catch((e) => {
                Log.warn(`isCardInWallet error: ${e}`);
                return Promise.resolve(false);
            });
    }
    return Promise.resolve(false);
}

export {handleAddCardToWallet, isCardInWallet, checkIfWalletIsAvailable};
