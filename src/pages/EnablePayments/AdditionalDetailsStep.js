import lodashGet from 'lodash/get';
import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import IdologyQuestions from './IdologyQuestions';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import CONST from '../../CONST';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import TextLink from '../../components/TextLink';
import TextInput from '../../components/TextInput';
import FormScrollView from '../../components/FormScrollView';
import FormAlertWithSubmitButton from '../../components/FormAlertWithSubmitButton';
import * as Wallet from '../../libs/actions/Wallet';
import * as ValidationUtils from '../../libs/ValidationUtils';
import * as LoginUtils from '../../libs/LoginUtils';
import AddressSearch from '../../components/AddressSearch';
import DatePicker from '../../components/DatePicker';
import FormHelper from '../../libs/FormHelper';
import walletAdditionalDetailsDraftPropTypes from './walletAdditionalDetailsDraftPropTypes';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../components/withCurrentUserPersonalDetails';
import * as PersonalDetails from '../../libs/actions/PersonalDetails';

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,

    /** Stores additional information about the additional details step e.g. loading state and errors with fields */
    walletAdditionalDetails: PropTypes.shape({
        /** Are we waiting for a response? */
        loading: PropTypes.bool,

        /** Which field needs attention? */
        errorFields: PropTypes.objectOf(PropTypes.bool),

        /** Any additional error message to show */
        additionalErrorMessage: PropTypes.string,

        /** Questions returned by Idology */
        questions: PropTypes.arrayOf(PropTypes.shape({
            prompt: PropTypes.string,
            type: PropTypes.string,
            answer: PropTypes.arrayOf(PropTypes.string),
        })),

        /** ExpectID ID number related to those questions */
        idNumber: PropTypes.string,

        /** If we should ask for the full SSN (when LexisNexis failed retrieving the first 5 from the last 4) */
        shouldAskForFullSSN: PropTypes.bool,
    }),

    /** Stores the personal details typed by the user */
    walletAdditionalDetailsDraft: walletAdditionalDetailsDraftPropTypes,
};

const defaultProps = {
    walletAdditionalDetails: {
        errorFields: {},
        loading: false,
        additionalErrorMessage: '',
        questions: [],
        idNumber: '',
        shouldAskForFullSSN: false,
    },
    walletAdditionalDetailsDraft: {
        legalFirstName: '',
        legalLastName: '',
        addressStreet: '',
        addressCity: '',
        addressState: '',
        addressZip: '',
        phoneNumber: '',
        dob: '',
        ssn: '',
    },
    ...withCurrentUserPersonalDetailsDefaultProps,
};

class AdditionalDetailsStep extends React.Component {
    constructor(props) {
        super(props);

        this.activateWallet = this.activateWallet.bind(this);

        this.requiredFields = [
            'legalFirstName',
            'legalLastName',
            'addressStreet',
            'addressCity',
            'addressState',
            'addressZip',
            'phoneNumber',
            'dob',
            'ssn',
        ];

        this.errorTranslationKeys = {
            legalFirstName: 'bankAccount.error.firstName',
            legalLastName: 'bankAccount.error.lastName',
            addressStreet: 'bankAccount.error.addressStreet',
            addressCity: 'bankAccount.error.addressCity',
            addressState: 'bankAccount.error.addressState',
            addressZip: 'bankAccount.error.zipCode',
            phoneNumber: 'bankAccount.error.phoneNumber',
            dob: 'bankAccount.error.dob',
            age: 'bankAccount.error.age',
            ssn: 'bankAccount.error.ssnLast4',
            ssnFull9: 'additionalDetailsStep.ssnFull9Error',
        };

        this.fieldNameTranslationKeys = {
            legalFirstName: 'additionalDetailsStep.legalFirstNameLabel',
            legalLastName: 'additionalDetailsStep.legalLastNameLabel',
            addressStreet: 'common.personalAddress',
            addressCity: 'common.city',
            addressState: 'common.state',
            addressZip: 'common.zip',
            phoneNumber: 'common.phoneNumber',
            dob: 'common.dob',
            ssn: 'common.ssnLast4',
            ssnFull9: 'common.ssnFull9',
        };

        this.formHelper = new FormHelper({
            errorPath: 'walletAdditionalDetails.errorFields',
            setErrors: Wallet.setAdditionalDetailsErrors,
        });
    }

    /**
     * @returns {Object}
     */
    getErrors() {
        return this.formHelper.getErrors(this.props);
    }

    /**
     * @param {String} fieldName
     * @returns {String}
     */
    getErrorText(fieldName) {
        if (!this.getErrors()[fieldName]) {
            return '';
        }

        return this.props.translate(this.errorTranslationKeys[fieldName]);
    }

    /**
     * @param {String} path
     */
    clearError(path) {
        this.formHelper.clearError(this.props, path);
    }

