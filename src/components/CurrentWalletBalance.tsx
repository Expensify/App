import React from 'react';
import PropTypes from 'prop-types';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import {TextStyle} from 'react-native';
import styles from '../styles/styles';
import ONYXKEYS from '../ONYXKEYS';
import Text from './Text';
import * as CurrencyUtils from '../libs/CurrencyUtils';
import UserWallet from '../types/onyx/UserWallet';

type CurrentWalletBalanceOnyxProps = {
    /** The user's wallet account */
    userWallet: OnyxEntry<UserWallet>;
};

type CurrentWalletBalanceProps = CurrentWalletBalanceOnyxProps & {
    balanceStyles?: TextStyle[];
};

function CurrentWalletBalance({userWallet, balanceStyles = []}: CurrentWalletBalanceProps) {
    const formattedBalance = CurrencyUtils.convertToDisplayString(userWallet?.currentBalance ?? 0);
    return <Text style={[styles.pv5, styles.alignSelfCenter, styles.textHeadline, styles.textXXXLarge, ...balanceStyles]}>{`${formattedBalance}`}</Text>;
}

CurrentWalletBalance.displayName = 'CurrentWalletBalance';

export default withOnyx<CurrentWalletBalanceProps, CurrentWalletBalanceOnyxProps>({
    userWallet: {
        key: ONYXKEYS.USER_WALLET,
    },
})(CurrentWalletBalance);
