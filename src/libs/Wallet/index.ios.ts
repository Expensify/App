import {addCardToAppleWallet, checkWalletAvailability, getCardStatus} from '@expensify/react-native-wallet';
import type {IOSCardData} from '@expensify/react-native-wallet/lib/typescript/src/NativeWallet';
import {Alert} from 'react-native';
import {issuerEncryptPayloadCallback} from '@libs/actions/Wallet';
import Log from '@libs/Log';
import type {Card} from '@src/types/onyx';

function checkIfWalletIsAvailable(): Promise<boolean> {
    return checkWalletAvailability();
}

function handleAddCardToWallet(card: Card, cardHolderName: string, onFinished?: () => void) {
    const data = {
        network: 'VISA',
        lastDigits: card.lastFourPAN,
        cardDescription: card.nameValuePairs?.isVirtual ? 'Expensify Virtual Card' : 'Expensify Physical Card',
        cardHolderName,
    } as IOSCardData;

    addCardToAppleWallet(data, issuerEncryptPayloadCallback)
        .then(() => {
            onFinished?.();
        })
        .catch((e) => {
            Log.warn(`ADD ERROR: ${e}`);
            Alert.alert('Failed to add card to wallet', 'Please try again later.');
        });
}

function isCardInWallet(card: Card): Promise<boolean> {
    if (card.lastFourPAN) {
        return getCardStatus(card.lastFourPAN)
            .then((status) => {
                return status === 'active';
            })
            .catch((e) => {
                Log.warn(`STATUS ERROR ${e}`);
                return Promise.resolve(card.state === 6);
            });
    }
    return Promise.resolve(card.state === 6);
}

export {handleAddCardToWallet, isCardInWallet, checkIfWalletIsAvailable};
