import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import {View} from 'react-native';
import Str from 'expensify-common/lib/str';
import moment from 'moment';
import {withOnyx} from 'react-native-onyx';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import CONST from '../../CONST';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import Navigation from '../../libs/Navigation/Navigation';
import Text from '../../components/Text';
import DatePicker from '../../components/DatePicker';
import TextInput from '../../components/TextInput';
import styles from '../../styles/styles';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import TextLink from '../../components/TextLink';
import StatePicker from '../../components/StatePicker';
import withLocalize from '../../components/withLocalize';
import * as ValidationUtils from '../../libs/ValidationUtils';
import * as LoginUtils from '../../libs/LoginUtils';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import Picker from '../../components/Picker';
import AddressForm from './AddressForm';
import Form from '../../components/Form';
import ScreenWrapper from '../../components/ScreenWrapper';
import StepPropTypes from './StepPropTypes';

const propTypes = {
    ...StepPropTypes,
};

class CompanyStep extends React.Component {
    constructor(props) {
        super(props);

        this.submit = this.submit.bind(this);
        this.validate = this.validate.bind(this);

        this.defaultWebsite = lodashGet(props, 'user.isFromPublicDomain', false)
            ? 'https://'
            : `https://www.${Str.extractEmailDomain(props.session.email, '')}`;
    }

    componentWillUnmount() {
        BankAccounts.resetReimbursementAccount();
    }

