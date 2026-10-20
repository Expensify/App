import {issuerEncryptPayloadCallback} from '@libs/actions/Wallet';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import type {Card} from '@src/types/onyx';

import type {IOSCardData, TokenizationStatus} from '@expensify/react-native-wallet';

import {addCardToAppleWallet, checkWalletAvailability, getCardStatusByIdentifier, getCardStatusBySuffix} from '@expensify/react-native-wallet';

import type {AddCardToWalletOptions} from './types';

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

    if (!authentication) {
        return addCardToAppleWallet(data, (nonce, nonceSignature, certificates) => issuerEncryptPayloadCallback(nonce, nonceSignature, certificates, card.cardID));
    }

    if (signal?.aborted) {
        return 'canceled';
    }

    let didRequestProvisioning = false;
    let provisioningFailure: unknown;
    try {
        const status = await addCardToAppleWallet(data, async (nonce, nonceSignature, certificates) => {
            try {
                // Apple's Try Again callback must not replay a consumed signed challenge.
                // Wallet 0.1.22 has no public abort API. Rejection cannot dismiss its sheet.
                if (didRequestProvisioning || signal?.aborted) {
                    throw new Error('Wallet attempt requires fresh authentication');
                }
                didRequestProvisioning = true;
                const payload = await issuerEncryptPayloadCallback(nonce, nonceSignature, certificates, card.cardID, authentication);
                if (signal?.aborted) {
                    throw new Error('Wallet attempt canceled');
                }
                return payload;
            } catch (error) {
                provisioningFailure ??= error;
                throw error;
            }
        });
        if (provisioningFailure) {
            throw provisioningFailure;
        }
        if (status === 'success' && !didRequestProvisioning) {
            throw new Error('Wallet completed without provisioning');
        }
        return signal?.aborted ? 'canceled' : status;
    } catch (error) {
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
