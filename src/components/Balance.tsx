import React from 'react';
import type {TextStyle} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Text from './Text';

type BalanceProps = {
    style?: TextStyle;
    balance: number;
};

function Balance({style, balance}: BalanceProps) {
    const styles = useThemeStyles();
    const formattedBalance = CurrencyUtils.convertToDisplayString(balance);
    return <Text style={[styles.textHeadline, styles.textXXXLarge, style]}>{formattedBalance}</Text>;
}

Balance.displayName = 'Balance';

export default Balance;
