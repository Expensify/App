import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import ONYXKEYS from '@src/ONYXKEYS';

import type {StyleProp, TextStyle} from 'react-native';

import React from 'react';

import Balance from './Balance';

type CurrentWalletBalanceProps = {
    balanceStyles?: StyleProp<TextStyle>;
};

function CurrentWalletBalance({balanceStyles}: CurrentWalletBalanceProps) {
    const styles = useThemeStyles();
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);

    return (
        <Balance
            textStyles={[styles.pv5, styles.alignSelfCenter, balanceStyles]}
            balance={userWallet?.currentBalance ?? 0}
        />
    );
}

export default CurrentWalletBalance;
