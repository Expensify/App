import {addCardToGoogleWallet} from '@expensify/react-native-wallet';
import type {AndroidCardData, UserAddress} from '@expensify/react-native-wallet/lib/typescript/src/NativeWallet';
import type {Card} from '@src/types/onyx';

export default function handleAddCardToWallet(card: Card, cardHolderName: string) {
    const address = {
        name: cardHolderName,
        addressOne: '123',
        administrativeArea: '123',
        locality: '123',
        countryCode: '123',
        postalCode: '123',
        phoneNumber: '123 213 752',
    } as UserAddress;

    const data = {
        lastDigits: card.lastFourPAN,
        network: 'VISA',
        opaquePaymentCard: '123 test',
        cardHolderName,
        userAddress: address,
    } as AndroidCardData;

    addCardToGoogleWallet(data)
        .then(() => console.log('DONE'))
        .catch((e) => {
            console.log('ADD ERROR: ', e);
        });
}
