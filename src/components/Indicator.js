import _ from 'underscore';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import styles from '../styles/styles';
import ONYXKEYS from '../ONYXKEYS';
import policyMemberPropType from '../pages/policyMemberPropType';
import bankAccountPropTypes from './bankAccountPropTypes';
import cardPropTypes from './cardPropTypes';
import userWalletPropTypes from '../pages/EnablePayments/userWalletPropTypes';
import {policyPropTypes} from '../pages/workspace/withPolicy';
import walletTermsPropTypes from '../pages/EnablePayments/walletTermsPropTypes';
import * as PolicyUtils from '../libs/PolicyUtils';
import * as PaymentMethods from '../libs/actions/PaymentMethods';
import * as ReimbursementAccountProps from '../pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as UserUtils from '../libs/UserUtils';
import themeColors from '../styles/themes/default';

const propTypes = {
    /* Onyx Props */

    /** The employee list of all policies (coming from Onyx) */
    allPolicyMembers: PropTypes.objectOf(PropTypes.objectOf(policyMemberPropType)),

    /** All the user's policies (from Onyx via withFullPolicy) */
    policies: PropTypes.objectOf(policyPropTypes.policy),

    /** List of bank accounts */
    bankAccountList: PropTypes.objectOf(bankAccountPropTypes),

    /** List of user cards */
    fundList: PropTypes.objectOf(cardPropTypes),

    /** The user's wallet (coming from Onyx) */
    userWallet: userWalletPropTypes,

    /** Bank account attached to free plan */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes,

    /** Information about the user accepting the terms for payments */
    walletTerms: walletTermsPropTypes,

    /** Login list for the user that is signed in */
    loginList: PropTypes.shape({
        /** Date login was validated, used to show info indicator status */
        validatedDate: PropTypes.string,

        /** Field-specific server side errors keyed by microtime */
        errorFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
    }),
};

const defaultProps = {
    reimbursementAccount: {},
    allPolicyMembers: {},
    policies: {},
    bankAccountList: {},
    fundList: null,
    userWallet: {},
    walletTerms: {},
    loginList: {},
};

function Indicator(props) {
    // If a policy was just deleted from Onyx, then Onyx will pass a null value to the props, and
    // those should be cleaned out before doing any error checking
    const cleanPolicies = _.pick(props.policies, (policy) => policy);
    const cleanAllPolicyMembers = _.pick(props.allPolicyMembers, (policyMembers) => policyMembers);

    const paymentCardList = props.fundList || {};

    // All of the error & info-checking methods are put into an array. This is so that using _.some() will return
    // early as soon as the first error / info condition is returned. This makes the checks very efficient since
    // we only care if a single error / info condition exists anywhere.
    const errorCheckingMethods = [
        () => !_.isEmpty(props.userWallet.errors),
        () => PaymentMethods.hasPaymentMethodError(props.bankAccountList, paymentCardList),
        () => _.some(cleanPolicies, PolicyUtils.hasPolicyError),
        () => _.some(cleanPolicies, PolicyUtils.hasCustomUnitsError),
        () => _.some(cleanAllPolicyMembers, PolicyUtils.hasPolicyMemberError),
        () => !_.isEmpty(props.reimbursementAccount.errors),
        () => UserUtils.hasLoginListError(props.loginList),

        // Wallet term errors that are not caused by an IOU (we show the red brick indicator for those in the LHN instead)
        () => !_.isEmpty(props.walletTerms.errors) && !props.walletTerms.chatReportID,
    ];
    const infoCheckingMethods = [() => UserUtils.hasLoginListInfo(props.loginList)];
    const shouldShowErrorIndicator = _.some(errorCheckingMethods, (errorCheckingMethod) => errorCheckingMethod());
    const shouldShowInfoIndicator = !shouldShowErrorIndicator && _.some(infoCheckingMethods, (infoCheckingMethod) => infoCheckingMethod());

    const indicatorColor = shouldShowErrorIndicator ? themeColors.danger : themeColors.success;
    const indicatorStyles = [styles.alignItemsCenter, styles.justifyContentCenter, styles.statusIndicator(indicatorColor)];

    return (shouldShowErrorIndicator || shouldShowInfoIndicator) && <View style={StyleSheet.flatten(indicatorStyles)} />;
}

Indicator.defaultProps = defaultProps;
Indicator.propTypes = propTypes;
Indicator.displayName = 'Indicator';

export default withOnyx({
    allPolicyMembers: {
        key: ONYXKEYS.COLLECTION.POLICY_MEMBERS,
    },
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
    },
    bankAccountList: {
        key: ONYXKEYS.BANK_ACCOUNT_LIST,
    },
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    fundList: {
        key: ONYXKEYS.FUND_LIST,
    },
    userWallet: {
        key: ONYXKEYS.USER_WALLET,
    },
    walletTerms: {
        key: ONYXKEYS.WALLET_TERMS,
    },
    loginList: {
        key: ONYXKEYS.LOGIN_LIST,
    },
})(Indicator);
