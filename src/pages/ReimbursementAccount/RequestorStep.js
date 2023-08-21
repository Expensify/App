import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import styles from '../../styles/styles';
import withLocalize from '../../components/withLocalize';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import CONST from '../../CONST';
import TextLink from '../../components/TextLink';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import Text from '../../components/Text';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import IdentityForm from './IdentityForm';
import * as ValidationUtils from '../../libs/ValidationUtils';
import ONYXKEYS from '../../ONYXKEYS';
import RequestorOnfidoStep from './RequestorOnfidoStep';
import Form from '../../components/Form';
import ScreenWrapper from '../../components/ScreenWrapper';
import StepPropTypes from './StepPropTypes';

const propTypes = {
    ...StepPropTypes,

    /** If we should show Onfido flow */
    shouldShowOnfido: PropTypes.bool.isRequired,
};

class RequestorStep extends React.Component {
    constructor(props) {
        super(props);

        this.validate = this.validate.bind(this);
        this.submit = this.submit.bind(this);
    }

    /**
     * @param {Object} values
     * @returns {Object}
     */
    validate(values) {
        const requiredFields = ['firstName', 'lastName', 'dob', 'ssnLast4', 'requestorAddressStreet', 'requestorAddressCity', 'requestorAddressState', 'requestorAddressZipCode'];
        const errors = ValidationUtils.getFieldRequiredErrors(values, requiredFields);

        if (values.dob) {
            if (!ValidationUtils.isValidPastDate(values.dob) || !ValidationUtils.meetsMaximumAgeRequirement(values.dob)) {
                errors.dob = 'bankAccount.error.dob';
            } else if (!ValidationUtils.meetsMinimumAgeRequirement(values.dob)) {
                errors.dob = 'bankAccount.error.age';
            }
        }

        if (values.ssnLast4 && !ValidationUtils.isValidSSNLastFour(values.ssnLast4)) {
            errors.ssnLast4 = 'bankAccount.error.ssnLast4';
        }

        if (values.requestorAddressStreet && !ValidationUtils.isValidAddress(values.requestorAddressStreet)) {
            errors.requestorAddressStreet = 'bankAccount.error.addressStreet';
        }

        if (values.requestorAddressZipCode && !ValidationUtils.isValidZipCode(values.requestorAddressZipCode)) {
            errors.requestorAddressZipCode = 'bankAccount.error.zipCode';
        }

        if (!ValidationUtils.isRequiredFulfilled(values.isControllingOfficer)) {
            errors.isControllingOfficer = 'requestorStep.isControllingOfficerError';
        }

        return errors;
    }

    submit(values) {
        const payload = {
            bankAccountID: lodashGet(this.props.reimbursementAccount, 'achData.bankAccountID') || 0,
            ...values,
        };

        BankAccounts.updatePersonalInformationForBankAccount(payload);
    }

    render() {
        if (this.props.shouldShowOnfido) {
            return (
                <RequestorOnfidoStep
                    reimbursementAccount={this.props.reimbursementAccount}
                    reimbursementAccountDraft={this.props.reimbursementAccountDraft}
                    onBackButtonPress={this.props.onBackButtonPress}
                    getDefaultStateForField={this.props.getDefaultStateForField}
                />
            );
        }

        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <HeaderWithBackButton
                    title={this.props.translate('requestorStep.headerTitle')}
                    stepCounter={{step: 3, total: 5}}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                    onBackButtonPress={this.props.onBackButtonPress}
                />
                <Form
                    formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
                    submitButtonText={this.props.translate('common.saveAndContinue')}
                    validate={this.validate}
                    scrollContextEnabled
                    onSubmit={this.submit}
                    style={[styles.mh5, styles.flexGrow1]}
                >
                    <Text>{this.props.translate('requestorStep.subtitle')}</Text>
                    <View style={[styles.mb5, styles.mt1, styles.dFlex, styles.flexRow]}>
                        <TextLink
                            style={[styles.textMicro]}
                            // eslint-disable-next-line max-len
                            href="https://community.expensify.com/discussion/6983/faq-why-do-i-need-to-provide-personal-documentation-when-setting-up-updating-my-bank-account"
                        >
                            {`${this.props.translate('requestorStep.learnMore')}`}
                        </TextLink>
                        <Text style={[styles.textMicroSupporting]}>{' | '}</Text>
                        <TextLink
                            style={[styles.textMicro, styles.textLink]}
                            // eslint-disable-next-line max-len
                            href="https://community.expensify.com/discussion/5677/deep-dive-security-how-expensify-protects-your-information"
                        >
                            {`${this.props.translate('requestorStep.isMyDataSafe')}`}
                        </TextLink>
                    </View>
                    <IdentityForm
                        translate={this.props.translate}
                        defaultValues={{
                            firstName: this.props.getDefaultStateForField('firstName'),
                            lastName: this.props.getDefaultStateForField('lastName'),
                            street: this.props.getDefaultStateForField('requestorAddressStreet'),
                            city: this.props.getDefaultStateForField('requestorAddressCity'),
                            state: this.props.getDefaultStateForField('requestorAddressState'),
                            zipCode: this.props.getDefaultStateForField('requestorAddressZipCode'),
                            dob: this.props.getDefaultStateForField('dob'),
                            ssnLast4: this.props.getDefaultStateForField('ssnLast4'),
                        }}
                        inputKeys={{
                            firstName: 'firstName',
                            lastName: 'lastName',
                            dob: 'dob',
                            ssnLast4: 'ssnLast4',
                            street: 'requestorAddressStreet',
                            city: 'requestorAddressCity',
                            state: 'requestorAddressState',
                            zipCode: 'requestorAddressZipCode',
                        }}
                        shouldSaveDraft
                    />
                    <CheckboxWithLabel
                        accessibilityLabel={this.props.translate('requestorStep.isControllingOfficer')}
                        inputID="isControllingOfficer"
                        defaultValue={this.props.getDefaultStateForField('isControllingOfficer', false)}
                        LabelComponent={() => (
                            <View style={[styles.flex1, styles.pr1]}>
                                <Text>{this.props.translate('requestorStep.isControllingOfficer')}</Text>
                            </View>
                        )}
                        style={[styles.mt4]}
                        shouldSaveDraft
                    />
                    <Text style={[styles.mt3, styles.textMicroSupporting]}>
                        {this.props.translate('requestorStep.onFidoConditions')}
                        <TextLink
                            href="https://onfido.com/facial-scan-policy-and-release/"
                            style={[styles.textMicro]}
                        >
                            {this.props.translate('onfidoStep.facialScan')}
                        </TextLink>
                        {', '}
                        <TextLink
                            href="https://onfido.com/privacy/"
                            style={[styles.textMicro]}
                        >
                            {this.props.translate('common.privacy')}
                        </TextLink>
                        {` ${this.props.translate('common.and')} `}
                        <TextLink
                            href="https://onfido.com/terms-of-service/"
                            style={[styles.textMicro]}
                        >
                            {this.props.translate('common.termsOfService')}
                        </TextLink>
                    </Text>
                </Form>
            </ScreenWrapper>
        );
    }
}

RequestorStep.propTypes = propTypes;

export default withLocalize(RequestorStep);
