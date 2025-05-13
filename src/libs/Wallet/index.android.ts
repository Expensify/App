import {addCardToGoogleWallet, checkWalletAvailability, getCardStatusByIdentifier, getSecureWalletInfo} from '@expensify/react-native-wallet';
import type {AndroidCardData, AndroidWalletData, CardStatus, TokenizationStatus} from '@expensify/react-native-wallet';
import {createDigitalGoogleWallet} from '@libs/actions/Wallet';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import type {Card} from '@src/types/onyx';

function checkIfWalletIsAvailable(): Promise<boolean> {
    return checkWalletAvailability();
}

function handleAddCardToWallet(card: Card, cardHolderName: string): Promise<TokenizationStatus> {
    return checkIfWalletIsAvailable().then((response) => {
        if (!response) {
            throw new Error('Wallet not available');
        }
        return getSecureWalletInfo().then((walletData: AndroidWalletData) =>
            createDigitalGoogleWallet({cardHolderName, ...walletData}).then((cardData: AndroidCardData) => addCardToGoogleWallet(cardData)),
        );
    });
}

function isCardInWallet(card: Card): Promise<boolean> {
    const tokenRefId = card.nameValuePairs?.expensifyCard_tokenReferenceIdList?.at(-1);
    if (!tokenRefId) {
        return Promise.resolve(false);
    }
    return getCardStatusByIdentifier(tokenRefId, CONST.COMPANY_CARDS.CARD_TYPE.VISA)
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
