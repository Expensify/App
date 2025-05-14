import {addCardToGoogleWallet, checkWalletAvailability, getCardStatusBySuffix, getSecureWalletInfo} from '@expensify/react-native-wallet';
import type {AndroidCardData, AndroidWalletData, CardStatus, TokenizationStatus} from '@expensify/react-native-wallet';
import {Alert} from 'react-native';
import {openWalletPage} from '@libs/actions/PaymentMethods';
import {createDigitalGoogleWallet} from '@libs/actions/Wallet';
import Log from '@libs/Log';
import type {Card} from '@src/types/onyx';

function checkIfWalletIsAvailable(): Promise<boolean> {
    return checkWalletAvailability();
}

function handleAddCardToWallet(card: Card, cardHolderName: string, cardDescription: string, onFinished?: () => void) {
    getSecureWalletInfo()
        .then((walletData: AndroidWalletData) => {
            createDigitalGoogleWallet({cardHolderName, ...walletData})
                .then((cardData: AndroidCardData) => {
                    addCardToGoogleWallet(cardData)
                        .then((status: TokenizationStatus) => {
                            if (status === 'success') {
                                Log.info('Card added to wallet');
                                openWalletPage();
                            } else {
                                onFinished?.();
                            }
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
    if (!card.lastFourPAN) {
        return Promise.resolve(false);
    }
    return getCardStatusBySuffix(card.lastFourPAN)
        .then((status: CardStatus) => {
            Log.info(`Card status: ${status}`);
            return status === 'active';
        })
        .catch((error) => {
            Log.warn(`getCardTokenStatus error: ${error}`);
            return false;
        });
}

export {handleAddCardToWallet, isCardInWallet, checkIfWalletIsAvailable};
