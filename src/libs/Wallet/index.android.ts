import {addCardToGoogleWallet, checkWalletAvailability, getSecureWalletInfo} from '@expensify/react-native-wallet';
import type {AndroidCardData, AndroidWalletData} from '@expensify/react-native-wallet/lib/typescript/src/NativeWallet';
import {createDigitalGoogleWallet} from '@libs/actions/Wallet';
import Log from '@libs/Log';
import type {Card} from '@src/types/onyx';

function checkIfWalletIsAvailable(): Promise<boolean> {
    return checkWalletAvailability();
}

function handleAddCardToWallet(card: Card, cardHolderName: string) {
    getSecureWalletInfo().then((data: AndroidWalletData) => {
        createDigitalGoogleWallet(data)
            .then((cardData: AndroidCardData) => {
                addCardToGoogleWallet({...cardData, cardHolderName})
                    .then(() => Log.info('addCardToWallet COMPLETE'))
                    .catch((error) => Log.warn(`addCardToGoogleWallet error: ${error}`));
            })
            .catch((error) => Log.warn(`createDigitalWallet error: ${error}`));
    });
}

function isCardInWallet(card: Card): Promise<boolean> {
    // TODO: Add check based on tokenRefID
    return Promise.resolve(card.state === 6);
}

export {handleAddCardToWallet, isCardInWallet, checkIfWalletIsAvailable};
