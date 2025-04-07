import {addCardToGoogleWallet, checkWalletAvailability, getSecureWalletInfo} from '@expensify/react-native-wallet';
import type {AndroidCardData, AndroidWalletData} from '@expensify/react-native-wallet/lib/typescript/src/NativeWallet';
import {createDigitalGoogleWallet} from '@libs/actions/Wallet';
import Log from '@libs/Log';
import type {Card} from '@src/types/onyx';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function handleAddCardToWallet(card: Card, cardHolderName: string) {
    checkWalletAvailability()
        .then(() =>
            getSecureWalletInfo().then((data: AndroidWalletData) => {
                createDigitalGoogleWallet(data)
                    .then((cardData: AndroidCardData) => {
                        addCardToGoogleWallet({...cardData, cardHolderName})
                            .then(() => Log.info('addCardToWallet COMPLETE '))
                            .catch((error) => Log.warn(`addCardToGoogleWallet error: ${error}`));
                    })
                    .catch((error) => Log.warn(`createDigitalWallet error: ${error}`));
            }),
        )
        .catch((error) => Log.warn(`checkWalletAvailability error: ${error}`));
}
