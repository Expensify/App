import lodashGet from 'lodash/get';
import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import moment from 'moment';
import IdologyQuestions from './IdologyQuestions';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import Text from '../../components/Text';
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
import AddressForm from '../ReimbursementAccount/AddressForm';
import DatePicker from '../../components/DatePicker';
import Form from '../../components/Form';
import FormHelper from '../../libs/FormHelper';
import walletAdditionalDetailsDraftPropTypes from './walletAdditionalDetailsDraftPropTypes';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../components/withCurrentUserPersonalDetails';
import * as PersonalDetails from '../../libs/actions/PersonalDetails';
import OfflineIndicator from '../../components/OfflineIndicator';
import * as ErrorUtils from '../../libs/ErrorUtils';

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,

    /** Stores additional information about the additional details step e.g. loading state and errors with fields */
    walletAdditionalDetails: PropTypes.shape({
        /** Are we waiting for a response? */
        isLoading: PropTypes.bool,

        /** Which field needs attention? */
        errorFields: PropTypes.objectOf(PropTypes.bool),

        /** Any additional error message to show */
        errors: PropTypes.objectOf(PropTypes.string),

        /** Questions returned by Idology */
        questions: PropTypes.arrayOf(PropTypes.shape({
            prompt: PropTypes.string,
            type: PropTypes.string,
            answer: PropTypes.arrayOf(PropTypes.string),
        })),

        /** ExpectID ID number related to those questions */
        idNumber: PropTypes.string,

        /** Error code to determine additional behavior */
        errorCode: PropTypes.string,
    }),

    /** Stores the personal details typed by the user */
    walletAdditionalDetailsDraft: walletAdditionalDetailsDraftPropTypes,
};

const defaultProps = {
    walletAdditionalDetails: {
        errorFields: {},
        isLoading: false,
        errors: {},
        questions: [],
        idNumber: '',
        errorCode: '',
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

        this.errorTranslationKeys = {
            legalFirstName: 'bankAccount.error.firstName',
            legalLastName: 'bankAccount.error.lastName',
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

    getFirstName() {
        const {firstName} = PersonalDetails.extractFirstAndLastNameFromAvailableDetails(this.props.currentUserPersonalDetails);
        return this.props.walletAdditionalDetailsDraft.legalFirstName || firstName;
    }

    getLastName() {
        const {lastName} = PersonalDetails.extractFirstAndLastNameFromAvailableDetails(this.props.currentUserPersonalDetails);
        return this.props.walletAdditionalDetailsDraft.legalLastName || lastName;
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

        if (!this.getFirstName()) {
            errors.legalFirstName = true;
        }

        if (!this.getLastName()) {
            errors.legalLastName = true;
        }

        if (!ValidationUtils.isValidPastDate(this.props.walletAdditionalDetailsDraft.dob)) {
            errors.dob = true;
        }

        if (!ValidationUtils.meetsAgeRequirements(this.props.walletAdditionalDetailsDraft.dob)) {
            errors.age = true;
        }

        if (!ValidationUtils.isValidAddress(this.props.walletAdditionalDetailsDraft.addressStreet)) {
            errors.addressStreet = true;
        }

        if (_.isEmpty(this.props.walletAdditionalDetailsDraft.addressCity)) {
            errors.addressCity = true;
        }

        if (_.isEmpty(this.props.walletAdditionalDetailsDraft.addressState)) {
            errors.addressState = true;
        }

        if (!ValidationUtils.isValidZipCode(this.props.walletAdditionalDetailsDraft.addressZip)) {
            errors.addressZip = true;
        }

        if (!ValidationUtils.isValidUSPhone(this.props.walletAdditionalDetailsDraft.phoneNumber, true)) {
            errors.phoneNumber = true;
        }

        if (this.props.walletAdditionalDetails.errorCode === CONST.WALLET.ERROR.SSN) {
            if (!ValidationUtils.isValidSSNFullNine(this.props.walletAdditionalDetailsDraft.ssn)) {
                errors.ssnFull9 = true;
            }
        } else if (!ValidationUtils.isValidSSNLastFour(this.props.walletAdditionalDetailsDraft.ssn)) {
            errors.ssn = true;
        }

        Wallet.setAdditionalDetailsErrors(errors);
        return _.size(errors) === 0;
    }

    activateWallet() {
        if (!this.validate()) {
            return;
        }
        const personalDetails = {
            ...this.props.walletAdditionalDetailsDraft,
            phoneNumber: LoginUtils.getPhoneNumberWithoutUSCountryCodeAndSpecialChars(this.props.walletAdditionalDetailsDraft.phoneNumber),
            legalFirstName: this.getFirstName(),
            legalLastName: this.getLastName(),
        };
        Wallet.updatePersonalDetails(personalDetails);
    }

    /**
     * Clear both errors associated with dob, and set the new value.
     *
     * @param {String} value
     */
    clearDateErrorsAndSetValue(value) {
        this.formHelper.clearErrors(this.props, ['dob', 'age']);
        Wallet.updateAdditionalDetailsDraft({dob: moment(value).format(CONST.DATE.MOMENT_FORMAT_STRING)});
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

        const errorMessage = ErrorUtils.getLatestErrorMessage(this.props.walletAdditionalDetails) || '';
        const isErrorVisible = _.size(this.getErrors()) > 0 || Boolean(errorMessage);
        const shouldAskForFullSSN = this.props.walletAdditionalDetails.errorCode === CONST.WALLET.ERROR.SSN;

        return (
            <>
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
                                    value={this.getFirstName()}
                                    errorText={this.getErrorText('legalFirstName')}
                                />
                                <TextInput
                                    containerStyles={[styles.mt4]}
                                    label={this.props.translate(this.fieldNameTranslationKeys.legalLastName)}
                                    onChangeText={val => this.clearErrorAndSetValue('legalLastName', val)}
                                    value={this.getLastName()}
                                    errorText={this.getErrorText('legalLastName')}
                                />
                                <AddressForm
                                    translate={this.props.translate}
                                    streetTranslationKey={this.fieldNameTranslationKeys.addressStreet}
                                    values={{
                                        street: this.props.walletAdditionalDetailsDraft.addressStreet,
                                        state: this.props.walletAdditionalDetailsDraft.addressState,
                                        city: this.props.walletAdditionalDetailsDraft.addressCity,
                                        zipCode: this.props.walletAdditionalDetailsDraft.addressZip,
                                    }}
                                    errors={{
                                        street: this.getErrors().addressStreet,
                                        state: this.getErrors().addressState,
                                        city: this.getErrors().addressCity,
                                        zipCode: this.getErrors().addressZip,
                                    }}
                                    onFieldChange={(values) => {
                                        const renamedFields = {
                                            street: 'addressStreet',
                                            state: 'addressState',
                                            city: 'addressCity',
                                            zipCode: 'addressZip',
                                        };
                                        _.each(values, (value, inputKey) => {
                                            const renamedInputKey = lodashGet(renamedFields, inputKey, inputKey);
                                            this.clearErrorAndSetValue(renamedInputKey, value);
                                        });
                                    }}
                                />
                            </View>
                            <TextInput
                                containerStyles={[styles.mt4]}
                                keyboardType={CONST.KEYBOARD_TYPE.PHONE_PAD}
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
                            message={errorMessage}
                            isLoading={this.props.walletAdditionalDetails.isLoading}
                            buttonText={this.props.translate('common.saveAndContinue')}
                        />
                        <OfflineIndicator containerStyles={[styles.mh5, styles.mb3]} />
                    </FormScrollView>
                </View>
            </>
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
