import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Text from './Text';

type BalanceProps = {
    textStyles?: StyleProp<TextStyle>;
    balance: number;
};

function Balance({textStyles, balance}: BalanceProps) {
    const styles = useThemeStyles();
    const formattedBalance = CurrencyUtils.convertToDisplayString(balance);

    return <Text style={[styles.textHeadline, styles.textXXXLarge, textStyles]}>{formattedBalance}</Text>;
}

export default Balance;
