import React from 'react';
import {View} from 'react-native';
import moment from 'moment';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import withLocalize from '../../components/withLocalize';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import CONST from '../../CONST';
import TextLink from '../../components/TextLink';
import Navigation from '../../libs/Navigation/Navigation';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import Text from '../../components/Text';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import IdentityForm from './IdentityForm';
import * as ValidationUtils from '../../libs/ValidationUtils';
import ONYXKEYS from '../../ONYXKEYS';
import RequestorOnfidoStep from './RequestorOnfidoStep';
import Form from '../../components/Form';
import ScreenWrapper from '../../components/ScreenWrapper';
import * as ReimbursementAccountUtils from '../../libs/ReimbursementAccountUtils';
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
        this.getDefaultStateForField = this.getDefaultStateForField.bind(this);
    }

    /**
     * @param {String} fieldName
     * @param {*} defaultValue
     *
     * @returns {*}
     */
    getDefaultStateForField(fieldName, defaultValue = '') {
        return ReimbursementAccountUtils.getDefaultStateForField(this.props.reimbursementAccountDraft, this.props.reimbursementAccount, fieldName, defaultValue);
    }

    /**
     * @param {Object} values
     * @returns {Object}
     */
    validate(values) {
        const errors = {};

        if (!ValidationUtils.isRequiredFulfilled(values.firstName)) {
            errors.firstName = this.props.translate('bankAccount.error.firstName');
        }

        if (!ValidationUtils.isRequiredFulfilled(values.lastName)) {
            errors.lastName = this.props.translate('bankAccount.error.lastName');
        }

        if (!ValidationUtils.isRequiredFulfilled(values.dob)) {
            errors.dob = this.props.translate('bankAccount.error.dob');
        }

        if (values.dob && !ValidationUtils.meetsAgeRequirements(values.dob)) {
            errors.dob = this.props.translate('bankAccount.error.age');
        }

        if (!ValidationUtils.isRequiredFulfilled(values.ssnLast4) || !ValidationUtils.isValidSSNLastFour(values.ssnLast4)) {
            errors.ssnLast4 = this.props.translate('bankAccount.error.ssnLast4');
        }

        if (!ValidationUtils.isRequiredFulfilled(values.requestorAddressStreet)) {
            errors.requestorAddressStreet = this.props.translate('bankAccount.error.address');
        }

        if (values.requestorAddressStreet && !ValidationUtils.isValidAddress(values.requestorAddressStreet)) {
            errors.requestorAddressStreet = this.props.translate('bankAccount.error.addressStreet');
        }

        if (!ValidationUtils.isRequiredFulfilled(values.requestorAddressCity)) {
            errors.requestorAddressCity = this.props.translate('bankAccount.error.addressCity');
        }

        if (!ValidationUtils.isRequiredFulfilled(values.requestorAddressState)) {
            errors.requestorAddressState = this.props.translate('bankAccount.error.addressState');
        }

        if (!ValidationUtils.isRequiredFulfilled(values.requestorAddressZipCode) || !ValidationUtils.isValidZipCode(values.requestorAddressZipCode)) {
            errors.requestorAddressZipCode = this.props.translate('bankAccount.error.zipCode');
        }

        if (!ValidationUtils.isRequiredFulfilled(values.isControllingOfficer)) {
            errors.isControllingOfficer = this.props.translate('requestorStep.isControllingOfficerError');
        }

        return errors;
    }

    submit(values) {
        const payload = {
            bankAccountID: this.getDefaultStateForField('bankAccountID', 0),
            ...values,
            dob: moment(values.dob).format(CONST.DATE.MOMENT_FORMAT_STRING),
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
                />
            );
        }

        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <HeaderWithCloseButton
                    title={this.props.translate('requestorStep.headerTitle')}
                    stepCounter={{step: 3, total: 5}}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                    shouldShowBackButton
                    onBackButtonPress={this.props.onBackButtonPress}
                    onCloseButtonPress={Navigation.dismissModal}
                />
                <Form
                    formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
                    submitButtonText={this.props.translate('common.saveAndContinue')}
                    validate={this.validate}
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
                            firstName: this.getDefaultStateForField('firstName'),
                            lastName: this.getDefaultStateForField('lastName'),
                            street: this.getDefaultStateForField('requestorAddressStreet'),
                            city: this.getDefaultStateForField('requestorAddressCity'),
                            state: this.getDefaultStateForField('requestorAddressState'),
                            zipCode: this.getDefaultStateForField('requestorAddressZipCode'),
                            dob: this.getDefaultStateForField('dob'),
                            ssnLast4: this.getDefaultStateForField('ssnLast4'),
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
                        inputID="isControllingOfficer"
                        defaultValue={this.getDefaultStateForField('isControllingOfficer', false)}
                        LabelComponent={() => (
                            <View style={[styles.flex1, styles.pr1]}>
                                <Text>
                                    {this.props.translate('requestorStep.isControllingOfficer')}
                                </Text>
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
                            {this.props.translate('common.privacyPolicy')}
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
