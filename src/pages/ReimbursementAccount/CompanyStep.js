import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import {View} from 'react-native';
import Str from 'expensify-common/lib/str';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import {parsePhoneNumber} from 'awesome-phonenumber';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import StatePicker from '../../components/StatePicker';
import CONST from '../../CONST';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import Text from '../../components/Text';
import DatePicker from '../../components/DatePicker';
import TextInput from '../../components/TextInput';
import styles from '../../styles/styles';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import TextLink from '../../components/TextLink';
import withLocalize from '../../components/withLocalize';
import * as ValidationUtils from '../../libs/ValidationUtils';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import Picker from '../../components/Picker';
import AddressForm from './AddressForm';
import Form from '../../components/Form';
import ScreenWrapper from '../../components/ScreenWrapper';
import StepPropTypes from './StepPropTypes';

const propTypes = {
    ...StepPropTypes,

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user email */
        email: PropTypes.string,
    }),

    /** Object with various information about the user */
    user: PropTypes.shape({
        /** Whether or not the user is on a public domain email account or not */
        isFromPublicDomain: PropTypes.bool,
    }),

    /* The workspace policyID */
    policyID: PropTypes.string,
};

const defaultProps = {
    session: {
        email: null,
    },
    user: {},
    policyID: '',
};

class CompanyStep extends React.Component {
    constructor(props) {
        super(props);

        this.submit = this.submit.bind(this);
        this.validate = this.validate.bind(this);

        this.defaultWebsite = lodashGet(props, 'user.isFromPublicDomain', false) ? 'https://' : `https://www.${Str.extractEmailDomain(props.session.email, '')}`;
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
            errors.companyName = 'bankAccount.error.companyName';
        }

        if (!values.addressStreet || !ValidationUtils.isValidAddress(values.addressStreet)) {
            errors.addressStreet = 'bankAccount.error.addressStreet';
        }

        if (!values.addressZipCode || !ValidationUtils.isValidZipCode(values.addressZipCode)) {
            errors.addressZipCode = 'bankAccount.error.zipCode';
        }

        if (!values.addressCity) {
            errors.addressCity = 'bankAccount.error.addressCity';
        }

        if (!values.addressState) {
            errors.addressState = 'bankAccount.error.addressState';
        }

        if (!values.companyPhone || !ValidationUtils.isValidUSPhone(values.companyPhone, true)) {
            errors.companyPhone = 'bankAccount.error.phoneNumber';
        }

        if (!values.website || !ValidationUtils.isValidWebsite(values.website)) {
            errors.website = 'bankAccount.error.website';
        }

        if (!values.companyTaxID || !ValidationUtils.isValidTaxID(values.companyTaxID)) {
            errors.companyTaxID = 'bankAccount.error.taxID';
        }

        if (!values.incorporationType) {
            errors.incorporationType = 'bankAccount.error.companyType';
        }

        if (!values.incorporationDate || !ValidationUtils.isValidDate(values.incorporationDate)) {
            errors.incorporationDate = 'common.error.dateInvalid';
        } else if (!values.incorporationDate || !ValidationUtils.isValidPastDate(values.incorporationDate)) {
            errors.incorporationDate = 'bankAccount.error.incorporationDateFuture';
        }

        if (!values.incorporationState) {
            errors.incorporationState = 'bankAccount.error.incorporationState';
        }

        if (!values.hasNoConnectionToCannabis) {
            errors.hasNoConnectionToCannabis = 'bankAccount.error.restrictedBusiness';
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
            companyTaxID: values.companyTaxID.replace(CONST.REGEX.NON_NUMERIC, ''),
            companyPhone: parsePhoneNumber(values.companyPhone, {regionCode: CONST.COUNTRY.US}).number.significant,
        };

        BankAccounts.updateCompanyInformationForBankAccount(bankAccount, this.props.policyID);
    }

    render() {
        const bankAccountID = lodashGet(this.props.reimbursementAccount, 'achData.bankAccountID', 0);
        const shouldDisableCompanyName = Boolean(bankAccountID && this.props.getDefaultStateForField('companyName'));
        const shouldDisableCompanyTaxID = Boolean(bankAccountID && this.props.getDefaultStateForField('companyTaxID'));

        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <HeaderWithBackButton
                    title={this.props.translate('companyStep.headerTitle')}
                    stepCounter={{step: 2, total: 5}}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                    onBackButtonPress={this.props.onBackButtonPress}
                />
                <Form
                    formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
                    validate={this.validate}
                    onSubmit={this.submit}
                    scrollContextEnabled
                    submitButtonText={this.props.translate('common.saveAndContinue')}
                    style={[styles.mh5, styles.flexGrow1]}
                >
                    <Text>{this.props.translate('companyStep.subtitle')}</Text>
                    <TextInput
                        label={this.props.translate('companyStep.legalBusinessName')}
                        accessibilityLabel={this.props.translate('companyStep.legalBusinessName')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        inputID="companyName"
                        containerStyles={[styles.mt4]}
                        disabled={shouldDisableCompanyName}
                        defaultValue={this.props.getDefaultStateForField('companyName')}
                        shouldSaveDraft
                        shouldUseDefaultValue={shouldDisableCompanyName}
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
                            street: 'addressStreet',
                            city: 'addressCity',
                            state: 'addressState',
                            zipCode: 'addressZipCode',
                        }}
                        shouldSaveDraft
                        streetTranslationKey="common.companyAddress"
                    />
                    <TextInput
                        inputID="companyPhone"
                        label={this.props.translate('common.phoneNumber')}
                        accessibilityLabel={this.props.translate('common.phoneNumber')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        containerStyles={[styles.mt4]}
                        keyboardType={CONST.KEYBOARD_TYPE.PHONE_PAD}
                        placeholder={this.props.translate('common.phoneNumberPlaceholder')}
                        defaultValue={this.props.getDefaultStateForField('companyPhone')}
                        shouldSaveDraft
                    />
                    <TextInput
                        inputID="website"
                        label={this.props.translate('companyStep.companyWebsite')}
                        accessibilityLabel={this.props.translate('companyStep.companyWebsite')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        containerStyles={[styles.mt4]}
                        defaultValue={this.props.getDefaultStateForField('website', this.defaultWebsite)}
                        shouldSaveDraft
                        hint={this.props.translate('common.websiteExample')}
                        keyboardType={CONST.KEYBOARD_TYPE.URL}
                    />
                    <TextInput
                        inputID="companyTaxID"
                        label={this.props.translate('companyStep.taxIDNumber')}
                        accessibilityLabel={this.props.translate('companyStep.taxIDNumber')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        containerStyles={[styles.mt4]}
                        keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                        disabled={shouldDisableCompanyTaxID}
                        placeholder={this.props.translate('companyStep.taxIDNumberPlaceholder')}
                        defaultValue={this.props.getDefaultStateForField('companyTaxID')}
                        shouldSaveDraft
                        shouldUseDefaultValue={shouldDisableCompanyTaxID}
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
                    <View style={[styles.mt4, styles.mhn5]}>
                        <StatePicker
                            inputID="incorporationState"
                            label={this.props.translate('companyStep.incorporationState')}
                            defaultValue={this.props.getDefaultStateForField('incorporationState')}
                            shouldSaveDraft
                        />
                    </View>
                    <CheckboxWithLabel
                        accessibilityLabel={`${this.props.translate('companyStep.confirmCompanyIsNot')} ${this.props.translate('companyStep.listOfRestrictedBusinesses')}`}
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
CompanyStep.defaultProps = defaultProps;

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
