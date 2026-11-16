import {createDigitalGoogleWallet} from '@libs/actions/Wallet';
import {getErrorMessage} from '@libs/ErrorUtils';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import type {Card} from '@src/types/onyx';

import type {CardStatus, TokenizationStatus} from '@expensify/react-native-wallet';

import {addCardToGoogleWallet, checkWalletAvailability, getCardStatusBySuffix, getSecureWalletInfo, listTokens, resumeAddCardToGoogleWallet} from '@expensify/react-native-wallet';

import type {AddCardToWalletOptions} from './types';

import isCardStatusInWallet from './isCardStatusInWallet';

function checkIfWalletIsAvailable(): Promise<boolean> {
    return checkWalletAvailability();
}

/** Returns the reference ID of the card's Google Wallet token when it still waits for identity verification (yellow path) */
async function getTokenReferenceIDAwaitingVerification(card: Card): Promise<string | undefined> {
    const lastFourPAN = card.lastFourPAN;
    if (!lastFourPAN) {
        return undefined;
    }
    try {
        const status = await getCardStatusBySuffix(lastFourPAN);
        if (status !== 'requireActivation') {
            return undefined;
        }

        // getCardStatusBySuffix reads the first token matching the suffix, so pick the same one here
        const tokens = await listTokens();
        const matchingTokens = tokens.filter((token) => token.lastDigits === lastFourPAN);

        // Two cards with the same last four digits on one device can't be told apart by suffix, rare enough to only log it
        if (matchingTokens.length > 1) {
            Log.warn(`getTokenReferenceIDAwaitingVerification found ${matchingTokens.length} tokens with the same suffix, resuming the first one`);
        }
        return matchingTokens.at(0)?.identifier;
    } catch (error) {
        Log.warn(`getTokenReferenceIDAwaitingVerification error: ${getErrorMessage(error)}`);
        return undefined;
    }
}

async function handleAddCardToWallet(card: Card, cardHolderName: string, _cardDescription: string, options: AddCardToWalletOptions = {}): Promise<TokenizationStatus> {
    const {authentication, signal} = options;
    if (signal?.aborted) {
        return 'canceled';
    }
    const tokenReferenceID = await getTokenReferenceIDAwaitingVerification(card);
    if (signal?.aborted) {
        return 'canceled';
    }

    // Resume verification of the existing token instead of provisioning the card again
    if (tokenReferenceID) {
        return resumeAddCardToGoogleWallet({network: CONST.COMPANY_CARDS.CARD_TYPE.VISA, tokenReferenceID, cardHolderName, lastDigits: card.lastFourPAN});
    }
    const walletData = await getSecureWalletInfo();
    if (signal?.aborted) {
        return 'canceled';
    }
    const cardData = await createDigitalGoogleWallet({cardID: card.cardID, cardHolderName, ...walletData}, authentication);
    if (signal?.aborted) {
        return 'canceled';
    }
    return addCardToGoogleWallet(cardData);
}

function isCardInWallet(card: Card): Promise<boolean> {
    if (!card.lastFourPAN) {
        return Promise.resolve(false);
    }
    return getCardStatusBySuffix(card.lastFourPAN)
        .then((status: CardStatus) => {
            Log.info(`Card status: ${status}`);

            // A token awaiting identity verification keeps the Add button, which resumes the verification
            return status !== 'requireActivation' && isCardStatusInWallet(status);
        })
        .catch((error) => {
            Log.warn(`getCardTokenStatus error: ${error}`);
            return false;
        });
}

export {handleAddCardToWallet, isCardInWallet, checkIfWalletIsAvailable};
