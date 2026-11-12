import {createDigitalGoogleWallet} from '@libs/actions/Wallet';
import Log from '@libs/Log';

import type {Card} from '@src/types/onyx';

import type {AndroidCardData, AndroidWalletData, CardStatus, TokenizationStatus} from '@expensify/react-native-wallet';

import {addCardToGoogleWallet, checkWalletAvailability, getCardStatusBySuffix, getSecureWalletInfo} from '@expensify/react-native-wallet';

import type {AddCardToWalletOptions} from './types';

function checkIfWalletIsAvailable(): Promise<boolean> {
    return checkWalletAvailability();
}

function handleAddCardToWallet(card: Card, cardHolderName: string, _cardDescription: string, {authentication, signal}: AddCardToWalletOptions = {}): Promise<TokenizationStatus> {
    if (signal?.aborted) {
        return Promise.resolve('canceled');
    }
    return getSecureWalletInfo().then((walletData: AndroidWalletData) => {
        if (signal?.aborted) {
            return 'canceled';
        }
        return createDigitalGoogleWallet({cardID: card.cardID, cardHolderName, ...walletData}, authentication).then((cardData: AndroidCardData) => {
            if (signal?.aborted) {
                return 'canceled';
            }
            return addCardToGoogleWallet(cardData);
        });
    });
}

function isCardInWallet(card: Card): Promise<boolean> {
    if (!card.lastFourPAN) {
        return Promise.resolve(false);
    }
    return getCardStatusBySuffix(card.lastFourPAN)
        .then((status: CardStatus) => {
            Log.info(`Card status: ${status}`);
            return status === 'active';
        })
        .catch((error) => {
            Log.warn(`getCardTokenStatus error: ${error}`);
            return false;
        });
}

export {handleAddCardToWallet, isCardInWallet, checkIfWalletIsAvailable};
