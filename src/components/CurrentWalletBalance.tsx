import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';
import type UserWallet from '@src/types/onyx/UserWallet';
import Balance from './Balance';

type CurrentWalletBalanceOnyxProps = {
    /** The user's wallet account */
    userWallet: OnyxEntry<UserWallet>;
};

type CurrentWalletBalanceProps = CurrentWalletBalanceOnyxProps & {
    balanceStyles?: StyleProp<TextStyle>;
};

function CurrentWalletBalance({userWallet, balanceStyles}: CurrentWalletBalanceProps) {
    const styles = useThemeStyles();

    return (
        <Balance
            textStyles={[styles.pv5, styles.alignSelfCenter, balanceStyles]}
            balance={userWallet?.currentBalance ?? 0}
        />
    );
}

CurrentWalletBalance.displayName = 'CurrentWalletBalance';

export default withOnyx<CurrentWalletBalanceProps, CurrentWalletBalanceOnyxProps>({
    userWallet: {
        key: ONYXKEYS.USER_WALLET,
    },
})(CurrentWalletBalance);
