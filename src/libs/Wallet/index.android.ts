import {createDigitalGoogleWallet} from '@libs/actions/Wallet';
import {getErrorMessage} from '@libs/ErrorUtils';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import type {Card} from '@src/types/onyx';

import type {CardStatus, TokenizationStatus} from '@expensify/react-native-wallet';

import {addCardToGoogleWallet, checkWalletAvailability, getCardStatusBySuffix, getSecureWalletInfo, listTokens, resumeAddCardToGoogleWallet} from '@expensify/react-native-wallet';

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
        return tokens.find((token) => token.lastDigits === lastFourPAN)?.identifier;
    } catch (error) {
        Log.warn(`getTokenReferenceIDAwaitingVerification error: ${getErrorMessage(error)}`);
        return undefined;
    }
}

async function handleAddCardToWallet(card: Card, cardHolderName: string): Promise<TokenizationStatus> {
    const tokenReferenceID = await getTokenReferenceIDAwaitingVerification(card);

    // Resume verification of the existing token instead of provisioning the card again
    if (tokenReferenceID) {
        return resumeAddCardToGoogleWallet({network: CONST.COMPANY_CARDS.CARD_TYPE.VISA, tokenReferenceID, cardHolderName, lastDigits: card.lastFourPAN});
    }
    const walletData = await getSecureWalletInfo();
    const cardData = await createDigitalGoogleWallet({cardID: card.cardID, cardHolderName, ...walletData});
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
