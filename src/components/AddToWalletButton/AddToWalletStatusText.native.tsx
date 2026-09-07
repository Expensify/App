import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import getPlatform from '@libs/getPlatform';

import CONST from '@src/CONST';
import type {Card} from '@src/types/onyx';

import type {ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import useIsCardInWallet from './useIsCardInWallet';

function AddToWalletStatusText({card, style}: {card: Card; style?: ViewStyle}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const platform = getPlatform() === CONST.PLATFORM.IOS ? 'Apple' : 'Google';
    const {isInWallet} = useIsCardInWallet(card);

    // if (!isInWallet) {
    //     return null;
    // }

    return (
        <View style={style}>
            <Text style={[styles.textLabelSupporting, styles.ph5]}>{translate('cardPage.cardAddedToWallet', {platform})}</Text>
        </View>
    );
}

export default AddToWalletStatusText;
