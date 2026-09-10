import {createDigitalGoogleWallet} from '@libs/actions/Wallet';
import Log from '@libs/Log';

import type {Card} from '@src/types/onyx';

import type {AndroidCardData, AndroidWalletData, CardStatus} from '@expensify/react-native-wallet';

import {addCardToGoogleWallet, checkWalletAvailability, getCardStatusBySuffix, getSecureWalletInfo} from '@expensify/react-native-wallet';

import type Wallet from './types';

const checkIfWalletIsAvailable: Wallet['checkIfWalletIsAvailable'] = () => {
    return checkWalletAvailability();
};

const handleAddCardToWallet: Wallet['handleAddCardToWallet'] = (card, cardHolderName) => {
    return getSecureWalletInfo().then((walletData: AndroidWalletData) =>
        createDigitalGoogleWallet({cardID: card.cardID, cardHolderName, ...walletData}).then((cardData: AndroidCardData) => addCardToGoogleWallet(cardData)),
    );
};

const isCardInWallet: Wallet['isCardInWallet'] = (card: Card) => {
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
};

export {handleAddCardToWallet, isCardInWallet, checkIfWalletIsAvailable};
