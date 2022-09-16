import React from 'react';
import {View, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import BankAccountManualStep from './BankAccountManualStep';
import BankAccountPlaidStep from './BankAccountPlaidStep';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import MenuItem from '../../components/MenuItem';
import * as Expensicons from '../../components/Icon/Expensicons';
import styles from '../../styles/styles';
import TextLink from '../../components/TextLink';
import Icon from '../../components/Icon';
import colors from '../../styles/colors';
import Navigation from '../../libs/Navigation/Navigation';
import CONST from '../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Text from '../../components/Text';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import ONYXKEYS from '../../ONYXKEYS';
import compose from '../../libs/compose';
import Section from '../../components/Section';
import * as Illustrations from '../../components/Icon/Illustrations';
import getPlaidDesktopMessage from '../../libs/getPlaidDesktopMessage';
import CONFIG from '../../CONFIG';
import ROUTES from '../../ROUTES';
import Button from '../../components/Button';

const propTypes = {
    /** The OAuth URI + stateID needed to re-initialize the PlaidLink after the user logs into their bank */
    receivedRedirectURI: PropTypes.string,

    /** During the OAuth flow we need to use the plaidLink token that we initially connected with */
    plaidLinkOAuthToken: PropTypes.string,

    /** Object with various information about the user */
    user: PropTypes.shape({
        /** Is the user account validated? */
        validated: PropTypes.bool,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    receivedRedirectURI: null,
    plaidLinkOAuthToken: '',
    user: {},
};

const BankAccountStep = (props) => {
    const shouldReinitializePlaidLink = props.plaidLinkOAuthToken && props.receivedRedirectURI && props.achData.subStep !== CONST.BANK_ACCOUNT.SUBSTEP.MANUAL;
    const subStep = shouldReinitializePlaidLink ? CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID : props.achData.subStep;
    const plaidDesktopMessage = getPlaidDesktopMessage();
    const bankAccountRoute = `${CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL}${ROUTES.BANK_ACCOUNT}`;

    if (subStep === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL) {
        return <BankAccountManualStep achData={props.achData} />;
    }

    if (subStep === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID) {
        return <BankAccountPlaidStep achData={props.achData} />;
    }

    /**
     * @returns {Boolean}
     */
    validate() {
        const errors = {};

        if (!CONST.BANK_ACCOUNT.REGEX.US_ACCOUNT_NUMBER.test(this.state.accountNumber.trim())) {
            errors.accountNumber = true;
        }
        if (!CONST.BANK_ACCOUNT.REGEX.SWIFT_BIC.test(this.state.routingNumber.trim()) || !ValidationUtils.isValidRoutingNumber(this.state.routingNumber.trim())) {
            errors.routingNumber = true;
        }
        if (!this.state.hasAcceptedTerms) {
            errors.hasAcceptedTerms = true;
        }

        BankAccounts.setBankAccountFormValidationErrors(errors);
        return _.size(errors) === 0;
    }

    /**
     * Clear the error associated to inputKey if found and store the inputKey new value in the state.
     *
     * @param {String} inputKey
     * @param {String} value
     */
    clearErrorAndSetValue(inputKey, value) {
        const newState = {[inputKey]: value};
        this.setState(newState);
        BankAccounts.updateReimbursementAccountDraft(newState);
        this.clearError(inputKey);
    }

    addManualAccount() {
        if (!this.validate()) {
            return;
        }

        BankAccounts.connectBankAccountManually(
            this.state.accountNumber,
            this.state.routingNumber,
            '',
        );
    }

    /**
     * Add the Bank account retrieved via Plaid in db
     */
    addPlaidAccount() {
        const selectedPlaidBankAccount = this.state.selectedPlaidBankAccount;
        if (!this.state.selectedPlaidBankAccount) {
            return;
        }
        BankAccounts.setupWithdrawalAccount({
            acceptTerms: true,
            setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID,

            // Params passed via the Plaid callback when an account is selected
            plaidAccessToken: selectedPlaidBankAccount.plaidAccessToken,
            accountNumber: selectedPlaidBankAccount.accountNumber,
            routingNumber: selectedPlaidBankAccount.routingNumber,
            plaidAccountID: selectedPlaidBankAccount.plaidAccountID,
            ownershipType: selectedPlaidBankAccount.ownershipType,
            isSavings: selectedPlaidBankAccount.isSavings,
            bankName: selectedPlaidBankAccount.bankName,
            addressName: selectedPlaidBankAccount.addressName,
            mask: selectedPlaidBankAccount.mask,

            // Note: These are hardcoded as we're not supporting AU bank accounts for the free plan
            country: CONST.COUNTRY.US,
            currency: CONST.CURRENCY.USD,
            fieldsType: CONST.BANK_ACCOUNT.FIELDS_TYPE.LOCAL,
        });
    }

    render() {
        // Disable bank account fields once they've been added in db so they can't be changed
        const isFromPlaid = this.props.achData.setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID;
        const shouldDisableInputs = Boolean(this.props.achData.bankAccountID) || isFromPlaid;
        const shouldReinitializePlaidLink = this.props.plaidLinkOAuthToken && this.props.receivedRedirectURI && this.props.achData.subStep !== CONST.BANK_ACCOUNT.SUBSTEP.MANUAL;
        const subStep = shouldReinitializePlaidLink ? CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID : this.props.achData.subStep;
        const plaidDesktopMessage = getPlaidDesktopMessage();
        const bankAccountRoute = `${CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL}${ROUTES.BANK_ACCOUNT}`;
        const errors = lodashGet(this.props, 'reimbursementAccount.errors', {});
        const errorMessage = _.isEmpty(errors) ? '' : _.last(_.values(errors));
        const error = lodashGet(this.props, 'reimbursementAccount.error', '') || errorMessage;
        const loading = lodashGet(this.props, 'reimbursementAccount.loading', false);
        const validated = lodashGet(this.props, 'user.validated', false);
        return (
            <View style={[styles.flex1, styles.justifyContentBetween]}>
                <HeaderWithCloseButton
                    title={this.props.translate('workspace.common.bankAccount')}
                    stepCounter={subStep ? {step: 1, total: 5} : undefined}
                    onCloseButtonPress={Navigation.dismissModal}
                    onBackButtonPress={() => {
                        // If we have a subStep then we will remove otherwise we will go back
                        if (subStep) {
                            BankAccounts.setBankAccountSubStep(null);
                            return;
                        }
                        Navigation.goBack();
                    }}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                    shouldShowBackButton
                />
                <Text style={[styles.mh5, styles.mb1]}>
                    {props.translate('bankAccount.toGetStarted')}
                </Text>
                {plaidDesktopMessage && (
                    <View style={[styles.m5, styles.flexRow, styles.justifyContentBetween]}>
                        <TextLink href={bankAccountRoute}>
                            {props.translate(plaidDesktopMessage)}
                        </TextLink>
                    </View>
                )}
                <Button
                    icon={Expensicons.Bank}
                    text={props.translate('bankAccount.connectOnlineWithPlaid')}
                    onPress={() => {
                        BankAccounts.clearPlaid();
                        BankAccounts.setBankAccountSubStep(CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID);
                    }}
                    disabled={props.isPlaidDisabled || !props.user.validated}
                    style={[styles.mt5, styles.buttonCTA]}
                    iconStyles={[styles.buttonCTAIcon]}
                    shouldShowRightIcon
                    success
                    large
                />
                {props.error && (
                    <Text style={[styles.formError, styles.mh5]}>
                        {props.error}
                    </Text>
                )}
                <MenuItem
                    icon={Expensicons.Connect}
                    title={props.translate('bankAccount.connectManually')}
                    disabled={!props.user.validated}
                    onPress={() => BankAccounts.setBankAccountSubStep(CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL)}
                    shouldShowRightIcon
                />
                {!props.user.validated && (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.m4]}>
                        <Text style={[styles.mutedTextLabel, styles.mr4]}>
                            <Icon src={Expensicons.Exclamation} fill={colors.red} />
                        </Text>
                        <Text style={styles.mutedTextLabel}>
                            {props.translate('bankAccount.validateAccountError')}
                        </Text>
                    </View>
                )}
                <View style={[styles.m5, styles.flexRow, styles.justifyContentBetween]}>
                    <TextLink href="https://use.expensify.com/privacy">
                        {props.translate('common.privacy')}
                    </TextLink>
                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                        <TextLink
                            // eslint-disable-next-line max-len
                            href="https://community.expensify.com/discussion/5677/deep-dive-how-expensify-protects-your-information/"
                        >
                            {props.translate('bankAccount.yourDataIsSecure')}
                        </TextLink>
                        <View style={[styles.ml1]}>
                            <Icon src={Expensicons.Lock} fill={colors.blue} />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

BankAccountStep.propTypes = propTypes;
BankAccountStep.defaultProps = defaultProps;
BankAccountStep.displayName = 'BankAccountStep';

export default compose(
    withLocalize,
    withOnyx({
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(BankAccountStep);
