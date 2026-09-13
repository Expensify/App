import useIsCardInWallet from '@components/AddToWalletButton/useIsCardInWallet';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import getPlatform from '@libs/getPlatform';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type AddToWalletStatusTextProps from './types';

const platform = getPlatform() === CONST.PLATFORM.IOS ? 'Apple' : 'Google';

function AddToWalletStatusText({card, style}: AddToWalletStatusTextProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isInWallet, isLoading: isCardLoading, isCardAvailable, isWalletAvailable} = useIsCardInWallet(card);

    if (!isWalletAvailable || !isCardAvailable || isCardLoading || !isInWallet) {
        return null;
    }

    return (
        <View style={style}>
            <Text style={[styles.textLabelSupporting, styles.ph5, styles.pv5]}>{translate('cardPage.cardAddedToWallet', {platform})}</Text>
        </View>
    );
}

export default AddToWalletStatusText;
