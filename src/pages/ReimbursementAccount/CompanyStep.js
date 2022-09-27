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
import ReimbursementAccountForm from './ReimbursementAccountForm';
import * as ReimbursementAccount from '../../libs/actions/ReimbursementAccount';
import * as ReimbursementAccountUtils from '../../libs/ReimbursementAccountUtils';

const propTypes = {
    ...withLocalizePropTypes,
};

class CompanyStep extends React.Component {
    constructor(props) {
        super(props);

        this.submit = this.submit.bind(this);
        this.clearErrorAndSetValue = this.clearErrorAndSetValue.bind(this);
        this.clearError = inputKey => ReimbursementAccountUtils.clearError(this.props, inputKey);
        this.getErrors = () => ReimbursementAccountUtils.getErrors(this.props);
        this.getErrorText = inputKey => ReimbursementAccountUtils.getErrorText(this.props, this.errorTranslationKeys, inputKey);

        this.defaultWebsite = lodashGet(props, 'user.isFromPublicDomain', false)
            ? 'https://'
            : `https://www.${Str.extractEmailDomain(props.session.email, '')}`;

        this.state = {
            companyName: ReimbursementAccountUtils.getDefaultStateForField(props, 'companyName'),
            addressStreet: ReimbursementAccountUtils.getDefaultStateForField(props, 'addressStreet'),
            addressCity: ReimbursementAccountUtils.getDefaultStateForField(props, 'addressCity'),
            addressState: ReimbursementAccountUtils.getDefaultStateForField(props, 'addressState'),
            addressZipCode: ReimbursementAccountUtils.getDefaultStateForField(props, 'addressZipCode'),
            companyPhone: ReimbursementAccountUtils.getDefaultStateForField(props, 'companyPhone'),
            website: ReimbursementAccountUtils.getDefaultStateForField(props, 'website', this.defaultWebsite),
            companyTaxID: ReimbursementAccountUtils.getDefaultStateForField(props, 'companyTaxID'),
            incorporationType: ReimbursementAccountUtils.getDefaultStateForField(props, 'incorporationType'),
            incorporationDate: ReimbursementAccountUtils.getDefaultStateForField(props, 'incorporationDate'),
            incorporationState: ReimbursementAccountUtils.getDefaultStateForField(props, 'incorporationState'),
            hasNoConnectionToCannabis: ReimbursementAccountUtils.getDefaultStateForField(props, 'hasNoConnectionToCannabis', false),
        };

        // These fields need to be filled out in order to submit the form
        this.requiredFields = [
            'companyName',
            'addressStreet',
            'addressCity',
            'addressState',
            'addressZipCode',
            'website',
            'companyTaxID',
            'incorporationDate',
            'incorporationState',
            'incorporationType',
            'companyPhone',
            'hasNoConnectionToCannabis',
        ];

        // Map a field to the key of the error's translation
        this.errorTranslationKeys = {
            companyName: 'bankAccount.error.companyName',
            companyPhone: 'bankAccount.error.phoneNumber',
            website: 'bankAccount.error.website',
            companyTaxID: 'bankAccount.error.taxID',
            incorporationDate: 'bankAccount.error.incorporationDate',
            incorporationDateFuture: 'bankAccount.error.incorporationDateFuture',
            incorporationType: 'bankAccount.error.companyType',
            hasNoConnectionToCannabis: 'bankAccount.error.restrictedBusiness',
            incorporationState: 'bankAccount.error.incorporationState',
        };
    }

    /**
     * @param {String} inputKey
     * @param {String} value
     */
    clearErrorAndSetValue(inputKey, value) {
        const newState = {[inputKey]: value};
        this.setState(newState);
        ReimbursementAccount.updateReimbursementAccountDraft(newState);
        this.clearError(inputKey);
        if (inputKey === 'incorporationDate') {
            this.clearError('incorporationDateFuture');
        }
    }

    /**
     * @returns {Boolean}
     */
    validate() {
        const errors = {};

        _.each(this.requiredFields, (inputKey) => {
            if (ValidationUtils.isRequiredFulfilled(this.state[inputKey])) {
                return;
            }

            errors[inputKey] = true;
        });

        if (!ValidationUtils.isValidAddress(this.state.addressStreet)) {
            errors.addressStreet = true;
        }

        if (!ValidationUtils.isValidZipCode(this.state.addressZipCode)) {
            errors.addressZipCode = true;
        }

        if (!ValidationUtils.isValidURL(this.state.website)) {
            errors.website = true;
        }

        if (!ValidationUtils.isValidTaxID(this.state.companyTaxID)) {
            errors.companyTaxID = true;
        }

        if (!ValidationUtils.isValidDate(this.state.incorporationDate)) {
            errors.incorporationDate = true;
        }

        if (!ValidationUtils.isValidPastDate(this.state.incorporationDate)) {
            errors.incorporationDateFuture = true;
        }

        if (!ValidationUtils.isValidUSPhone(this.state.companyPhone, true)) {
            errors.companyPhone = true;
        }

        ReimbursementAccount.setBankAccountFormValidationErrors(errors);

        return _.size(errors) === 0;
    }

