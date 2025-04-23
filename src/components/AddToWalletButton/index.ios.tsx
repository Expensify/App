import {AddToWalletButton as RNAddToWalletButton} from '@expensify/react-native-wallet';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import {checkIfWalletIsAvailable, handleAddCardToWallet, isCardInWallet} from '@libs/Wallet/index';
import type AddToWalletButtonProps from './types';

function AddToWalletButton({card, cardHolderName, cardDescription, buttonStyle}: AddToWalletButtonProps) {
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
        handleAddCardToWallet(card, cardHolderName, cardDescription, checkIfCardIsInWallet);
    }, [card, cardDescription, cardHolderName, checkIfCardIsInWallet]);

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
        <RNAddToWalletButton
            buttonStyle={buttonStyle}
            locale="en"
            onPress={handleOnPress}
        />
    );
}

AddToWalletButton.displayName = 'AddToWalletButton';

export default AddToWalletButton;
