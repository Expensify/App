import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import compose from '@libs/compose';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import styles from '@styles/styles';
import ONYXKEYS from '@src/ONYXKEYS';
import Text from './Text';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** The user's wallet account */
    userWallet: PropTypes.shape({
        /** The user's current wallet balance */
        currentBalance: PropTypes.number,
    }),

    /** Styles of the amount */
    // eslint-disable-next-line react/forbid-prop-types
    balanceStyles: PropTypes.arrayOf(PropTypes.object),

    ...withLocalizePropTypes,
};

const defaultProps = {
    userWallet: {
        // Default to zero if userWallet and currentBalance is not set yet to avoid NaN
        currentBalance: 0,
    },
    balanceStyles: [],
};

function CurrentWalletBalance(props) {
    const formattedBalance = CurrencyUtils.convertToDisplayString(props.userWallet.currentBalance);
    return <Text style={[styles.pv5, styles.alignSelfCenter, styles.textHeadline, styles.textXXXLarge, ...props.balanceStyles]}>{`${formattedBalance}`}</Text>;
}

CurrentWalletBalance.propTypes = propTypes;
CurrentWalletBalance.defaultProps = defaultProps;
CurrentWalletBalance.displayName = 'CurrentWalletBalance';
export default compose(
    withLocalize,
    withOnyx({
        userWallet: {
            key: ONYXKEYS.USER_WALLET,
        },
    }),
)(CurrentWalletBalance);
