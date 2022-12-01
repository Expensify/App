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
import CONST from '../../CONST';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import TextLink from '../../components/TextLink';
import TextInput from '../../components/TextInput';
import * as Wallet from '../../libs/actions/Wallet';
import * as ValidationUtils from '../../libs/ValidationUtils';
import * as LoginUtils from '../../libs/LoginUtils';
import AddressForm from '../ReimbursementAccount/AddressForm';
import DatePicker from '../../components/DatePicker';
import Form from '../../components/Form';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../components/withCurrentUserPersonalDetails';
import * as PersonalDetails from '../../libs/actions/PersonalDetails';
import OfflineIndicator from '../../components/OfflineIndicator';

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
    ...withCurrentUserPersonalDetailsDefaultProps,
};

const INPUT_IDS = {
    LEGAL_FIRST_NAME: 'legalFirstName',
    LEGAL_LAST_NAME: 'legalLastName',
    PHONE_NUMBER: 'phoneNumber',
    DOB: 'dob',
    SSN: 'ssn',
    ADDRESS: {
        street: 'addressStreet',
        city: 'addressCity',
        state: 'addressState',
        zipCode: 'addressZip',
    },
};

class AdditionalDetailsStep extends React.Component {
    constructor(props) {
        super(props);

        this.activateWallet = this.activateWallet.bind(this);
        this.validate = this.validate.bind(this);

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
    }

    getFirstName() {
        return PersonalDetails.extractFirstAndLastNameFromAvailableDetails(this.props.currentUserPersonalDetails).firstName;
    }

    getLastName() {
        return PersonalDetails.extractFirstAndLastNameFromAvailableDetails(this.props.currentUserPersonalDetails).lastName;
    }

    getPhoneNumber() {
        return this.props.currentUserPersonalDetails.phoneNumber;
    }

    /**
     * @param {Object} values The values object is passed from Form.js and contains info for each form element that has an inputID
     * @returns {Object}
     */
    validate(values) {
        const errors = {};

        if (_.isEmpty(values[INPUT_IDS.LEGAL_FIRST_NAME])) {
            errors[INPUT_IDS.LEGAL_FIRST_NAME] = this.props.translate(this.errorTranslationKeys.legalFirstName);
        }

        if (_.isEmpty(values[INPUT_IDS.LEGAL_LAST_NAME])) {
            errors[INPUT_IDS.LEGAL_LAST_NAME] = this.props.translate(this.errorTranslationKeys.legalLastName);
        }

        if (!ValidationUtils.isValidPastDate(values[INPUT_IDS.DOB])) {
            errors[INPUT_IDS.DOB] = this.props.translate(this.errorTranslationKeys.dob);
        }

        if (!ValidationUtils.meetsAgeRequirements(values[INPUT_IDS.DOB])) {
            errors[INPUT_IDS.DOB] = this.props.translate(this.errorTranslationKeys.age);
        }

        if (!ValidationUtils.isValidAddress(values[INPUT_IDS.ADDRESS.street])) {
            errors[INPUT_IDS.ADDRESS.street] = this.props.translate('bankAccount.error.addressStreet');
        }

        if (_.isEmpty(values[INPUT_IDS.ADDRESS.city])) {
            errors[INPUT_IDS.ADDRESS.city] = this.props.translate('bankAccount.error.addressCity');
        }

        if (_.isEmpty(values[INPUT_IDS.ADDRESS.state])) {
            errors[INPUT_IDS.ADDRESS.state] = this.props.translate('bankAccount.error.addressState');
        }

        if (!ValidationUtils.isValidZipCode(values[INPUT_IDS.ADDRESS.zipCode])) {
            errors[INPUT_IDS.ADDRESS.zipCode] = this.props.translate('bankAccount.error.zipCode');
        }

        if (!ValidationUtils.isValidUSPhone(values[INPUT_IDS.PHONE_NUMBER], true)) {
            errors[INPUT_IDS.PHONE_NUMBER] = this.props.translate(this.errorTranslationKeys.phoneNumber);
        }

        if (this.props.walletAdditionalDetails.errorCode === CONST.WALLET.ERROR.SSN) {
            if (!ValidationUtils.isValidSSNFullNine(values[INPUT_IDS.SSN])) {
                errors[INPUT_IDS.SSN] = this.props.translate(this.errorTranslationKeys.ssnFull9);
            }
        } else if (!ValidationUtils.isValidSSNLastFour(values[INPUT_IDS.SSN])) {
            errors[INPUT_IDS.SSN] = this.props.translate(this.errorTranslationKeys.ssn);
        }

        return errors;
    }

    /**
     * @param {Object} values The values object is passed from Form.js and contains info for each form element that has an inputID
     */
    activateWallet(values) {
        if (!this.validate()) {
            return;
        }
        const personalDetails = {
            phoneNumber: LoginUtils.getPhoneNumberWithoutUSCountryCodeAndSpecialChars(values[INPUT_IDS.PHONE_NUMBER]),
            legalFirstName: values[INPUT_IDS.LEGAL_FIRST_NAME],
            legalLastName: values[INPUT_IDS.LEGAL_LAST_NAME],
            addressStreet: values[INPUT_IDS.ADDRESS.street],
            addressCity: values[INPUT_IDS.ADDRESS.city],
            addressState: values[INPUT_IDS.ADDRESS.state],
            addressZip: values[INPUT_IDS.ADDRESS.zipCode],
            dob: values[INPUT_IDS.DOB],
            ssn: values[INPUT_IDS.SSN],
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
                                    shouldSaveDraft
                                />
                                <TextInput
                                    inputID={INPUT_IDS.LEGAL_LAST_NAME}
                                    containerStyles={[styles.mt4]}
                                    label={this.props.translate(this.fieldNameTranslationKeys.legalLastName)}
                                    defaultValue={this.getLastName()}
                                    shouldSaveDraft
                                />
                                <AddressForm
                                    inputKeys={INPUT_IDS.ADDRESS}
                                    translate={this.props.translate}
                                    streetTranslationKey={this.fieldNameTranslationKeys.addressStreet}
                                    shouldSaveDraft
                                />
                            </View>
                            <TextInput
                                inputID={INPUT_IDS.PHONE_NUMBER}
                                containerStyles={[styles.mt4]}
                                keyboardType={CONST.KEYBOARD_TYPE.PHONE_PAD}
                                label={this.props.translate(this.fieldNameTranslationKeys.phoneNumber)}
                                defaultValue={this.getPhoneNumber()}
                                placeholder={this.props.translate('common.phoneNumberPlaceholder')}
                                shouldSaveDraft
                            />
                            <DatePicker
                                inputID={INPUT_IDS.DOB}
                                containerStyles={[styles.mt4]}
                                label={this.props.translate(this.fieldNameTranslationKeys.dob)}
                                placeholder={this.props.translate('common.dob')}
                                maximumDate={new Date()}
                                shouldSaveDraft
                            />
                            <TextInput
                                inputID={INPUT_IDS.SSN}
                                containerStyles={[styles.mt4]}
                                label={this.props.translate(this.fieldNameTranslationKeys[shouldAskForFullSSN ? 'ssnFull9' : 'ssn'])}
                                maxLength={shouldAskForFullSSN ? 9 : 4}
                                keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
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
    }),
)(AdditionalDetailsStep);
