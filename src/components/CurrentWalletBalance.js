import React from 'react';
import {ActivityIndicator, Text} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import styles from '../styles/styles';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import themeColors from '../styles/themes/default';
import ONYXKEYS from '../ONYXKEYS';

const propTypes = {
    /** The user's wallet account */
    userWallet: PropTypes.shape({
        /** The user's current wallet balance */
        availableBalance: PropTypes.number,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    userWallet: {},
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

    return (
        <Text
            style={[styles.textXXXLarge, styles.pv5, styles.alignSelfCenter]}
        >
            {`$${props.userWallet.availableBalance}`}
        </Text>
    );
};

CurrentWalletBalance.propTypes = propTypes;
CurrentWalletBalance.defaultProps = defaultProps;
CurrentWalletBalance.displayName = 'ConfirmModal';
export default compose(
    withLocalize,
    withOnyx({
        userWallet: {
            key: ONYXKEYS.USER_WALLET,
        },
    }),
)(CurrentWalletBalance);
