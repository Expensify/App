import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Text from './Text';

type BalanceProps = {
    textStyles?: StyleProp<TextStyle>;
    balance: number;
};

function Balance({textStyles, balance}: BalanceProps) {
    const {convertToDisplayString} = useCurrencyListActions();
    const styles = useThemeStyles();
    const formattedBalance = convertToDisplayString(balance, CONST.CURRENCY.USD);

    return <Text style={[styles.textHeadline, styles.textXXXLarge, textStyles]}>{formattedBalance}</Text>;
}

export default Balance;
