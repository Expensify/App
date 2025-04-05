import {AddToWalletButton} from '@expensify/react-native-wallet';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import type {ViewStyle} from 'react-native';
import Text from '@components/Text';
import type {Card} from '@src/types/onyx';
import {checkIfWalletIsAvailable, handleAddCardToWallet, isCardInWallet} from './index';

type AddToWalletButtonProps = {
    card: Card;
    cardHolderName?: string;
    buttonStyle?: ViewStyle;
};

function RNAddToWalletButton({card, cardHolderName, buttonStyle}: AddToWalletButtonProps) {
    const [isWalletAvailable, setIsWalletAvailable] = React.useState<boolean>(false);
    const [isInWallet, setIsInWallet] = React.useState<boolean | null>(null);

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
        checkIfCardIsInWallet();
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
                <Text>Card is already in wallet</Text>;
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