    /**
     * @param {Array} fieldNames
     *
     * @returns {*}
     */
    getBankAccountFields(fieldNames) {
        return {
            ..._.pick(lodashGet(this.props.reimbursementAccount, 'achData'), ...fieldNames),
            ..._.pick(this.props.reimbursementAccountDraft, ...fieldNames),
        };
    }

    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Object} - Object containing the errors for each inputID, e.g. {inputID1: error1, inputID2: error2}
     */
    validate(values) {
        const errors = {};

        if (!values.companyName) {
            errors.companyName = this.props.translate('bankAccount.error.companyName');
        }

        if (!values.addressStreet || !ValidationUtils.isValidAddress(values.addressStreet)) {
            errors.addressStreet = this.props.translate('bankAccount.error.addressStreet');
        }

        if (!values.addressZipCode || !ValidationUtils.isValidZipCode(values.addressZipCode)) {
            errors.addressZipCode = this.props.translate('bankAccount.error.zipCode');
        }

        if (!values.addressCity) {
            errors.addressCity = this.props.translate('bankAccount.error.addressCity');
        }

        if (!values.addressState) {
            errors.addressState = this.props.translate('bankAccount.error.addressState');
        }

        if (!values.companyPhone || !ValidationUtils.isValidUSPhone(values.companyPhone, true)) {
            errors.companyPhone = this.props.translate('bankAccount.error.phoneNumber');
        }

        if (!values.website || !ValidationUtils.isValidWebsite(values.website)) {
            errors.website = this.props.translate('bankAccount.error.website');
        }

        if (!values.companyTaxID || !ValidationUtils.isValidTaxID(values.companyTaxID)) {
            errors.companyTaxID = this.props.translate('bankAccount.error.taxID');
        }

        if (!values.incorporationType) {
            errors.incorporationType = this.props.translate('bankAccount.error.companyType');
        }

        if (!values.incorporationDate || !ValidationUtils.isValidDate(values.incorporationDate)) {
            errors.incorporationDate = this.props.translate('bankAccount.error.incorporationDate');
        } else if (!values.incorporationDate || !ValidationUtils.isValidPastDate(values.incorporationDate)) {
            errors.incorporationDate = this.props.translate('bankAccount.error.incorporationDateFuture');
        }

        if (!values.incorporationState) {
            errors.incorporationState = this.props.translate('bankAccount.error.incorporationState');
        }

        if (!values.hasNoConnectionToCannabis) {
            errors.hasNoConnectionToCannabis = this.props.translate('bankAccount.error.restrictedBusiness');
        }

        return errors;
    }

    submit(values) {
        const bankAccount = {
            bankAccountID: lodashGet(this.props.reimbursementAccount, 'achData.bankAccountID') || 0,

            // Fields from BankAccount step
            ...this.getBankAccountFields(['routingNumber', 'accountNumber', 'bankName', 'plaidAccountID', 'plaidAccessToken', 'isSavings']),

            // Fields from Company step
            ...values,
            incorporationDate: moment(values.incorporationDate).format(CONST.DATE.MOMENT_FORMAT_STRING),
            companyTaxID: values.companyTaxID.replace(CONST.REGEX.NON_NUMERIC, ''),
            companyPhone: LoginUtils.getPhoneNumberWithoutUSCountryCodeAndSpecialChars(values.companyPhone),
        };

        BankAccounts.updateCompanyInformationForBankAccount(bankAccount);
    }

    render() {
        const bankAccountID = lodashGet(this.props.reimbursementAccount, 'achData.bankAccountID') || 0;
        const shouldDisableCompanyName = bankAccountID && this.props.getDefaultStateForField('companyName');
        const shouldDisableCompanyTaxID = bankAccountID && this.props.getDefaultStateForField('companyTaxID');

        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <HeaderWithCloseButton
                    title={this.props.translate('companyStep.headerTitle')}
                    stepCounter={{step: 2, total: 5}}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                    shouldShowBackButton
                    onBackButtonPress={this.props.onBackButtonPress}
                    onCloseButtonPress={Navigation.dismissModal}
                />
                <Form
                    formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
                    validate={this.validate}
                    onSubmit={this.submit}
                    submitButtonText={this.props.translate('common.saveAndContinue')}
                    style={[styles.ph5, styles.flexGrow1]}
                >
                    <Text>{this.props.translate('companyStep.subtitle')}</Text>
                    <TextInput
                        label={this.props.translate('companyStep.legalBusinessName')}
                        inputID="companyName"
                        containerStyles={[styles.mt4]}
                        disabled={shouldDisableCompanyName}
                        defaultValue={this.props.getDefaultStateForField('companyName')}
                        shouldSaveDraft
                    />
                    <AddressForm
                        translate={this.props.translate}
                        defaultValues={{
                            street: this.props.getDefaultStateForField('addressStreet'),
                            city: this.props.getDefaultStateForField('addressCity'),
                            state: this.props.getDefaultStateForField('addressState'),
                            zipCode: this.props.getDefaultStateForField('addressZipCode'),
                        }}
                        inputKeys={{
                            street: 'addressStreet', city: 'addressCity', state: 'addressState', zipCode: 'addressZipCode',
                        }}
                        shouldSaveDraft
                        streetTranslationKey="common.companyAddress"
                    />
                    <TextInput
                        inputID="companyPhone"
                        label={this.props.translate('common.phoneNumber')}
                        containerStyles={[styles.mt4]}
                        keyboardType={CONST.KEYBOARD_TYPE.PHONE_PAD}
                        placeholder={this.props.translate('common.phoneNumberPlaceholder')}
                        defaultValue={this.props.getDefaultStateForField('companyPhone')}
                        shouldSaveDraft
                    />
                    <TextInput
                        inputID="website"
                        label={this.props.translate('companyStep.companyWebsite')}
                        containerStyles={[styles.mt4]}
                        defaultValue={this.props.getDefaultStateForField('website', this.defaultWebsite)}
                        shouldSaveDraft
                        hint={this.props.translate('common.websiteExample')}
                    />
                    <TextInput
                        inputID="companyTaxID"
                        label={this.props.translate('companyStep.taxIDNumber')}
                        containerStyles={[styles.mt4]}
                        keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                        disabled={shouldDisableCompanyTaxID}
                        placeholder={this.props.translate('companyStep.taxIDNumberPlaceholder')}
                        defaultValue={this.props.getDefaultStateForField('companyTaxID')}
                        shouldSaveDraft
                    />
                    <View style={styles.mt4}>
                        <Picker
                            inputID="incorporationType"
                            label={this.props.translate('companyStep.companyType')}
                            items={_.map(this.props.translate('companyStep.incorporationTypes'), (label, value) => ({value, label}))}
                            placeholder={{value: '', label: '-'}}
                            defaultValue={this.props.getDefaultStateForField('incorporationType')}
                            shouldSaveDraft
                        />
                    </View>
                    <View style={styles.mt4}>
                        <DatePicker
                            inputID="incorporationDate"
                            label={this.props.translate('companyStep.incorporationDate')}
                            placeholder={this.props.translate('companyStep.incorporationDatePlaceholder')}
                            defaultValue={this.props.getDefaultStateForField('incorporationDate')}
                            shouldSaveDraft
                        />
                    </View>
                    <View style={styles.mt4}>
                        <StatePicker
                            inputID="incorporationState"
                            label={this.props.translate('companyStep.incorporationState')}
                            defaultValue={this.props.getDefaultStateForField('incorporationState')}
                            shouldSaveDraft
                        />
                    </View>
                    <CheckboxWithLabel
                        inputID="hasNoConnectionToCannabis"
                        defaultValue={this.props.getDefaultStateForField('hasNoConnectionToCannabis', false)}
                        LabelComponent={() => (
                            <Text>
                                {`${this.props.translate('companyStep.confirmCompanyIsNot')} `}
                                <TextLink
                                    // eslint-disable-next-line max-len
                                    href="https://community.expensify.com/discussion/6191/list-of-restricted-businesses"
                                >
                                    {`${this.props.translate('companyStep.listOfRestrictedBusinesses')}.`}
                                </TextLink>
                            </Text>
                        )}
                        style={[styles.mt4]}
                        shouldSaveDraft
                    />
                </Form>
            </ScreenWrapper>
        );
    }
}

CompanyStep.propTypes = propTypes;

export default compose(
    withLocalize,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(CompanyStep);
