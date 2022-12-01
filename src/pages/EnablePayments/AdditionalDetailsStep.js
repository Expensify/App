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

const INPUT_IDS = {
    LEGAL_FIRST_NAME: 'legalFirstName',
    LEGAL_LAST_NAME: 'legalLastName',
    PHONE_NUMBER: 'phoneNumber',
    DOB: 'dob',
    AGE: 'age',
    SSN: 'ssn',
    SSN_FULL_9: 'ssnFull9',
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

        this.validate = this.validate.bind(this);
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
        const errors = {};

        if (!this.getFirstName()) {
            errors[INPUT_IDS.LEGAL_FIRST_NAME] = this.props.translate(this.errorTranslationKeys.legalFirstName);
        }

        if (!this.getLastName()) {
            errors[INPUT_IDS.LEGAL_LAST_NAME] = this.props.translate(this.errorTranslationKeys.legalLastName);
        }

        if (!ValidationUtils.isValidPastDate(this.props.walletAdditionalDetailsDraft.dob)) {
            errors[INPUT_IDS.DOB] = this.props.translate(this.errorTranslationKeys.dob);
        }

        if (!ValidationUtils.meetsAgeRequirements(this.props.walletAdditionalDetailsDraft.dob)) {
            errors[INPUT_IDS.AGE] = this.props.translate(this.errorTranslationKeys.age);
        }

        // if (!ValidationUtils.isValidAddress(this.props.walletAdditionalDetailsDraft.addressStreet)) {
        //     errors.addressStreet = true;
        // }
        //
        // if (_.isEmpty(this.props.walletAdditionalDetailsDraft.addressCity)) {
        //     errors.addressCity = true;
        // }
        //
        // if (_.isEmpty(this.props.walletAdditionalDetailsDraft.addressState)) {
        //     errors.addressState = true;
        // }
        //
        // if (!ValidationUtils.isValidZipCode(this.props.walletAdditionalDetailsDraft.addressZip)) {
        //     errors.addressZip = true;
        // }

        if (!ValidationUtils.isValidUSPhone(this.props.walletAdditionalDetailsDraft.phoneNumber, true)) {
            errors[INPUT_IDS.PHONE_NUMBER] = this.props.translate(this.errorTranslationKeys.phoneNumber);
        }

        if (this.props.walletAdditionalDetails.errorCode === CONST.WALLET.ERROR.SSN) {
            if (!ValidationUtils.isValidSSNFullNine(this.props.walletAdditionalDetailsDraft.ssn)) {
                errors[INPUT_IDS.SSN_FULL_9] = this.props.translate(this.errorTranslationKeys.ssnFull9);
            }
        } else if (!ValidationUtils.isValidSSNLastFour(this.props.walletAdditionalDetailsDraft.ssn)) {
            errors[INPUT_IDS.SSN] = this.props.translate(this.errorTranslationKeys.ssn);
        }

        return errors;
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
                    <Form
                        formID={ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS_FORM}
                        validate={this.validate}
                        onSubmit={this.activateWallet}
                        submitButtonText={this.props.translate('common.saveAndContinue')}
                        style={[styles.flexGrow1]}
                    >
                        <View style={[styles.mh5, styles.mb5]}>
                            <View style={styles.mt4}>
                                <TextInput
                                    inputID={INPUT_IDS.LEGAL_FIRST_NAME}
                                    containerStyles={[styles.mt4]}
                                    label={this.props.translate(this.fieldNameTranslationKeys.legalFirstName)}
                                    defaultValue={this.getFirstName()}
                                    errorText={this.getErrorText('legalFirstName')}
                                    shouldSaveDraft
                                />
                                <TextInput
                                    inputID={INPUT_IDS.LEGAL_LAST_NAME}
                                    containerStyles={[styles.mt4]}
                                    label={this.props.translate(this.fieldNameTranslationKeys.legalLastName)}
                                    defaultValue={this.getLastName()}
                                    errorText={this.getErrorText('legalLastName')}
                                    shouldSaveDraft
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
                                />
                            </View>
                            <TextInput
                                inputID={INPUT_IDS.PHONE_NUMBER}
                                containerStyles={[styles.mt4]}
                                keyboardType={CONST.KEYBOARD_TYPE.PHONE_PAD}
                                label={this.props.translate(this.fieldNameTranslationKeys.phoneNumber)}
                                defaultValue={this.props.walletAdditionalDetailsDraft.phoneNumber || ''}
                                placeholder={this.props.translate('common.phoneNumberPlaceholder')}
                                errorText={this.getErrorText('phoneNumber')}
                                shouldSaveDraft
                            />
                            <DatePicker
                                inputID={INPUT_IDS.DOB}
                                containerStyles={[styles.mt4]}
                                label={this.props.translate(this.fieldNameTranslationKeys.dob)}
                                defaultValue={this.props.walletAdditionalDetailsDraft.dob || ''}
                                placeholder={this.props.translate('common.dob')}
                                errorText={this.getErrorText('dob') || this.getErrorText('age')}
                                maximumDate={new Date()}
                                shouldSaveDraft
                            />
                            <TextInput
                                inputID={INPUT_IDS.SSN}
                                containerStyles={[styles.mt4]}
                                label={this.props.translate(this.fieldNameTranslationKeys[shouldAskForFullSSN ? 'ssnFull9' : 'ssn'])}
                                defaultValue={this.props.walletAdditionalDetailsDraft.ssn || ''}
                                errorText={this.getErrorText('ssnFull9') || this.getErrorText('ssn')}
                                maxLength={shouldAskForFullSSN ? 9 : 4}
                                keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                                shouldSaveDraft // I thought we weren't supposed to save drafts of SSNs or passwords...
                            />
                        </View>
                        <OfflineIndicator containerStyles={[styles.mh5, styles.mb3]} />
                    </Form>
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
            key: ONYXKEYS.WALLET_ADDITIONAL_DETAILS_FORM,
            initWithStoredValues: false,
        },
        walletAdditionalDetailsDraft: {
            key: 'walletAdditionalDetailsFormDraft',
        },
    }),
)(AdditionalDetailsStep);
