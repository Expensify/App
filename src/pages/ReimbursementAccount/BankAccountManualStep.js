import React from 'react';
import {Image} from 'react-native';
import lodashGet from 'lodash/get';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import CONST from '../../CONST';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import Text from '../../components/Text';
import TextInput from '../../components/TextInput';
import styles from '../../styles/styles';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import TextLink from '../../components/TextLink';
import withLocalize from '../../components/withLocalize';
import * as ValidationUtils from '../../libs/ValidationUtils';
import ONYXKEYS from '../../ONYXKEYS';
import exampleCheckImage from './exampleCheckImage';
import Form from '../../components/Form';
import shouldDelayFocus from '../../libs/shouldDelayFocus';
import ScreenWrapper from '../../components/ScreenWrapper';
import StepPropTypes from './StepPropTypes';

const propTypes = {
    ...StepPropTypes,
};

class BankAccountManualStep extends React.Component {
    constructor(props) {
        super(props);
        this.submit = this.submit.bind(this);
        this.validate = this.validate.bind(this);
    }

    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Object}
     */
    validate(values) {
        const errorFields = {};
        const routingNumber = values.routingNumber && values.routingNumber.trim();

        if (
            !values.accountNumber ||
            (!CONST.BANK_ACCOUNT.REGEX.US_ACCOUNT_NUMBER.test(values.accountNumber.trim()) && !CONST.BANK_ACCOUNT.REGEX.MASKED_US_ACCOUNT_NUMBER.test(values.accountNumber.trim()))
        ) {
            errorFields.accountNumber = 'bankAccount.error.accountNumber';
        } else if (values.accountNumber === routingNumber) {
            errorFields.accountNumber = this.props.translate('bankAccount.error.routingAndAccountNumberCannotBeSame');
        }
        if (!routingNumber || !CONST.BANK_ACCOUNT.REGEX.SWIFT_BIC.test(routingNumber) || !ValidationUtils.isValidRoutingNumber(routingNumber)) {
            errorFields.routingNumber = 'bankAccount.error.routingNumber';
        }
        if (!values.acceptTerms) {
            errorFields.acceptTerms = 'common.error.acceptTerms';
        }

        return errorFields;
    }

    submit(values) {
        BankAccounts.connectBankAccountManually(
            lodashGet(this.props.reimbursementAccount, 'achData.bankAccountID') || 0,
            values.accountNumber,
            values.routingNumber,
            lodashGet(this.props, ['reimbursementAccountDraft', 'plaidMask']),
        );
    }

    render() {
        const shouldDisableInputs = Boolean(lodashGet(this.props.reimbursementAccount, 'achData.bankAccountID'));

        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <HeaderWithBackButton
                    title={this.props.translate('workspace.common.connectBankAccount')}
                    stepCounter={{step: 1, total: 5}}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                    onBackButtonPress={this.props.onBackButtonPress}
                />
                <Form
                    formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
                    onSubmit={this.submit}
                    validate={this.validate}
                    submitButtonText={this.props.translate('common.continue')}
                    style={[styles.mh5, styles.flexGrow1]}
                >
                    <Text style={[styles.mb5]}>{this.props.translate('bankAccount.checkHelpLine')}</Text>
                    <Image
                        resizeMode="contain"
                        style={[styles.exampleCheckImage, styles.mb5]}
                        source={exampleCheckImage(this.props.preferredLocale)}
                    />
                    <TextInput
                        autoFocus
                        shouldDelayFocus={shouldDelayFocus}
                        inputID="routingNumber"
                        label={this.props.translate('bankAccount.routingNumber')}
                        defaultValue={this.props.getDefaultStateForField('routingNumber', '')}
                        keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                        disabled={shouldDisableInputs}
                        shouldSaveDraft
                        shouldUseDefaultValue={shouldDisableInputs}
                    />
                    <TextInput
                        inputID="accountNumber"
                        containerStyles={[styles.mt4]}
                        label={this.props.translate('bankAccount.accountNumber')}
                        defaultValue={this.props.getDefaultStateForField('accountNumber', '')}
                        keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                        disabled={shouldDisableInputs}
                        shouldSaveDraft
                        shouldUseDefaultValue={shouldDisableInputs}
                    />
                    <CheckboxWithLabel
                        accessibilityLabel={`${this.props.translate('common.iAcceptThe')} ${this.props.translate('common.expensifyTermsOfService')}`}
                        style={styles.mt4}
                        inputID="acceptTerms"
                        LabelComponent={() => (
                            <Text>
                                {this.props.translate('common.iAcceptThe')}
                                <TextLink href={CONST.TERMS_URL}>{this.props.translate('common.expensifyTermsOfService')}</TextLink>
                            </Text>
                        )}
                        defaultValue={this.props.getDefaultStateForField('acceptTerms', false)}
                        shouldSaveDraft
                    />
                </Form>
            </ScreenWrapper>
        );
    }
}

BankAccountManualStep.propTypes = propTypes;
export default withLocalize(BankAccountManualStep);
