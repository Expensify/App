import {AddToWalletButton as RNAddToWalletButton} from '@expensify/react-native-wallet';
import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import {handleAddCardToWallet, isCardInWallet} from '@libs/Wallet/index';
import CONST from '@src/CONST';
import type AddToWalletButtonProps from './types';

function AddToWalletButton({card, cardHolderName, cardDescription, buttonStyle}: AddToWalletButtonProps) {
    const [isInWallet, setIsInWallet] = React.useState<boolean | null>(null);
    const {translate} = useLocalize();
    const isCardAvailable = card.state === CONST.EXPENSIFY_CARD.STATE.OPEN;
    const [isLoading, setIsLoading] = useState(false);
    const theme = useTheme();
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
        handleAddCardToWallet(card, cardHolderName, cardDescription, () => setIsLoading(false));
    }, [card, cardDescription, cardHolderName]);

    useEffect(() => {
        if (!isCardAvailable) {
            return;
        }

        checkIfCardIsInWallet();
    }, [checkIfCardIsInWallet, isCardAvailable, card]);

    if (isInWallet == null || !isCardAvailable) {
        return null;
    }

    if (isLoading) {
        return (
            <ActivityIndicator
                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                color={theme.spinner}
            />
        );
    }

    if (isInWallet) {
        return (
            <View style={buttonStyle}>
                <Text style={[styles.textLabelSupporting, styles.mt6]}>{translate('cardPage.cardAddedToWallet', {platform})}</Text>
            </View>
        );
    }

    return (
        <RNAddToWalletButton
            buttonStyle={buttonStyle}
            locale="en"
            onPress={handleOnPress}
        />
    );
}

AddToWalletButton.displayName = 'AddToWalletButton';

export default AddToWalletButton;
