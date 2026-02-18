import {AddToWalletButton as RNAddToWalletButton} from '@expensify/react-native-wallet';
import type {TokenizationStatus} from '@expensify/react-native-wallet';
import React, {useCallback, useEffect, useState} from 'react';
import {Alert, View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import Text from '@components/Text';
import useAppFocusEvent from '@hooks/useAppFocusEvent';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getPaymentMethods} from '@libs/actions/PaymentMethods';
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import {checkIfWalletIsAvailable, handleAddCardToWallet, isCardInWallet} from '@libs/Wallet/index';
import CONST from '@src/CONST';
import type AddToWalletButtonProps from './types';

function AddToWalletButton({card, cardHolderName, cardDescription, style}: AddToWalletButtonProps) {
    const [isWalletAvailable, setIsWalletAvailable] = React.useState<boolean>(false);
    const [isInWallet, setIsInWallet] = React.useState<boolean | null>(null);
    const {translate} = useLocalize();
    const isCardAvailable = card.state === CONST.EXPENSIFY_CARD.STATE.OPEN;
    const [isLoading, setIsLoading] = useState(false);
    const platform = getPlatform() === CONST.PLATFORM.IOS ? 'Apple' : 'Google';
    const styles = useThemeStyles();

    const checkIfCardIsInWallet = useCallback(() => {
        isCardInWallet(card)
            .then((result) => {
                setIsInWallet(result);
            })
            .catch(() => {
                setIsInWallet(false);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [card]);

    const handleOnPress = useCallback(() => {
        setIsLoading(true);
        handleAddCardToWallet(card, cardHolderName, cardDescription, () => setIsLoading(false))
            .then((status: TokenizationStatus) => {
                if (status === 'success') {
                    Log.info('Card added to wallet');
                    getPaymentMethods();
                } else {
                    setIsLoading(false);
                }
            })
            .catch((error) => {
                setIsLoading(false);
                Log.warn(`Error while adding card to wallet: ${error}`);
                Alert.alert('Failed to add card to wallet', 'Please try again later.');
            });
    }, [card, cardDescription, cardHolderName]);

    useEffect(() => {
        if (!isCardAvailable) {
            return;
        }

        checkIfCardIsInWallet();
    }, [checkIfCardIsInWallet, isCardAvailable, card]);

    // Recheck card status when app regains focus in case user manually adds card to wallet outside the app
    useAppFocusEvent(
        useCallback(() => {
            if (!isCardAvailable) {
                return;
            }
            checkIfCardIsInWallet();
        }, [checkIfCardIsInWallet, isCardAvailable]),
    );

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

    if (!isWalletAvailable || isInWallet == null || !isCardAvailable) {
        return null;
    }

    if (isLoading) {
        return <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />;
    }

    if (isInWallet) {
        return (
            <View style={style}>
                <Text style={[styles.textLabelSupporting, styles.mt6]}>{translate('cardPage.cardAddedToWallet', {platform})}</Text>
            </View>
        );
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
