import {addCardToGoogleWallet, checkWalletAvailability, getCardStatusByIdentifier, getSecureWalletInfo} from '@expensify/react-native-wallet';
import type {AndroidCardData, AndroidWalletData, CardStatus} from '@expensify/react-native-wallet';
import {Alert} from 'react-native';
import useOnyx from '@hooks/useOnyx';
import {createDigitalGoogleWallet} from '@libs/actions/Wallet';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card} from '@src/types/onyx';

function checkIfWalletIsAvailable(): Promise<boolean> {
    return checkWalletAvailability();
}

function handleAddCardToWallet(card: Card, cardHolderName: string, onFinished?: () => void) {
    getSecureWalletInfo()
        .then((walletData: AndroidWalletData) => {
            createDigitalGoogleWallet(walletData)
                .then(() => {
                    const [onyxData] = useOnyx(ONYXKEYS.CARD_ADDED_TO_WALLET);
                    if (!onyxData) {
                        return Promise.reject();
                    }
                    const cardData: AndroidCardData = {
                        network: onyxData.network,
                        opaquePaymentCard: onyxData.opaquePaymentCard,
                        cardHolderName,
                        lastDigits: onyxData.lastDigits,
                        userAddress: {
                            name: onyxData.userAddress.name,
                            addressOne: onyxData.userAddress.address1,
                            addressTwo: onyxData.userAddress.address2,
                            administrativeArea: onyxData.userAddress.state,
                            locality: onyxData.userAddress.city,
                            countryCode: onyxData.userAddress.country,
                            postalCode: onyxData.userAddress.postal_code,
                            phoneNumber: onyxData.userAddress.phone,
                        },
                    };
                    addCardToGoogleWallet({...cardData, cardHolderName})
                        .then(() => {
                            Log.info('Card added to wallet');
                            onFinished?.();
                        })
                        .catch((error) => {
                            Log.warn(`addCardToGoogleWallet error: ${error}`);
                            Alert.alert('Failed to add card to wallet', 'Please try again later.');
                        });
                })
                .catch((error) => Log.warn(`createDigitalWallet error: ${error}`));
        })
        .catch((error) => Log.warn(`getSecureWalletInfo error: ${error}`));
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
