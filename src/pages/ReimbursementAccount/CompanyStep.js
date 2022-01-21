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
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import Picker from '../../components/Picker';
import * as ReimbursementAccountUtils from '../../libs/ReimbursementAccountUtils';
import reimbursementAccountPropTypes from './reimbursementAccountPropTypes';
import ReimbursementAccountForm from './ReimbursementAccountForm';
import AddressForm from './AddressForm';

const propTypes = {
    /** Bank account currently in setup */
    // eslint-disable-next-line react/no-unused-prop-types
    reimbursementAccount: reimbursementAccountPropTypes.isRequired,

    ...withLocalizePropTypes,
};

class CompanyStep extends React.Component {
    constructor(props) {
        super(props);

        this.submit = this.submit.bind(this);

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
        };

        this.getErrorText = inputKey => ReimbursementAccountUtils.getErrorText(this.props, this.errorTranslationKeys, inputKey);
        this.clearError = inputKey => ReimbursementAccountUtils.clearError(this.props, inputKey);
        this.clearErrors = inputKeys => ReimbursementAccountUtils.clearErrors(this.props, inputKeys);
        this.getErrors = () => ReimbursementAccountUtils.getErrors(this.props);
        this.clearDateErrorsAndSetValue = this.clearDateErrorsAndSetValue.bind(this);
    }

    /**
     * @param {String} value
     */
    setValue(value) {
        this.setState(value);
        BankAccounts.updateReimbursementAccountDraft(value);
    }

    /**
     * Clear the error associated to inputKey if found and store the inputKey new value in the state.
     *
     * @param {String} inputKey
     * @param {String} value
     */
    clearErrorAndSetValue(inputKey, value) {
        this.setValue({[inputKey]: value});
        this.clearError(inputKey);
    }

    /**
     * Clear both errors associated with incorporation date, and set the new value.
     *
     * @param {String} value
     */
    clearDateErrorsAndSetValue(value) {
        this.clearError('incorporationDate');
        this.clearError('incorporationDateFuture');
        this.setValue({incorporationDate: value});
    }

    /**
     * @returns {Boolean}
     */
    validate() {
        const errors = {};

        if (!ValidationUtils.isValidAddress(this.state.addressStreet)) {
            errors.addressStreet = true;
        }

        if (!ValidationUtils.isValidZipCode(this.state.addressZipCode)) {
            errors.addressZipCode = true;
        }

        if (!ValidationUtils.isValidURL(this.state.website)) {
            errors.website = true;
        }

        if (!/[0-9]{9}/.test(this.state.companyTaxID)) {
            errors.companyTaxID = true;
        }

        if (!ValidationUtils.isValidDate(this.state.incorporationDate)) {
            errors.incorporationDate = true;
        }

        if (!ValidationUtils.isValidPastDate(this.state.incorporationDate)) {
            errors.incorporationDateFuture = true;
        }

        if (!ValidationUtils.isValidPhoneWithSpecialChars(this.state.companyPhone)) {
            errors.companyPhone = true;
        }

        _.each(this.requiredFields, (inputKey) => {
            if (ValidationUtils.isRequiredFulfilled(this.state[inputKey])) {
                return;
            }

            errors[inputKey] = true;
        });
        BankAccounts.setBankAccountFormValidationErrors(errors);
        return _.size(errors) === 0;
    }

    submit() {
        if (!this.validate()) {
            BankAccounts.showBankAccountErrorModal();
            return;
        }

        const incorporationDate = moment(this.state.incorporationDate).format(CONST.DATE.MOMENT_FORMAT_STRING);
        BankAccounts.setupWithdrawalAccount({...this.state, incorporationDate});
    }

    render() {
        const shouldDisableCompanyName = Boolean(this.props.achData.bankAccountID && this.props.achData.companyName);
        const shouldDisableCompanyTaxID = Boolean(this.props.achData.bankAccountID && this.props.achData.companyTaxID);

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
                <ReimbursementAccountForm
                    onSubmit={this.submit}
                >
                    <Text>{this.props.translate('companyStep.subtitle')}</Text>
                    <TextInput
                        label={this.props.translate('companyStep.legalBusinessName')}
                        containerStyles={[styles.mt4]}
                        onChangeText={value => this.clearErrorAndSetValue('companyName', value)}
                        value={this.state.companyName}
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
                            const renamedValues = {};
                            _.each(values, (value, inputKey) => {
                                const renamedInputKey = lodashGet(renamedFields, inputKey, inputKey);
                                renamedValues[renamedInputKey] = value;
                            });
                            this.setValue(renamedValues);
                            this.clearErrors(_.keys(renamedValues));
                        }}
                    />
                    <TextInput
                        label={this.props.translate('common.phoneNumber')}
                        containerStyles={[styles.mt4]}
                        keyboardType={CONST.KEYBOARD_TYPE.PHONE_PAD}
                        onChangeText={value => this.clearErrorAndSetValue('companyPhone', value)}
                        value={this.state.companyPhone}
                        placeholder={this.props.translate('companyStep.companyPhonePlaceholder')}
                        errorText={this.getErrorText('companyPhone')}
                        maxLength={CONST.PHONE_MAX_LENGTH}
                    />
                    <TextInput
                        label={this.props.translate('companyStep.companyWebsite')}
                        containerStyles={[styles.mt4]}
                        onChangeText={value => this.clearErrorAndSetValue('website', value)}
                        value={this.state.website}
                        errorText={this.getErrorText('website')}
                    />
                    <TextInput
                        label={this.props.translate('companyStep.taxIDNumber')}
                        containerStyles={[styles.mt4]}
                        keyboardType={CONST.KEYBOARD_TYPE.NUMERIC}
                        onChangeText={value => this.clearErrorAndSetValue('companyTaxID', value)}
                        value={this.state.companyTaxID}
                        disabled={shouldDisableCompanyTaxID}
                        placeholder={this.props.translate('companyStep.taxIDNumberPlaceholder')}
                        errorText={this.getErrorText('companyTaxID')}
                        maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.TAX_ID_NUMBER}
                    />
                    <View style={styles.mt4}>
                        <Picker
                            label={this.props.translate('companyStep.companyType')}
                            items={_.map(this.props.translate('companyStep.incorporationTypes'), (label, value) => ({value, label}))}
                            onChange={value => this.clearErrorAndSetValue('incorporationType', value)}
                            value={this.state.incorporationType}
                            placeholder={{value: '', label: '-'}}
                            hasError={this.getErrors().incorporationType}
                        />
                    </View>
                    <View style={styles.mt4}>
                        <DatePicker
                            label={this.props.translate('companyStep.incorporationDate')}
                            onChange={this.clearDateErrorsAndSetValue}
                            value={this.state.incorporationDate}
                            placeholder={this.props.translate('companyStep.incorporationDatePlaceholder')}
                            errorText={this.getErrorText('incorporationDate') || this.getErrorText('incorporationDateFuture')}
                            maximumDate={new Date()}
                        />
                    </View>
                    <View style={styles.mt4}>
                        <StatePicker
                            label={this.props.translate('companyStep.incorporationState')}
                            onChange={value => this.clearErrorAndSetValue('incorporationState', value)}
                            value={this.state.incorporationState}
                            hasError={this.getErrors().incorporationState}
                        />
                    </View>
                    <CheckboxWithLabel
                        isChecked={this.state.hasNoConnectionToCannabis}
                        onPress={() => {
                            this.setState((prevState) => {
                                const newState = {hasNoConnectionToCannabis: !prevState.hasNoConnectionToCannabis};
                                BankAccounts.updateReimbursementAccountDraft(newState);
                                return newState;
                            });
                            this.clearError('hasNoConnectionToCannabis');
                        }}
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
                        hasError={this.getErrors().hasNoConnectionToCannabis}
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