    submit() {
        if (!this.validate()) {
            return;
        }

        const incorporationDate = moment(this.state.incorporationDate).format(CONST.DATE.MOMENT_FORMAT_STRING);
        BankAccounts.setupWithdrawalAccount({
            bankAccountID: ReimbursementAccountUtils.getDefaultStateForField(this.props, 'bankAccountID', 0),

            // Fields from bankAccount step
            routingNumber: ReimbursementAccountUtils.getDefaultStateForField(this.props, 'routingNumber'),
            accountNumber: ReimbursementAccountUtils.getDefaultStateForField(this.props, 'accountNumber'),
            bankName: ReimbursementAccountUtils.getDefaultStateForField(this.props, 'bankName'),
            plaidAccountID: ReimbursementAccountUtils.getDefaultStateForField(this.props, 'plaidAccountID'),
            isSavings: ReimbursementAccountUtils.getDefaultStateForField(this.props, 'isSavings'),
            plaidAccessToken: ReimbursementAccountUtils.getDefaultStateForField(this.props, 'plaidAccessToken'),

            // Fields from company step
            ...this.state,
            incorporationDate,
            companyTaxID: this.state.companyTaxID.replace(CONST.REGEX.NON_NUMERIC, ''),
            companyPhone: LoginUtils.getPhoneNumberWithoutUSCountryCodeAndSpecialChars(this.state.companyPhone),
        });
    }

    render() {
        const bankAccountID = ReimbursementAccountUtils.getDefaultStateForField(this.props.reimbursementAccount, 'bankAccountID', 0);
        const shouldDisableCompanyName = bankAccountID && ReimbursementAccountUtils.getDefaultStateForField(this.props.reimbursementAccount, 'companyName');
        const shouldDisableCompanyTaxID = bankAccountID && ReimbursementAccountUtils.getDefaultStateForField(this.props.reimbursementAccount, 'companyTaxID');

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

                <ReimbursementAccountForm onSubmit={this.submit}>
                    <Text>{this.props.translate('companyStep.subtitle')}</Text>
                    <TextInput
                        label={this.props.translate('companyStep.legalBusinessName')}
                        containerStyles={[styles.mt4]}
                        onChangeText={value => this.clearErrorAndSetValue('companyName', value)}
                        defaultValue={this.state.companyName}
                        disabled={shouldDisableCompanyName}
                        errorText={this.getErrorText('companyName')}
                    />
                    <AddressForm
                        streetTranslationKey="common.companyAddress"
                        values={{
                            street: this.state.addressStreet,
                            city: this.state.addressCity,
                            zipCode: this.state.addressZipCode,
                            state: this.state.addressState,
                        }}
                        errors={{
                            street: this.getErrors().addressStreet,
                            city: this.getErrors().addressCity,
                            zipCode: this.getErrors().addressZipCode,
                            state: this.getErrors().addressState,
                        }}
                        onFieldChange={(values) => {
                            const renamedFields = {
                                street: 'addressStreet',
                                state: 'addressState',
                                city: 'addressCity',
                                zipCode: 'addressZipCode',
                            };
                            _.each(values, (value, inputKey) => {
                                const renamedInputKey = lodashGet(renamedFields, inputKey, inputKey);
                                this.clearErrorAndSetValue(renamedInputKey, value);
                            });
                        }}
                    />
                    <TextInput
                        label={this.props.translate('common.phoneNumber')}
                        containerStyles={[styles.mt4]}
                        keyboardType={CONST.KEYBOARD_TYPE.PHONE_PAD}
                        onChangeText={value => this.clearErrorAndSetValue('companyPhone', value)}
                        defaultValue={this.state.companyPhone}
                        placeholder={this.props.translate('common.phoneNumberPlaceholder')}
                        errorText={this.getErrorText('companyPhone')}
                    />
                    <TextInput
                        label={this.props.translate('companyStep.companyWebsite')}
                        containerStyles={[styles.mt4]}
                        onChangeText={value => this.clearErrorAndSetValue('website', value)}
                        defaultValue={this.state.website}
                        errorText={this.getErrorText('website')}
                    />
                    <TextInput
                        label={this.props.translate('companyStep.taxIDNumber')}
                        containerStyles={[styles.mt4]}
                        keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                        onChangeText={value => this.clearErrorAndSetValue('companyTaxID', value)}
                        defaultValue={this.state.companyTaxID}
                        disabled={shouldDisableCompanyTaxID}
                        placeholder={this.props.translate('companyStep.taxIDNumberPlaceholder')}
                        errorText={this.getErrorText('companyTaxID')}
                    />
                    <View style={styles.mt4}>
                        <Picker
                            label={this.props.translate('companyStep.companyType')}
                            items={_.map(this.props.translate('companyStep.incorporationTypes'), (label, value) => ({value, label}))}
                            onInputChange={value => this.clearErrorAndSetValue('incorporationType', value)}
                            defaultValue={this.state.incorporationType}
                            placeholder={{value: '', label: '-'}}
                            errorText={this.getErrorText('incorporationType')}
                        />
                    </View>
                    <View style={styles.mt4}>
                        <DatePicker
                            label={this.props.translate('companyStep.incorporationDate')}
                            onInputChange={value => this.clearErrorAndSetValue('incorporationDate', value)}
                            defaultValue={this.state.incorporationDate}
                            placeholder={this.props.translate('companyStep.incorporationDatePlaceholder')}
                            errorText={this.getErrorText('incorporationDate') || this.getErrorText('incorporationDateFuture')}
                            maximumDate={new Date()}
                        />
                    </View>
                    <View style={styles.mt4}>
                        <StatePicker
                            label={this.props.translate('companyStep.incorporationState')}
                            onInputChange={value => this.clearErrorAndSetValue('incorporationState', value)}
                            defaultValue={this.state.incorporationState}
                            errorText={this.getErrorText('incorporationState')}
                        />
                    </View>
                    <CheckboxWithLabel
                        isChecked={this.state.hasNoConnectionToCannabis}
                        onInputChange={value => this.clearErrorAndSetValue('hasNoConnectionToCannabis', value)}
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
                        errorText={this.getErrorText('hasNoConnectionToCannabis')}
                    />
                </ReimbursementAccountForm>
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
