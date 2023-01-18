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
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import * as ValidationUtils from '../../libs/ValidationUtils';
import * as LoginUtils from '../../libs/LoginUtils';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import Picker from '../../components/Picker';
import AddressForm from './AddressForm';
import * as ReimbursementAccountUtils from '../../libs/ReimbursementAccountUtils';
import reimbursementAccountPropTypes from './reimbursementAccountPropTypes';
import reimbursementAccountDraftPropTypes from './ReimbursementAccountDraftPropTypes';
import Form from '../../components/Form';

const propTypes = {
    /** The bank account currently in setup */
    /* eslint-disable-next-line react/no-unused-prop-types */
    reimbursementAccount: reimbursementAccountPropTypes.isRequired,

    /** The draft values of the bank account being setup */
    /* eslint-disable-next-line react/no-unused-prop-types */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes.isRequired,

    ...withLocalizePropTypes,
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
            // Fields from BankAccount step
            ...ReimbursementAccountUtils.getBankAccountFields(this.props, ['bankAccountID', 'routingNumber', 'accountNumber', 'bankName', 'plaidAccountID', 'plaidAccessToken', 'isSavings']),

            // Fields from Company step
            ...values,
            incorporationDate: moment(values.incorporationDate).format(CONST.DATE.MOMENT_FORMAT_STRING),
            companyTaxID: values.companyTaxID.replace(CONST.REGEX.NON_NUMERIC, ''),
            companyPhone: LoginUtils.getPhoneNumberWithoutUSCountryCodeAndSpecialChars(values.companyPhone),
        };

        BankAccounts.updateCompanyInformationForBankAccount(bankAccount);
    }

    render() {
        const bankAccountID = ReimbursementAccountUtils.getDefaultStateForField(this.props, 'bankAccountID', 0);
        const shouldDisableCompanyName = bankAccountID && ReimbursementAccountUtils.getDefaultStateForField(this.props, 'companyName');
        const shouldDisableCompanyTaxID = bankAccountID && ReimbursementAccountUtils.getDefaultStateForField(this.props, 'companyTaxID');

        return (
            <>
                <HeaderWithCloseButton
                    title={this.props.translate('companyStep.headerTitle')}
                    stepCounter={{step: 2, total: 5}}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                    shouldShowBackButton
                    onBackButtonPress={() => BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT)}
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
                        defaultValue={ReimbursementAccountUtils.getDefaultStateForField(this.props, 'companyName')}
                        shouldSaveDraft
                    />
                    <AddressForm
                        translate={this.props.translate}
                        defaultValues={{
                            street: ReimbursementAccountUtils.getDefaultStateForField(this.props, 'addressStreet'),
                            city: ReimbursementAccountUtils.getDefaultStateForField(this.props, 'addressCity'),
                            state: ReimbursementAccountUtils.getDefaultStateForField(this.props, 'addressState'),
                            zipCode: ReimbursementAccountUtils.getDefaultStateForField(this.props, 'addressZipCode'),
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
                        defaultValue={ReimbursementAccountUtils.getDefaultStateForField(this.props, 'companyPhone')}
                        shouldSaveDraft
                    />
                    <TextInput
                        inputID="website"
                        label={this.props.translate('companyStep.companyWebsite')}
                        containerStyles={[styles.mt4]}
                        defaultValue={ReimbursementAccountUtils.getDefaultStateForField(this.props, 'website', this.defaultWebsite)}
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
                        defaultValue={ReimbursementAccountUtils.getDefaultStateForField(this.props, 'companyTaxID')}
                        shouldSaveDraft
                    />
                    <View style={styles.mt4}>
                        <Picker
                            inputID="incorporationType"
                            label={this.props.translate('companyStep.companyType')}
                            items={_.map(this.props.translate('companyStep.incorporationTypes'), (label, value) => ({value, label}))}
                            placeholder={{value: '', label: '-'}}
                            defaultValue={ReimbursementAccountUtils.getDefaultStateForField(this.props, 'incorporationType')}
                            shouldSaveDraft
                        />
                    </View>
                    <View style={styles.mt4}>
                        <DatePicker
                            inputID="incorporationDate"
                            label={this.props.translate('companyStep.incorporationDate')}
                            placeholder={this.props.translate('companyStep.incorporationDatePlaceholder')}
                            defaultValue={ReimbursementAccountUtils.getDefaultStateForField(this.props, 'incorporationDate')}
                            shouldSaveDraft
                        />
                    </View>
                    <View style={styles.mt4}>
                        <StatePicker
                            inputID="incorporationState"
                            label={this.props.translate('companyStep.incorporationState')}
                            defaultValue={ReimbursementAccountUtils.getDefaultStateForField(this.props, 'incorporationState')}
                            shouldSaveDraft
                        />
                    </View>
                    <CheckboxWithLabel
                        inputID="hasNoConnectionToCannabis"
                        defaultValue={ReimbursementAccountUtils.getDefaultStateForField(this.props, 'hasNoConnectionToCannabis', false)}
                        LabelComponent={() => (
                            <>
                                <Text>{`${this.props.translate('companyStep.confirmCompanyIsNot')} `}</Text>
                                <TextLink
                                    // eslint-disable-next-line max-len
                                    href="https://community.expensify.com/discussion/6191/list-of-restricted-businesses"
                                >
                                    {`${this.props.translate('companyStep.listOfRestrictedBusinesses')}.`}
                                </TextLink>
                            </>
                        )}
                        style={[styles.mt4]}
                        shouldSaveDraft
                    />
                </Form>
            </>
        );
    }
}

CompanyStep.propTypes = propTypes;

export default compose(
    withLocalize,
    withOnyx({
        // Needed to retrieve errorFields
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
        reimbursementAccountDraft: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(CompanyStep);
