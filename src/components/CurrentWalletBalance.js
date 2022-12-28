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
    // eslint-disable-next-line react/forbid-prop-types
    balanceStyles: PropTypes.arrayOf(PropTypes.object),

    showActivityIndicator: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    userWallet: {},
    balanceStyles: [],
    showActivityIndicator: null,
};

const CurrentWalletBalance = (props) => {
    // Show spinner if we are still waiting on userWallet to load unless we are specifically dictating
    // behavior with the prop showActivityIndicator
    const isShowActivityIndicatorSet = props.showActivityIndicator !== null;
    if ((isShowActivityIndicatorSet && props.showActivityIndicator) || (!isShowActivityIndicatorSet && _.isEmpty(props.userWallet))) {
        return (
            <ActivityIndicator
                color={themeColors.text}
                size="large"
                style={styles.pv5}
            />
        );
    }

    const formattedBalance = props.numberFormat(

        // Divide by 100 because balance is in cents. Default to zero if userWallet and currentBalance is not set yet to avoid NaN
        (props.userWallet.currentBalance || 0) / 100,
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
