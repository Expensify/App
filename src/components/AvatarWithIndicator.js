import _ from 'underscore';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Avatar from './Avatar';
import styles from '../styles/styles';
import Tooltip from './Tooltip';
import ONYXKEYS from '../ONYXKEYS';
import policyMemberPropType from '../pages/policyMemberPropType';
import bankAccountPropTypes from './bankAccountPropTypes';
import cardPropTypes from './cardPropTypes';
import userWalletPropTypes from '../pages/EnablePayments/userWalletPropTypes';
import walletTermsPropTypes from '../pages/EnablePayments/walletTermsPropTypes';
import * as Policy from '../libs/actions/Policy';
import * as PaymentMethods from '../libs/actions/PaymentMethods';

const propTypes = {
    /** URL for the avatar */
    source: PropTypes.string.isRequired,

    /** Avatar size */
    size: PropTypes.string,

    /** To show a tooltip on hover */
    tooltipText: PropTypes.string,

    /** The employee list of all policies (coming from Onyx) */
    policiesMemberList: PropTypes.objectOf(policyMemberPropType),

    /** List of bank accounts */
    bankAccountList: PropTypes.objectOf(bankAccountPropTypes),

    /** List of cards */
    cardList: PropTypes.objectOf(cardPropTypes),

    /** The user's wallet (coming from Onyx) */
    userWallet: PropTypes.objectOf(userWalletPropTypes),

    /** Information about the user accepting the terms for payments */
    walletTerms: PropTypes.objectOf(walletTermsPropTypes),
};

const defaultProps = {
    size: 'default',
    tooltipText: '',
    policiesMemberList: {},
    bankAccountList: {},
    cardList: {},
    userWallet: {},
    walletTerms: {},
};

const AvatarWithIndicator = (props) => {
    const isLarge = props.size === 'large';
    const indicatorStyles = [
        styles.alignItemsCenter,
        styles.justifyContentCenter,
        isLarge ? styles.statusIndicatorLarge : styles.statusIndicator,
    ];

    const hasPolicyMemberError = _.some(props.policiesMemberList, policyMembers => Policy.hasPolicyMemberError(policyMembers));
    const hasPaymentMethodError = PaymentMethods.hasPaymentMethodError(props.bankAccountList, props.cardList);
    const hasWalletError = !_.isEmpty(props.userWallet.errors);
    const hasWalletTermsError = !_.isEmpty(props.walletTerms.errors);
    return (
        <View style={[isLarge ? styles.avatarLarge : styles.sidebarAvatar]}>
            <Tooltip text={props.tooltipText}>
                <Avatar
                    imageStyles={[isLarge ? styles.avatarLarge : null]}
                    source={props.source}
                    size={props.size}
                />
                {(hasPolicyMemberError || hasPaymentMethodError || hasWalletError || hasWalletTermsError) && (
                    <View style={StyleSheet.flatten(indicatorStyles)} />
                )}
            </Tooltip>
        </View>
    );
};

AvatarWithIndicator.defaultProps = defaultProps;
AvatarWithIndicator.propTypes = propTypes;
AvatarWithIndicator.displayName = 'AvatarWithIndicator';

export default withOnyx({
    policiesMemberList: {
        key: ONYXKEYS.COLLECTION.POLICY_MEMBER_LIST,
    },
    bankAccountList: {
        key: ONYXKEYS.BANK_ACCOUNT_LIST,
    },
    cardList: {
        key: ONYXKEYS.CARD_LIST,
    },
    userWallet: {
        key: ONYXKEYS.USER_WALLET,
    },
    walletTerms: {
        key: ONYXKEYS.WALLET_TERMS,
    },
})(AvatarWithIndicator);
