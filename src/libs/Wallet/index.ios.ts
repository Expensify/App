import {addCardToAppleWallet, checkWalletAvailability, getCardStatusByIdentifier, getCardStatusBySuffix} from '@expensify/react-native-wallet';
import type {IOSCardData} from '@expensify/react-native-wallet';
import {Alert} from 'react-native';
import {openWalletPage} from '@libs/actions/PaymentMethods';
import {issuerEncryptPayloadCallback} from '@libs/actions/Wallet';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import type {Card} from '@src/types/onyx';

function checkIfWalletIsAvailable(): Promise<boolean> {
    return checkWalletAvailability();
}

function handleAddCardToWallet(card: Card, cardHolderName: string, cardDescription: string, onFinished?: () => void) {
    const data = {
        network: CONST.COMPANY_CARDS.CARD_TYPE.VISA,
        lastDigits: card.lastFourPAN,
        cardDescription,
        cardHolderName,
    } as IOSCardData;

    addCardToAppleWallet(data, issuerEncryptPayloadCallback)
        .then((status) => {
            Log.info('Card added to wallet');
            if (status === 'success') {
                Log.info('Card added to wallet');
                openWalletPage();
            } else {
                onFinished?.();
            }
        })
        .catch((e) => {
            Log.warn(`handleAddCardToWallet error: ${e}`);
            Alert.alert('Failed to add card to wallet', 'Please try again later.');
        });
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
