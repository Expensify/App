import {createDigitalGoogleWallet} from '@libs/actions/Wallet';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import type {Card} from '@src/types/onyx';

import type {AndroidCardData, AndroidWalletData, CardStatus, TokenizationStatus} from '@expensify/react-native-wallet';

import {addCardToGoogleWallet, checkWalletAvailability, getCardStatusBySuffix, getSecureWalletInfo, listTokens, resumeAddCardToGoogleWallet} from '@expensify/react-native-wallet';

import isCardStatusInWallet from './isCardStatusInWallet';

function checkIfWalletIsAvailable(): Promise<boolean> {
    return checkWalletAvailability();
}

/** Returns the reference ID of the card's Google Wallet token when it still waits for identity verification (yellow path) */
function getTokenReferenceIDAwaitingVerification(card: Card): Promise<string | undefined> {
    const lastFourPAN = card.lastFourPAN;
    if (!lastFourPAN) {
        return Promise.resolve(undefined);
    }
    return getCardStatusBySuffix(lastFourPAN)
        .then((status: CardStatus) => {
            if (status !== 'requireActivation') {
                return undefined;
            }

            // getCardStatusBySuffix reads the first token matching the suffix, so pick the same one here
            return listTokens().then((tokens) => tokens.find((token) => token.lastDigits === lastFourPAN)?.identifier);
        })
        .catch((error) => {
            Log.warn(`getTokenReferenceIDAwaitingVerification error: ${error}`);
            return undefined;
        });
}

function handleAddCardToWallet(card: Card, cardHolderName: string): Promise<TokenizationStatus> {
    return getTokenReferenceIDAwaitingVerification(card).then((tokenReferenceID) => {
        // Resume verification of the existing token instead of provisioning the card again
        if (tokenReferenceID) {
            return resumeAddCardToGoogleWallet({network: CONST.COMPANY_CARDS.CARD_TYPE.VISA, tokenReferenceID, cardHolderName, lastDigits: card.lastFourPAN});
        }
        return getSecureWalletInfo().then((walletData: AndroidWalletData) =>
            createDigitalGoogleWallet({cardID: card.cardID, cardHolderName, ...walletData}).then((cardData: AndroidCardData) => addCardToGoogleWallet(cardData)),
        );
    });
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
