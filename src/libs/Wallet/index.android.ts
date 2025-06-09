import {addCardToGoogleWallet, checkWalletAvailability, getCardStatusBySuffix, getSecureWalletInfo} from '@expensify/react-native-wallet';
import type {AndroidCardData, AndroidWalletData, CardStatus, TokenizationStatus} from '@expensify/react-native-wallet';
import {createDigitalGoogleWallet} from '@libs/actions/Wallet';
import Log from '@libs/Log';
import type {Card} from '@src/types/onyx';

function checkIfWalletIsAvailable(): Promise<boolean> {
    return checkWalletAvailability();
}

function handleAddCardToWallet(card: Card, cardHolderName: string): Promise<TokenizationStatus> {
    return getSecureWalletInfo().then((walletData: AndroidWalletData) =>
        createDigitalGoogleWallet({cardHolderName, ...walletData}).then((cardData: AndroidCardData) => addCardToGoogleWallet(cardData)),
    );
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
