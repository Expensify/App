import ActivityIndicator from '@components/ActivityIndicator';

import useThemeStyles from '@hooks/useThemeStyles';

import {getPaymentMethods} from '@libs/actions/PaymentMethods';
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {checkIfWalletIsAvailable, handleAddCardToWallet} from '@libs/Wallet/index';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import type {TokenizationStatus} from '@expensify/react-native-wallet';

import {AddToWalletButton as RNAddToWalletButton} from '@expensify/react-native-wallet';
import React, {useCallback, useEffect, useState} from 'react';
import {Alert} from 'react-native';

import type AddToWalletButtonProps from './types';

import useIsCardInWallet from './useIsCardInWallet';

function AddToWalletButton({card, cardHolderName, cardDescription, style}: AddToWalletButtonProps) {
    const [isWalletAvailable, setIsWalletAvailable] = React.useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(false);
    const isIOS = getPlatform() === CONST.PLATFORM.IOS;
    const styles = useThemeStyles();
    const {isInWallet, isLoading: isCardLoading, isCardAvailable} = useIsCardInWallet(card);

    const handleOnPress = useCallback(() => {
        setIsLoading(true);
        handleAddCardToWallet(card, cardHolderName, cardDescription, () => setIsLoading(false))
            .then((status: TokenizationStatus) => {
                if (status === 'success') {
                    Log.info('Card added to wallet');
                    getPaymentMethods();
                    if (isIOS) {
                        Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_ADDED_TO_WALLET.getRoute(String(card.cardID)));
                    }
                } else {
                    setIsLoading(false);
                }
            })
            .catch((error) => {
                setIsLoading(false);
                Log.warn(`Error while adding card to wallet: ${error}`);
                Alert.alert('Failed to add card to wallet', 'Please try again later.');
            });
    }, [card, cardDescription, cardHolderName, isIOS]);

    useEffect(() => {
        if (!isCardAvailable) {
            return;
        }

        checkIfWalletIsAvailable()
            .then((result) => {
                setIsWalletAvailable(result);
            })
            .catch(() => {
                setIsWalletAvailable(false);
            });
    }, [isCardAvailable]);

    if (!isWalletAvailable || isInWallet == null || isInWallet || !isCardAvailable) {
        return null;
    }

    if (isLoading || isCardLoading) {
        return <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />;
    }

    // The system provides control over the correct appearance and language
    return (
        <RNAddToWalletButton
            style={[styles.addToWalletButtonStyles, style]}
            buttonType="badge"
            buttonStyle="blackOutline"
            onPress={handleOnPress}
        />
    );
}

export default AddToWalletButton;
