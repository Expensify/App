import {addCardToAppleWallet, checkWalletAvailability, getCardStatusByIdentifier, getCardStatusBySuffix} from '@expensify/react-native-wallet';
import type {IOSCardData, TokenizationStatus} from '@expensify/react-native-wallet';
import {issuerEncryptPayloadCallback} from '@libs/actions/Wallet';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import type {Card} from '@src/types/onyx';

function checkIfWalletIsAvailable(): Promise<boolean> {
    return checkWalletAvailability();
}

function handleAddCardToWallet(card: Card, cardHolderName: string, cardDescription: string): Promise<TokenizationStatus> {
    const data = {
        network: CONST.COMPANY_CARDS.CARD_TYPE.VISA,
        lastDigits: card.lastFourPAN,
        cardDescription,
        cardHolderName,
    } as IOSCardData;

    return addCardToAppleWallet(data, issuerEncryptPayloadCallback);
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