    /**
     * @returns {Boolean}
     */
    validate() {
        // Reset server error messages when resubmitting form
        Wallet.setAdditionalDetailsErrorMessage('');

        const errors = {};

        if (!ValidationUtils.isValidPastDate(this.props.walletAdditionalDetailsDraft.dob)) {
            errors.dob = true;
        }

        if (!ValidationUtils.meetsAgeRequirements(this.props.walletAdditionalDetailsDraft.dob)) {
            errors.age = true;
        }

        if (!ValidationUtils.isValidAddress(this.props.walletAdditionalDetailsDraft.addressStreet)) {
            errors.addressStreet = true;
        }

        if (!ValidationUtils.isValidUSPhone(this.props.walletAdditionalDetailsDraft.phoneNumber, true)) {
            errors.phoneNumber = true;
        }

        if (this.props.walletAdditionalDetails.shouldAskForFullSSN) {
            if (!ValidationUtils.isValidSSNFullNine(this.props.walletAdditionalDetailsDraft.ssn)) {
                errors.ssnFull9 = true;
            }
        } else if (!ValidationUtils.isValidSSNLastFour(this.props.walletAdditionalDetailsDraft.ssn)) {
            errors.ssn = true;
        }

        _.each(this.requiredFields, (requiredField) => {
            if (ValidationUtils.isRequiredFulfilled(this.props.walletAdditionalDetailsDraft[requiredField])) {
                return;
            }

            errors[requiredField] = true;
        });

        Wallet.setAdditionalDetailsErrors(errors);
        return _.size(errors) === 0;
    }

    activateWallet() {
        if (!this.validate()) {
            return;
        }

        BankAccounts.activateWallet(CONST.WALLET.STEP.ADDITIONAL_DETAILS, {
            personalDetails: {
                ...this.props.walletAdditionalDetailsDraft,
                phoneNumber: LoginUtils.getPhoneNumberWithoutUSCountryCodeAndSpecialChars(this.props.walletAdditionalDetailsDraft.phoneNumber),
            },
        });
    }

    /**
     * Clear both errors associated with dob, and set the new value.
     *
     * @param {String} value
     */
    clearDateErrorsAndSetValue(value) {
        this.formHelper.clearErrors(this.props, ['dob', 'age']);
        Wallet.updateAdditionalDetailsDraft({dob: value});
    }

    /**
     * Clear ssn and ssnFull9 error and set the new value
     *
     * @param {String} value
     */
    clearSSNErrorAndSetValue(value) {
        this.formHelper.clearErrors(this.props, ['ssn', 'ssnFull9']);
        Wallet.updateAdditionalDetailsDraft({ssn: value});
    }

    /**
     * @param {String} fieldName
     * @param {String} value
     */
    clearErrorAndSetValue(fieldName, value) {
        Wallet.updateAdditionalDetailsDraft({[fieldName]: value});
        this.clearError(fieldName);
    }

