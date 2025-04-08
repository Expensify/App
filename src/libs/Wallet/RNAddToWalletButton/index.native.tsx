import {AddToWalletButton} from '@expensify/react-native-wallet';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import {checkIfWalletIsAvailable, handleAddCardToWallet, isCardInWallet} from '..';
import type AddToWalletButtonProps from './types';

function RNAddToWalletButton({card, cardHolderName, buttonStyle}: AddToWalletButtonProps) {
    const [isWalletAvailable, setIsWalletAvailable] = React.useState<boolean>(false);
    const [isInWallet, setIsInWallet] = React.useState<boolean | null>(null);
    const {translate} = useLocalize();

    const checkIfCardIsInWallet = useCallback(() => {
        isCardInWallet(card)
            .then((result) => {
                setIsInWallet(result);
            })
            .catch(() => {
                setIsInWallet(false);
            });
    }, [card]);

    const handleOnPress = useCallback(() => {
        handleAddCardToWallet(card, cardHolderName ?? '', checkIfCardIsInWallet);
    }, [card, cardHolderName, checkIfCardIsInWallet]);

    useEffect(() => {
        checkIfCardIsInWallet();
    }, [checkIfCardIsInWallet]);

    useEffect(() => {
        checkIfWalletIsAvailable()
            .then((result) => {
                setIsWalletAvailable(result);
            })
            .catch(() => {
                setIsWalletAvailable(false);
            });
    }, []);

    if (!isWalletAvailable || isInWallet == null) {
        return null;
    }

    if (isInWallet) {
        return (
            <View style={buttonStyle}>
                <Text>{translate('cardPage.cardAlreadyInWallet')}</Text>;
            </View>
        );
    }

    return (
        <AddToWalletButton
            buttonStyle={buttonStyle}
            locale="en"
            onPress={handleOnPress}
        />
    );
}

export default RNAddToWalletButton;
