import React from 'react';
import {ActivityIndicator} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import styles from '../styles/styles';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import themeColors from '../styles/themes/default';
import ONYXKEYS from '../ONYXKEYS';
import Text from './Text';

const propTypes = {
    /** The user's wallet account */
    userWallet: PropTypes.shape({
        /** The user's current wallet balance */
        currentBalance: PropTypes.number,
    }),

    /** Styles of the amount */
    balanceStyles: PropTypes.arrayOf(PropTypes.object),

    ...withLocalizePropTypes,
};

const defaultProps = {
    userWallet: {},
    balanceStyles: [],
};

const CurrentWalletBalance = (props) => {
    if (_.isEmpty(props.userWallet)) {
        return (
            <ActivityIndicator
                color={themeColors.text}
                size="large"
                style={styles.pv5}
            />
        );
    }

    const formattedBalance = props.numberFormat(
        props.userWallet.currentBalance / 100, // Divide by 100 because balance is in cents
        {style: 'currency', currency: 'USD'},
    );
    return (
        <Text
            style={[styles.textXXXLarge, styles.pv5, styles.alignSelfCenter, ...props.balanceStyles]}
        >
            {`${formattedBalance}`}
        </Text>
    );
};

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
