import {issuerEncryptPayloadCallback} from '@libs/actions/Wallet';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import type {Card} from '@src/types/onyx';

import type {CardStatus, IOSCardData, TokenizationStatus} from '@expensify/react-native-wallet';

import {addCardToAppleWallet, checkWalletAvailability, getCardStatusByIdentifier, getCardStatusBySuffix, listAppleWalletPasses} from '@expensify/react-native-wallet';

import type {AddCardToWalletOptions} from './types';

import isCardStatusInWallet from './isCardStatusInWallet';

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

type LookupMethod = 'identifier' | 'suffix' | 'suffix fallback' | 'none';

const yesNo = (value: boolean) => (value ? 'yes' : 'no');

/** Matches a local Apple Wallet pass by the card's last digits. Returns only counts and yes/no flags, never identifiers. */
async function findPassByLastDigits(lastDigits: string | undefined, panReferenceID: string) {
    const passes = await listAppleWalletPasses();
    const localPasses = passes.filter((pass) => !pass.isRemote);
    const matchingPass = lastDigits ? localPasses.find((pass) => !!pass.lastDigits?.endsWith(lastDigits)) : undefined;
    const idMatches = !!matchingPass && matchingPass.primaryAccountIdentifier === panReferenceID;
    return {
        status: matchingPass?.activationState,
        summary: `passes: ${localPasses.length} local ${passes.length - localPasses.length} remote, last4 pass: ${yesNo(!!matchingPass)}, id matches: ${yesNo(idMatches)}`,
    };
}

async function isCardInWallet(card: Card): Promise<boolean> {
    const panReferenceID = card.nameValuePairs?.expensifyCard_panReferenceID;
    if (!panReferenceID || (!card.token && !card.lastFourPAN)) {
        return false;
    }

    try {
        let status: CardStatus;
        let method: LookupMethod;
        let summary = '';

        if (card.token) {
            method = 'identifier';
            status = await getCardStatusByIdentifier(panReferenceID, CONST.COMPANY_CARDS.CARD_TYPE.VISA);
        } else {
            method = 'suffix';
            status = await getCardStatusBySuffix(card.lastFourPAN ?? '');
        }

        // The pass can exist in Wallet under another primary account identifier, so retry by the card's last digits.
        if (card.token && status === 'not found') {
            method = 'none';
            try {
                const fallback = await findPassByLastDigits(card.lastFourPAN, panReferenceID);
                summary = `, ${fallback.summary}`;
                if (fallback.status) {
                    status = fallback.status;
                    method = 'suffix fallback';
                }
            } catch (e) {
                summary = ', passes: unavailable';
                Log.warn(`isCardInWallet pass list error: ${String(e)}`);
            }
        }

        Log.info(`Card status: ${status} (lookup: ${method}${summary})`);
        return isCardStatusInWallet(status);
    } catch (e) {
        Log.warn(`isCardInWallet error: ${String(e)}`);
        return false;
    }
}

export {handleAddCardToWallet, isCardInWallet, checkIfWalletIsAvailable};
