import {addCardToAppleWallet, checkWalletAvailability, getCardStatusByIdentifier, getCardStatusBySuffix} from '@expensify/react-native-wallet';
import type {IOSCardData} from '@expensify/react-native-wallet/lib/typescript/src/NativeWallet';
import {Alert} from 'react-native';
import {issuerEncryptPayloadCallback} from '@libs/actions/Wallet';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import type {Card} from '@src/types/onyx';

const ExpensifyCardNetwork = CONST.COMPANY_CARDS.CARD_TYPE.VISA.toUpperCase();

function checkIfWalletIsAvailable(): Promise<boolean> {
    return checkWalletAvailability();
}

function handleAddCardToWallet(card: Card, cardHolderName: string, cardDescription: string, onFinished?: () => void) {
    const data = {
        network: ExpensifyCardNetwork,
        lastDigits: card.lastFourPAN,
        cardDescription,
        cardHolderName,
    } as IOSCardData;

    addCardToAppleWallet(data, issuerEncryptPayloadCallback)
        .then(() => {
            Log.info('Card added to wallet');
            onFinished?.();
        })
        .catch((e) => {
            Log.warn(`handleAddCardToWallet error: ${e}`);
            Alert.alert('Failed to add card to wallet', 'Please try again later.');
        });
}

function isCardInWallet(card: Card): Promise<boolean> {
    if (card.state !== CONST.EXPENSIFY_CARD.STATE.OPEN) {
        return Promise.resolve(false);
    }

    let callback = null;
    if (card.token) {
        callback = getCardStatusByIdentifier(card.token, ExpensifyCardNetwork);
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
