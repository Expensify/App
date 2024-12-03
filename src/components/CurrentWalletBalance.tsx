import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type UserWallet from '@src/types/onyx/UserWallet';
import Text from './Text';

type CurrentWalletBalanceOnyxProps = {
    /** The user's wallet account */
    userWallet: OnyxEntry<UserWallet>;
};

type CurrentWalletBalanceProps = CurrentWalletBalanceOnyxProps & {
    balanceStyles?: StyleProp<TextStyle>;
};

function CurrentWalletBalance({userWallet, balanceStyles}: CurrentWalletBalanceProps) {
    const styles = useThemeStyles();
    const formattedBalance = CurrencyUtils.convertToDisplayString(userWallet?.currentBalance ?? 0);
    return <Text style={[styles.pv5, styles.alignSelfCenter, styles.textHeadline, styles.textXXXLarge, balanceStyles]}>{formattedBalance}</Text>;
}

CurrentWalletBalance.displayName = 'CurrentWalletBalance';

export default withOnyx<CurrentWalletBalanceProps, CurrentWalletBalanceOnyxProps>({
    userWallet: {
        key: ONYXKEYS.USER_WALLET,
    },
})(CurrentWalletBalance);
