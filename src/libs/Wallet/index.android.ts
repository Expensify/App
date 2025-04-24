import {addCardToGoogleWallet, checkWalletAvailability, getCardStatusByIdentifier, getSecureWalletInfo} from '@expensify/react-native-wallet';
import type {AndroidCardData, AndroidWalletData, CardStatus} from '@expensify/react-native-wallet';
import {Alert} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {clearNewCardOnyxData, createDigitalGoogleWallet} from '@libs/actions/Wallet';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardAddedToWallet} from '@src/types/onyx';

function checkIfWalletIsAvailable(): Promise<boolean> {
    return checkWalletAvailability();
}
let isWalletScreenOpen: boolean;

function handleAddCardToWallet(card: Card, cardHolderName: string, cardDescription: string, onFinished?: () => void) {
    isWalletScreenOpen = false;
    Onyx.connect({
        key: ONYXKEYS.CARD_ADDED_TO_WALLET,
        callback: addToGoogleWalletCallback(cardHolderName, onFinished),
    });

    getSecureWalletInfo()
        .then((walletData: AndroidWalletData) => createDigitalGoogleWallet(walletData))
        .catch((error) => Log.warn(`getSecureWalletInfo error: ${error}`));
}

function addToGoogleWalletCallback(cardHolderName: string, onFinished?: () => void) {
    return (value: OnyxEntry<CardAddedToWallet> | undefined) => {
        if (!value) {
            return;
        }
        const cardData: AndroidCardData = {
            network: value.network,
            opaquePaymentCard: value.opaquePaymentCard,
            cardHolderName,
            lastDigits: value.lastDigits,
            userAddress: {
                name: value.userAddress.name,
                addressOne: value.userAddress.address1,
                addressTwo: value.userAddress.address2,
                administrativeArea: value.userAddress.state,
                locality: value.userAddress.city,
                countryCode: value.userAddress.country,
                postalCode: value.userAddress.postal_code,
                phoneNumber: value.userAddress.phone,
            },
        };
        if (isWalletScreenOpen) {
            return;
        }
        isWalletScreenOpen = true;
        addCardToGoogleWallet(cardData)
            .then(() => {
                Log.info('Card added to wallet');
                onFinished?.();
                clearNewCardOnyxData();
            })
            .catch((error) => {
                Log.warn(`addCardToGoogleWallet error: ${error}`);
                Alert.alert('Failed to add card to wallet', 'Please try again later.');
            });
    };
}

function isCardInWallet(card: Card): Promise<boolean> {
    const tokenRefId = card.nameValuePairs?.expensifyCard_tokenReferenceIdList?.at(0);
    if (!tokenRefId) {
        return Promise.resolve(false);
    }
    return getCardStatusByIdentifier(tokenRefId, CONST.COMPANY_CARDS.CARD_TYPE.VISA)
        .then((status: CardStatus) => {
            Log.info(`Card status: ${status}`);
            return status === 'active';
        })
        .catch((error) => {
            Log.warn(`getCardTokenStatus error: ${error}`);
            return Promise.resolve(false);
        });
}

export {handleAddCardToWallet, isCardInWallet, checkIfWalletIsAvailable};
