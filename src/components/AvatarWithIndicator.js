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
import {policyPropTypes} from '../pages/workspace/withPolicy';
import walletTermsPropTypes from '../pages/EnablePayments/walletTermsPropTypes';
import * as PolicyUtils from '../libs/PolicyUtils';
import * as PaymentMethods from '../libs/actions/PaymentMethods';
import * as ReportUtils from '../libs/ReportUtils';

const propTypes = {
    /** URL for the avatar */
    source: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,

    /** Avatar size */
    size: PropTypes.string,

    /** To show a tooltip on hover */
    tooltipText: PropTypes.string,

    /** The employee list of all policies (coming from Onyx) */
    policiesMemberList: PropTypes.objectOf(policyMemberPropType),

    /** All the user's policies (from Onyx via withFullPolicy) */
    policies: PropTypes.objectOf(policyPropTypes.policy),

    /** List of bank accounts */
    bankAccountList: PropTypes.objectOf(bankAccountPropTypes),

    /** List of cards */
    cardList: PropTypes.objectOf(cardPropTypes),

    /** The user's wallet (coming from Onyx) */
    userWallet: userWalletPropTypes,

    /** Information about the user accepting the terms for payments */
    walletTerms: walletTermsPropTypes,
};

const defaultProps = {
    size: 'default',
    tooltipText: '',
    policiesMemberList: {},
    policies: {},
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

    // If a policy was just deleted from Onyx, then Onyx will pass a null value to the props, and
    // those should be cleaned out before doing any error checking
    const cleanPolicies = _.pick(props.policies, policy => policy);
    const cleanPolicyMembers = _.pick(props.policiesMemberList, member => member);

    // All of the error-checking methods are put into an array. This is so that using _.some() will return
    // early as soon as the first error is returned. This makes the error checking very efficient since
    // we only care if a single error exists anywhere.
    const errorCheckingMethods = [
        () => !_.isEmpty(props.userWallet.errors),
        () => PaymentMethods.hasPaymentMethodError(props.bankAccountList, props.cardList),
        () => _.some(cleanPolicies, PolicyUtils.hasPolicyError),
        () => _.some(cleanPolicies, PolicyUtils.hasCustomUnitsError),
        () => _.some(cleanPolicyMembers, PolicyUtils.hasPolicyMemberError),

        // Wallet term errors that are not caused by an IOU (we show the red brick indicator for those in the LHN instead)
        () => !_.isEmpty(props.walletTerms.errors) && !props.walletTerms.chatReportID,
    ];
    const shouldShowIndicator = _.some(errorCheckingMethods, errorCheckingMethod => errorCheckingMethod());

    return (
        <View style={[isLarge ? styles.avatarLarge : styles.sidebarAvatar]}>
            <Tooltip text={props.tooltipText}>
                <Avatar
                    imageStyles={[isLarge ? styles.avatarLarge : null]}
                    source={ReportUtils.getSmallSizeAvatar(props.source)}
                    size={props.size}
                />
                {shouldShowIndicator && (
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
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
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
