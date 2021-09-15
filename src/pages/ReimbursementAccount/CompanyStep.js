import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import {View, ScrollView} from 'react-native';
import Str from 'expensify-common/lib/str';
import moment from 'moment';
import PropTypes from 'prop-types';
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
import Button from '../../components/Button';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import TextLink from '../../components/TextLink';
import StatePicker from '../../components/StatePicker';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import {
    isValidAddress, isValidDate, isValidIndustryCode, isValidZipCode, isRequiredFulfilled,
} from '../../libs/ValidationUtils';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import ExpensiPicker from '../../components/ExpensiPicker';
import {getDefaultStateForField} from '../../libs/ReimbursementAccountUtils';

const propTypes = {
    /** Bank account currently in setup */
    reimbursementAccount: PropTypes.shape({
        /** Error set when handling the API response */
        error: PropTypes.string,
    }).isRequired,

    ...withLocalizePropTypes,
};

class CompanyStep extends React.Component {
    constructor(props) {
        super(props);

        this.submit = this.submit.bind(this);

        this.state = {
            companyName: getDefaultStateForField(props, 'companyName'),
            addressStreet: getDefaultStateForField(props, 'addressStreet'),
            addressCity: getDefaultStateForField(props, 'addressCity'),
            addressState: getDefaultStateForField(props, 'addressState'),
            addressZipCode: getDefaultStateForField(props, 'addressZipCode'),
            companyPhone: getDefaultStateForField(props, 'companyPhone'),
            website: getDefaultStateForField(props, 'website', 'https://'),
            companyTaxID: getDefaultStateForField(props, 'companyTaxID'),
            incorporationType: getDefaultStateForField(props, 'incorporationType'),
            incorporationDate: getDefaultStateForField(props, 'incorporationDate'),
            incorporationState: getDefaultStateForField(props, 'incorporationState'),
            industryCode: getDefaultStateForField(props, 'industryCode'),
            hasNoConnectionToCannabis: getDefaultStateForField(props, 'hasNoConnectionToCannabis', false),
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
            'industryCode',
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
            industryCode: 'bankAccount.error.industryCode',
            password: 'common.passwordCannotBeBlank',
        };
    }

    /**
     * @returns {Object}
     */
    getErrors() {
        return lodashGet(this.props, ['reimbursementAccount', 'errors'], {});
    }

    /**
     * @param {String} inputKey
     * @returns {String}
     */
    getErrorText(inputKey) {
        const errors = this.getErrors();
        return errors[inputKey] ? this.props.translate(this.errorTranslationKeys[inputKey]) : '';
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
        const errors = this.getErrors();
        if (!errors[inputKey]) {
            // No error found for this inputKey
            return;
        }

        // Clear the existing error for this inputKey
        const newErrors = {...errors};
        delete newErrors[inputKey];
        setBankAccountFormValidationErrors(newErrors);
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

        if (!isValidIndustryCode(this.state.industryCode)) {
            errors.industryCode = true;
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

        // Disable save button if any of the required fields is empty
        const shouldDisableSubmitButton = this.requiredFields.reduce((acc, curr) => acc || !isRequiredFulfilled(this.state[curr]), false);

        return (
            <>
                <HeaderWithCloseButton
                    title={this.props.translate('companyStep.headerTitle')}
                    shouldShowBackButton
                    onBackButtonPress={() => goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT)}
                    onCloseButtonPress={Navigation.dismissModal}
                />
                <ScrollView style={[styles.flex1, styles.w100]} contentContainerStyle={styles.flexGrow1}>
                    <View style={[styles.p4]}>
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
                                />
                            </View>
                            <View style={[styles.flex1]}>
                                <StatePicker
                                    onChange={value => this.clearErrorAndSetValue('addressState', value)}
                                    value={this.state.addressState}
                                />
                            </View>
                        </View>
                        <ExpensiTextInput
                            label={this.props.translate('common.zip')}
                            containerStyles={[styles.mt4]}
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
                            errorText={this.getErrorText('companyTaxID')}
                        />
                        <View style={styles.mt4}>
                            <ExpensiPicker
                                label={this.props.translate('companyStep.companyType')}
                                items={_.map(CONST.INCORPORATION_TYPES, (label, value) => ({value, label}))}
                                onChange={value => this.clearErrorAndSetValue('incorporationType', value)}
                                value={this.state.incorporationType}
                                placeholder={{value: '', label: '-'}}
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
                                />
                            </View>
                            <View style={[styles.flex1]}>
                                <StatePicker
                                    onChange={value => this.clearErrorAndSetValue('incorporationState', value)}
                                    value={this.state.incorporationState}
                                />
                            </View>
                        </View>
                        {/* TODO: Replace with NAICS picker */}
                        <ExpensiTextInput
                            label={this.props.translate('companyStep.industryClassificationCode')}
                            helpLinkText={this.props.translate('common.whatThis')}
                            helpLinkURL="https://www.naics.com/search/"
                            containerStyles={[styles.mt4]}
                            onChangeText={value => this.clearErrorAndSetValue('industryCode', value)}
                            value={this.state.industryCode}
                            errorText={this.getErrorText('industryCode')}
                        />
                        <ExpensiTextInput
                            label={`Expensify ${this.props.translate('common.password')}`}
                            containerStyles={[styles.mt4]}
                            secureTextEntry
                            textContentType="password"
                            onChangeText={value => this.clearErrorAndSetValue('password', value)}
                            value={this.state.password}
                            onSubmitEditing={shouldDisableSubmitButton ? undefined : this.submit}
                            errorText={this.getErrorText('password')}

                            // Use new-password to prevent an autoComplete bug https://github.com/Expensify/Expensify/issues/173177
                            // eslint-disable-next-line react/jsx-props-no-multi-spaces
                            autoCompleteType="new-password"
                        />
                        <CheckboxWithLabel
                            isChecked={this.state.hasNoConnectionToCannabis}
                            onPress={() => this.setState((prevState) => {
                                const newState = {hasNoConnectionToCannabis: !prevState.hasNoConnectionToCannabis};
                                updateReimbursementAccountDraft(newState);
                                return newState;
                            })}
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
                        />
                    </View>
                    <View style={[styles.flex1, styles.justifyContentEnd, styles.p4]}>
                        <Button
                            success
                            onPress={this.submit}
                            style={[styles.w100, styles.mt4, styles.mb1]}
                            text={this.props.translate('common.saveAndContinue')}
                            isDisabled={shouldDisableSubmitButton}
                        />
                    </View>
                </ScrollView>
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
