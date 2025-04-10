import {addCardToAppleWallet, checkWalletAvailability, getCardStatus} from '@expensify/react-native-wallet';
import type {IOSCardData} from '@expensify/react-native-wallet/lib/typescript/src/NativeWallet';
import {Alert} from 'react-native';
import {issuerEncryptPayloadCallback} from '@libs/actions/Wallet';
import Log from '@libs/Log';
import type {Card} from '@src/types/onyx';

function checkIfWalletIsAvailable(): Promise<boolean> {
    return checkWalletAvailability();
}

function handleAddCardToWallet(card: Card, cardHolderName: string, cardDescription: string, onFinished?: () => void) {
    const data = {
        network: 'VISA',
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
    if (card.lastFourPAN) {
        return getCardStatus(card.lastFourPAN)
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
