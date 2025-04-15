import {addCardToGoogleWallet, checkWalletAvailability, getCardTokenStatus, getSecureWalletInfo} from '@expensify/react-native-wallet';
import type {AndroidCardData, AndroidWalletData, CardStatus} from '@expensify/react-native-wallet/lib/typescript/src/NativeWallet';
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
    const tokenRefId = card.nameValuePairs?.expensifyCard_tokenReferenceIdList?.at(0);
    if (tokenRefId === undefined) {
        return Promise.resolve(false);
    }
    return getCardTokenStatus('visa', tokenRefId)
        .then((status: CardStatus) => status === 'active')
        .catch((error) => {
            Log.warn(`getCardTokenStatus error: ${error}`);
            return false;
        });
}

export {handleAddCardToWallet, isCardInWallet, checkIfWalletIsAvailable};
