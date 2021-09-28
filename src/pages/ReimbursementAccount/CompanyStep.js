import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import Str from 'expensify-common/lib/str';
import moment from 'moment';
import {withOnyx} from 'react-native-onyx';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import CONST from '../../CONST';
import {
    goToWithdrawalAccountSetupStep,
    setupWithdrawalAccount,
    showBankAccountErrorModal,
    setBankAccountFormValidationErrors,
    updateReimbursementAccountDraft,
} from '../../libs/actions/BankAccounts';
import Navigation from '../../libs/Navigation/Navigation';
import Text from '../../components/Text';
import ExpensiTextInput from '../../components/ExpensiTextInput';
import styles from '../../styles/styles';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import TextLink from '../../components/TextLink';
import StatePicker from '../../components/StatePicker';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import {
    isValidAddress, isValidDate, isValidZipCode, isRequiredFulfilled,
} from '../../libs/ValidationUtils';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import ExpensiPicker from '../../components/ExpensiPicker';
import * as ReimbursementAccountUtils from '../../libs/ReimbursementAccountUtils';
import reimbursementAccountPropTypes from './reimbursementAccountPropTypes';
import ReimbursementAccountForm from './ReimbursementAccountForm';

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

        this.state = {
            companyName: ReimbursementAccountUtils.getDefaultStateForField(props, 'companyName'),
            addressStreet: ReimbursementAccountUtils.getDefaultStateForField(props, 'addressStreet'),
            addressCity: ReimbursementAccountUtils.getDefaultStateForField(props, 'addressCity'),
            addressState: ReimbursementAccountUtils.getDefaultStateForField(props, 'addressState'),
            addressZipCode: ReimbursementAccountUtils.getDefaultStateForField(props, 'addressZipCode'),
            companyPhone: ReimbursementAccountUtils.getDefaultStateForField(props, 'companyPhone'),
            website: ReimbursementAccountUtils.getDefaultStateForField(props, 'website', 'https://'),
            companyTaxID: ReimbursementAccountUtils.getDefaultStateForField(props, 'companyTaxID'),
            incorporationType: ReimbursementAccountUtils.getDefaultStateForField(props, 'incorporationType'),
            incorporationDate: ReimbursementAccountUtils.getDefaultStateForField(props, 'incorporationDate'),
            incorporationState: ReimbursementAccountUtils.getDefaultStateForField(props, 'incorporationState'),
            hasNoConnectionToCannabis: ReimbursementAccountUtils.getDefaultStateForField(props, 'hasNoConnectionToCannabis', false),
            password: '',
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
            'password',
            'companyPhone',
            'hasNoConnectionToCannabis',
        ];

        // Map a field to the key of the error's translation
        this.errorTranslationKeys = {
            addressStreet: 'bankAccount.error.addressStreet',
            addressCity: 'bankAccount.error.addressCity',
            addressZipCode: 'bankAccount.error.zipCode',
            companyName: 'bankAccount.error.companyName',
            companyPhone: 'bankAccount.error.phoneNumber',
            website: 'bankAccount.error.website',
            companyTaxID: 'bankAccount.error.taxID',
            incorporationDate: 'bankAccount.error.incorporationDate',
            incorporationType: 'bankAccount.error.companyType',
            password: 'common.passwordCannotBeBlank',
            hasNoConnectionToCannabis: 'bankAccount.error.restrictedBusiness',
        };

        this.getErrorText = inputKey => ReimbursementAccountUtils.getErrorText(this.props, this.errorTranslationKeys, inputKey);
        this.clearError = inputKey => ReimbursementAccountUtils.clearError(this.props, inputKey);
        this.getErrors = () => ReimbursementAccountUtils.getErrors(this.props);
    }

    /**
     * @param {String} value
     */
    setValue(value) {
        this.setState(value);
        updateReimbursementAccountDraft(value);
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
     * @returns {Boolean}
     */
    validate() {
        const errors = {};
        if (!isValidAddress(this.state.addressStreet)) {
            errors.addressStreet = true;
        }

        if (!isValidZipCode(this.state.addressZipCode)) {
            errors.addressZipCode = true;
        }

        if (!Str.isValidURL(this.state.website)) {
            errors.website = true;
        }

        if (!/[0-9]{9}/.test(this.state.companyTaxID)) {
            errors.companyTaxID = true;
        }

        if (!isValidDate(this.state.incorporationDate)) {
            errors.incorporationDate = true;
        }

        _.each(this.requiredFields, (inputKey) => {
            if (!isRequiredFulfilled(this.state[inputKey])) {
                errors[inputKey] = true;
            }
        });
        setBankAccountFormValidationErrors(errors);
        return _.size(errors) === 0;
    }

    submit() {
        if (!this.validate()) {
            showBankAccountErrorModal();
            return;
        }

        const incorporationDate = moment(this.state.incorporationDate).format(CONST.DATE.MOMENT_FORMAT_STRING);
        setupWithdrawalAccount({...this.state, incorporationDate});
    }

    render() {
        const shouldDisableCompanyName = Boolean(this.props.achData.bankAccountID && this.props.achData.companyName);
        const shouldDisableCompanyTaxID = Boolean(this.props.achData.bankAccountID && this.props.achData.companyTaxID);

        return (
            <>
                <HeaderWithCloseButton
                    title={this.props.translate('companyStep.headerTitle')}
                    stepCounter={{step: 2, total: 5}}
                    shouldShowBackButton
                    onBackButtonPress={() => goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT)}
                    onCloseButtonPress={Navigation.dismissModal}
                />
                <ReimbursementAccountForm
                    onSubmit={this.submit}
                >
                    <Text>{this.props.translate('companyStep.subtitle')}</Text>
                    <ExpensiTextInput
                        label={this.props.translate('companyStep.legalBusinessName')}
                        containerStyles={[styles.mt4]}
                        onChangeText={value => this.clearErrorAndSetValue('companyName', value)}
                        value={this.state.companyName}
                        disabled={shouldDisableCompanyName}
                        errorText={this.getErrorText('companyName')}
                    />
                    <ExpensiTextInput
                        label={this.props.translate('common.companyAddress')}
                        containerStyles={[styles.mt4]}
                        onChangeText={value => this.clearErrorAndSetValue('addressStreet', value)}
                        value={this.state.addressStreet}
                        errorText={this.getErrorText('addressStreet')}
                    />
                    <Text style={[styles.mutedTextLabel, styles.mt1]}>{this.props.translate('common.noPO')}</Text>
                    <View style={[styles.flexRow, styles.mt4]}>
                        <View style={[styles.flex2, styles.mr2]}>
                            <ExpensiTextInput
                                label={this.props.translate('common.city')}
                                onChangeText={value => this.clearErrorAndSetValue('addressCity', value)}
                                value={this.state.addressCity}
                                errorText={this.getErrorText('addressCity')}
                                translateX={-14}
                            />
                        </View>
                        <View style={[styles.flex1]}>
                            <StatePicker
                                onChange={value => this.clearErrorAndSetValue('addressState', value)}
                                value={this.state.addressState}
                                hasError={this.getErrors().addressState}
                            />
                        </View>
                    </View>
                    <ExpensiTextInput
                        label={this.props.translate('common.zip')}
                        containerStyles={[styles.mt4]}
                        keyboardType={CONST.KEYBOARD_TYPE.PHONE_PAD}
                        onChangeText={value => this.clearErrorAndSetValue('addressZipCode', value)}
                        value={this.state.addressZipCode}
                        errorText={this.getErrorText('addressZipCode')}
                    />
                    <ExpensiTextInput
                        label={this.props.translate('common.phoneNumber')}
                        containerStyles={[styles.mt4]}
                        keyboardType={CONST.KEYBOARD_TYPE.PHONE_PAD}
                        onChangeText={value => this.clearErrorAndSetValue('companyPhone', value)}
                        value={this.state.companyPhone}
                        placeholder={this.props.translate('companyStep.companyPhonePlaceholder')}
                        errorText={this.getErrorText('companyPhone')}
                    />
                    <ExpensiTextInput
                        label={this.props.translate('companyStep.companyWebsite')}
                        containerStyles={[styles.mt4]}
                        onChangeText={value => this.clearErrorAndSetValue('website', value)}
                        value={this.state.website}
                        errorText={this.getErrorText('website')}
                    />
                    <ExpensiTextInput
                        label={this.props.translate('companyStep.taxIDNumber')}
                        containerStyles={[styles.mt4]}
                        keyboardType={CONST.KEYBOARD_TYPE.PHONE_PAD}
                        onChangeText={value => this.clearErrorAndSetValue('companyTaxID', value)}
                        value={this.state.companyTaxID}
                        disabled={shouldDisableCompanyTaxID}
                        placeholder={this.props.translate('companyStep.taxIDNumberPlaceholder')}
                        errorText={this.getErrorText('companyTaxID')}
                    />
                    <View style={styles.mt4}>
                        <ExpensiPicker
                            label={this.props.translate('companyStep.companyType')}
                            items={_.map(CONST.INCORPORATION_TYPES, (label, value) => ({value, label}))}
                            onChange={value => this.clearErrorAndSetValue('incorporationType', value)}
                            value={this.state.incorporationType}
                            placeholder={{value: '', label: '-'}}
                            hasError={this.getErrors().incorporationType}
                        />
                    </View>
                    <View style={[styles.flexRow, styles.mt4]}>
                        <View style={[styles.flex2, styles.mr2]}>
                            {/* TODO: Replace with date picker */}
                            <ExpensiTextInput
                                label={this.props.translate('companyStep.incorporationDate')}
                                onChangeText={value => this.clearErrorAndSetValue('incorporationDate', value)}
                                value={this.state.incorporationDate}
                                placeholder={this.props.translate('companyStep.incorporationDatePlaceholder')}
                                errorText={this.getErrorText('incorporationDate')}
                                translateX={-14}
                            />
                        </View>
                        <View style={[styles.flex1]}>
                            <StatePicker
                                onChange={value => this.clearErrorAndSetValue('incorporationState', value)}
                                value={this.state.incorporationState}
                                hasError={this.getErrors().incorporationState}
                            />
                        </View>
                    </View>
                    <ExpensiTextInput
                        label={`Expensify ${this.props.translate('common.password')}`}
                        containerStyles={[styles.mt4]}
                        secureTextEntry
                        textContentType="password"
                        onChangeText={(value) => {
                            this.setState({password: value});
                            this.clearError('password');
                        }}
                        value={this.state.password}
                        onSubmitEditing={this.submit}
                        errorText={this.getErrorText('password')}

                        // Use new-password to prevent an autoComplete bug https://github.com/Expensify/Expensify/issues/173177
                        // eslint-disable-next-line react/jsx-props-no-multi-spaces
                        autoCompleteType="new-password"
                    />
                    <CheckboxWithLabel
                        isChecked={this.state.hasNoConnectionToCannabis}
                        onPress={() => {
                            this.setState((prevState) => {
                                const newState = {hasNoConnectionToCannabis: !prevState.hasNoConnectionToCannabis};
                                updateReimbursementAccountDraft(newState);
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
    }),
)(CompanyStep);
