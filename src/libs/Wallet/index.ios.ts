import {addCardToAppleWallet} from '@expensify/react-native-wallet';
import type {IOSCardData} from '@expensify/react-native-wallet/lib/typescript/src/NativeWallet';
import {issuerEncryptPayloadCallback} from '@libs/actions/Wallet';
import Log from '@libs/Log';
import type {Card} from '@src/types/onyx';

export default function handleAddCardToWallet(card: Card, cardHolderName: string) {
    const data = {
        network: 'VISA',
        lastDigits: card.lastFourPAN,
        cardDescription: card.nameValuePairs?.cardTitle,
        cardHolderName,
    } as IOSCardData;

    addCardToAppleWallet(data, issuerEncryptPayloadCallback)
        .then(() => Log.info('[info] addCardToAppleWallet DONE'))
        .catch((error) => {
            Log.warn(`addCardToAppleWallet ERROR: ${error}`);
        });
}