    render() {
        if (!_.isEmpty(this.props.walletAdditionalDetails.questions)) {
            return (
                <ScreenWrapper style={[styles.flex1]} keyboardAvoidingViewBehavior="height">
                    <HeaderWithCloseButton
                        title={this.props.translate('additionalDetailsStep.headerTitle')}
                        onCloseButtonPress={() => Navigation.dismissModal()}
                        shouldShowBackButton
                        onBackButtonPress={() => Wallet.setAdditionalDetailsQuestions(null)}
                    />
                    <IdologyQuestions
                        questions={this.props.walletAdditionalDetails.questions}
                        idNumber={this.props.walletAdditionalDetails.idNumber}
                    />
                </ScreenWrapper>
            );
        }

        const isErrorVisible = _.size(this.getErrors()) > 0
            || lodashGet(this.props, 'walletAdditionalDetails.additionalErrorMessage', '').length > 0;
        const shouldAskForFullSSN = this.props.walletAdditionalDetails.shouldAskForFullSSN;
        const {firstName, lastName} = PersonalDetails.extractFirstAndLastNameFromAvailableDetails(this.props.currentUserPersonalDetails);

        return (
            <ScreenWrapper style={[styles.flex1]} keyboardAvoidingViewBehavior="height">
                <HeaderWithCloseButton
                    title={this.props.translate('additionalDetailsStep.headerTitle')}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
                <View style={[styles.flex1]}>
                    <View style={[styles.ph5]}>
                        <Text style={styles.mb3}>{this.props.translate('additionalDetailsStep.helpText')}</Text>
                        <TextLink
                            style={styles.mb3}
                            href="https://use.expensify.com/usa-patriot-act"
                        >
                            {this.props.translate('additionalDetailsStep.helpLink')}
                        </TextLink>
                    </View>
                    <FormScrollView ref={el => this.form = el}>
                        <View style={[styles.mh5, styles.mb5]}>
                            <View style={styles.mt4}>
                                <TextInput
                                    containerStyles={[styles.mt4]}
                                    label={this.props.translate(this.fieldNameTranslationKeys.legalFirstName)}
                                    onChangeText={val => this.clearErrorAndSetValue('legalFirstName', val)}
                                    value={this.props.walletAdditionalDetailsDraft.legalFirstName || firstName}
                                    errorText={this.getErrorText('legalFirstName')}
                                />
                                <TextInput
                                    containerStyles={[styles.mt4]}
                                    label={this.props.translate(this.fieldNameTranslationKeys.legalLastName)}
                                    onChangeText={val => this.clearErrorAndSetValue('legalLastName', val)}
                                    value={this.props.walletAdditionalDetailsDraft.legalLastName || lastName}
                                    errorText={this.getErrorText('legalLastName')}
                                />
                                <AddressSearch
                                    label={this.props.translate(this.fieldNameTranslationKeys.addressStreet)}
                                    value={this.props.walletAdditionalDetailsDraft.addressStreet || ''}
                                    containerStyles={[styles.mt4]}
                                    onInputChange={(values) => {
                                        const renamedFields = {
                                            street: 'addressStreet',
                                            state: 'addressState',
                                            zipCode: 'addressZip',
                                            city: 'addressCity',
                                        };
                                        _.each(values, (value, inputKey) => {
                                            const renamedInputKey = lodashGet(renamedFields, inputKey, inputKey);
                                            this.clearErrorAndSetValue(renamedInputKey, value);
                                        });
                                    }}
                                    errorText={this.getErrorText('addressStreet')}
                                    hint={this.props.translate('common.noPO')}
                                />
                                {this.props.walletAdditionalDetailsDraft.addressStreet ? (
                                    <>
                                        {/** Once the user has started entering his address, show the other address fields (city, state, zip) */}
                                        {/** We'll autofill them when the user selects a full address from the google autocomplete */}
                                        <TextInput
                                            containerStyles={[styles.mt4]}
                                            label={this.props.translate(this.fieldNameTranslationKeys.addressCity)}
                                            onChangeText={val => this.clearErrorAndSetValue('addressCity', val)}
                                            value={this.props.walletAdditionalDetailsDraft.addressCity || ''}
                                            errorText={this.getErrorText('addressCity')}
                                        />
                                        <TextInput
                                            containerStyles={[styles.mt4]}
                                            label={this.props.translate(this.fieldNameTranslationKeys.addressState)}
                                            onChangeText={val => this.clearErrorAndSetValue('addressState', val)}
                                            value={this.props.walletAdditionalDetailsDraft.addressState || ''}
                                            errorText={this.getErrorText('addressState')}
                                        />
                                        <TextInput
                                            containerStyles={[styles.mt4]}
                                            label={this.props.translate(this.fieldNameTranslationKeys.addressZip)}
                                            onChangeText={val => this.clearErrorAndSetValue('addressZip', val)}
                                            value={this.props.walletAdditionalDetailsDraft.addressZip || ''}
                                            errorText={this.getErrorText('addressZip')}
                                        />
                                    </>
                                ) : null}
                            </View>
                            <TextInput
                                containerStyles={[styles.mt4]}
                                label={this.props.translate(this.fieldNameTranslationKeys.phoneNumber)}
                                onChangeText={val => this.clearErrorAndSetValue('phoneNumber', val)}
                                value={this.props.walletAdditionalDetailsDraft.phoneNumber || ''}
                                placeholder={this.props.translate('common.phoneNumberPlaceholder')}
                                errorText={this.getErrorText('phoneNumber')}
                            />
                            <DatePicker
                                containerStyles={[styles.mt4]}
                                label={this.props.translate(this.fieldNameTranslationKeys.dob)}
                                onInputChange={val => this.clearDateErrorsAndSetValue(val)}
                                defaultValue={this.props.walletAdditionalDetailsDraft.dob || ''}
                                placeholder={this.props.translate('common.dob')}
                                errorText={this.getErrorText('dob') || this.getErrorText('age')}
                                maximumDate={new Date()}
                            />
                            <TextInput
                                containerStyles={[styles.mt4]}
                                label={this.props.translate(this.fieldNameTranslationKeys[shouldAskForFullSSN ? 'ssnFull9' : 'ssn'])}
                                onChangeText={val => this.clearSSNErrorAndSetValue(val)}
                                value={this.props.walletAdditionalDetailsDraft.ssn || ''}
                                errorText={this.getErrorText('ssnFull9') || this.getErrorText('ssn')}
                                maxLength={shouldAskForFullSSN ? 9 : 4}
                                keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                            />
                        </View>
                        <FormAlertWithSubmitButton
                            isAlertVisible={isErrorVisible}
                            onSubmit={this.activateWallet}
                            onFixTheErrorsLinkPressed={() => {
                                this.form.scrollTo({y: 0, animated: true});
                            }}
                            message={this.props.walletAdditionalDetails.additionalErrorMessage}
                            isLoading={this.props.walletAdditionalDetails.loading}
                            buttonText={this.props.translate('common.saveAndContinue')}
                        />
                    </FormScrollView>
                </View>
            </ScreenWrapper>
        );
    }
}

AdditionalDetailsStep.propTypes = propTypes;
AdditionalDetailsStep.defaultProps = defaultProps;
export default compose(
    withLocalize,
    withCurrentUserPersonalDetails,
    withOnyx({
        walletAdditionalDetails: {
            key: ONYXKEYS.WALLET_ADDITIONAL_DETAILS,
            initWithStoredValues: false,
        },
    }),
)(AdditionalDetailsStep);
