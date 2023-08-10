import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import moment from 'moment/moment';
import {parsePhoneNumber} from 'awesome-phonenumber';
import IdologyQuestions from './IdologyQuestions';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import CONST from '../../CONST';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import TextLink from '../../components/TextLink';
import TextInput from '../../components/TextInput';
import * as Wallet from '../../libs/actions/Wallet';
import * as ValidationUtils from '../../libs/ValidationUtils';
import * as ErrorUtils from '../../libs/ErrorUtils';
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
        questions: PropTypes.arrayOf(
            PropTypes.shape({
                prompt: PropTypes.string,
                type: PropTypes.string,
                answer: PropTypes.arrayOf(PropTypes.string),
            }),
        ),

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
const errorTranslationKeys = {
    legalFirstName: 'bankAccount.error.firstName',
    legalLastName: 'bankAccount.error.lastName',
    phoneNumber: 'bankAccount.error.phoneNumber',
    dob: 'bankAccount.error.dob',
    age: 'bankAccount.error.age',
    ssn: 'bankAccount.error.ssnLast4',
    ssnFull9: 'additionalDetailsStep.ssnFull9Error',
};

const fieldNameTranslationKeys = {
    legalFirstName: 'additionalDetailsStep.legalFirstNameLabel',
    legalLastName: 'additionalDetailsStep.legalLastNameLabel',
    addressStreet: 'common.personalAddress',
    phoneNumber: 'common.phoneNumber',
    dob: 'common.dob',
    ssn: 'common.ssnLast4',
    ssnFull9: 'common.ssnFull9',
};

function AdditionalDetailsStep({walletAdditionalDetails, translate, currentUserPersonalDetails}) {
    const minDate = moment().subtract(CONST.DATE_BIRTH.MAX_AGE, 'Y').toDate();
    const maxDate = moment().subtract(CONST.DATE_BIRTH.MIN_AGE_FOR_PAYMENT, 'Y').toDate();
    const shouldAskForFullSSN = walletAdditionalDetails.errorCode === CONST.WALLET.ERROR.SSN;

    /**
     * @param {Object} values The values object is passed from Form.js and contains info for each form element that has an inputID
     * @returns {Object}
     */
    const validate = (values) => {
        const errors = {};

        if (_.isEmpty(values[INPUT_IDS.LEGAL_FIRST_NAME])) {
            errors[INPUT_IDS.LEGAL_FIRST_NAME] = errorTranslationKeys.legalFirstName;
        }

        if (_.isEmpty(values[INPUT_IDS.LEGAL_LAST_NAME])) {
            errors[INPUT_IDS.LEGAL_LAST_NAME] = errorTranslationKeys.legalLastName;
        }

        if (!ValidationUtils.isValidPastDate(values[INPUT_IDS.DOB]) || !ValidationUtils.meetsMaximumAgeRequirement(values[INPUT_IDS.DOB])) {
            ErrorUtils.addErrorMessage(errors, INPUT_IDS.DOB, errorTranslationKeys.dob);
        } else if (!ValidationUtils.meetsMinimumAgeRequirement(values[INPUT_IDS.DOB])) {
            ErrorUtils.addErrorMessage(errors, INPUT_IDS.DOB, errorTranslationKeys.age);
        }

        if (!ValidationUtils.isValidAddress(values[INPUT_IDS.ADDRESS.street]) || _.isEmpty(values[INPUT_IDS.ADDRESS.street])) {
            errors[INPUT_IDS.ADDRESS.street] = 'bankAccount.error.addressStreet';
        }

        if (_.isEmpty(values[INPUT_IDS.ADDRESS.city])) {
            errors[INPUT_IDS.ADDRESS.city] = 'bankAccount.error.addressCity';
        }

        if (_.isEmpty(values[INPUT_IDS.ADDRESS.state])) {
            errors[INPUT_IDS.ADDRESS.state] = 'bankAccount.error.addressState';
        }

        if (!ValidationUtils.isValidZipCode(values[INPUT_IDS.ADDRESS.zipCode])) {
            errors[INPUT_IDS.ADDRESS.zipCode] = 'bankAccount.error.zipCode';
        }

        if (!ValidationUtils.isValidUSPhone(values[INPUT_IDS.PHONE_NUMBER], true)) {
            errors[INPUT_IDS.PHONE_NUMBER] = errorTranslationKeys.phoneNumber;
        }

        // walletAdditionalDetails stores errors returned by the server. If the server returns an SSN error
        // then the user needs to provide the full 9 digit SSN.
        if (walletAdditionalDetails.errorCode === CONST.WALLET.ERROR.SSN) {
            if (!ValidationUtils.isValidSSNFullNine(values[INPUT_IDS.SSN])) {
                errors[INPUT_IDS.SSN] = errorTranslationKeys.ssnFull9;
            }
        } else if (!ValidationUtils.isValidSSNLastFour(values[INPUT_IDS.SSN])) {
            errors[INPUT_IDS.SSN] = errorTranslationKeys.ssn;
        }

        return errors;
    };

    /**
     * @param {Object} values The values object is passed from Form.js and contains info for each form element that has an inputID
     */
    const activateWallet = (values) => {
        const personalDetails = {
            phoneNumber: parsePhoneNumber(values[INPUT_IDS.PHONE_NUMBER], {regionCode: CONST.COUNTRY.US}).number.significant,
            legalFirstName: values[INPUT_IDS.LEGAL_FIRST_NAME],
            legalLastName: values[INPUT_IDS.LEGAL_LAST_NAME],
            addressStreet: values[INPUT_IDS.ADDRESS.street],
            addressCity: values[INPUT_IDS.ADDRESS.city],
            addressState: values[INPUT_IDS.ADDRESS.state],
            addressZip: values[INPUT_IDS.ADDRESS.zipCode],
            dob: values[INPUT_IDS.DOB],
            ssn: values[INPUT_IDS.SSN],
        };

        // Attempt to set the personal details
        Wallet.updatePersonalDetails(personalDetails);
    };

    if (!_.isEmpty(walletAdditionalDetails.questions)) {
        return (
            <ScreenWrapper
                style={[styles.flex1]}
                keyboardAvoidingViewBehavior="height"
            >
                <HeaderWithBackButton
                    title={translate('additionalDetailsStep.headerTitle')}
                    onBackButtonPress={() => Wallet.setAdditionalDetailsQuestions(null)}
                />
                <IdologyQuestions
                    questions={walletAdditionalDetails.questions}
                    idNumber={walletAdditionalDetails.idNumber}
                />
            </ScreenWrapper>
        );
    }

    return (
        <>
            <HeaderWithBackButton title={translate('additionalDetailsStep.headerTitle')} />
            <View style={[styles.flex1]}>
                <View style={[styles.ph5]}>
                    <Text style={styles.mb3}>{translate('additionalDetailsStep.helpText')}</Text>
                    <TextLink
                        style={styles.mb3}
                        href="https://use.expensify.com/usa-patriot-act"
                    >
                        {translate('additionalDetailsStep.helpLink')}
                    </TextLink>
                </View>
                <Form
                    formID={ONYXKEYS.WALLET_ADDITIONAL_DETAILS}
                    validate={validate}
                    onSubmit={activateWallet}
                    scrollContextEnabled
                    submitButtonText={translate('common.saveAndContinue')}
                    style={[styles.mh5, styles.flexGrow1]}
                >
                    <TextInput
                        inputID={INPUT_IDS.LEGAL_FIRST_NAME}
                        containerStyles={[styles.mt4]}
                        label={translate(fieldNameTranslationKeys.legalFirstName)}
                        accessibilityLabel={translate(fieldNameTranslationKeys.legalFirstName)}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        defaultValue={PersonalDetails.extractFirstAndLastNameFromAvailableDetails(currentUserPersonalDetails).firstName}
                        shouldSaveDraft
                    />
                    <TextInput
                        inputID={INPUT_IDS.LEGAL_LAST_NAME}
                        containerStyles={[styles.mt4]}
                        label={translate(fieldNameTranslationKeys.legalLastName)}
                        accessibilityLabel={translate(fieldNameTranslationKeys.legalLastName)}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        defaultValue={PersonalDetails.extractFirstAndLastNameFromAvailableDetails(currentUserPersonalDetails).lastName}
                        shouldSaveDraft
                    />
                    <AddressForm
                        inputKeys={INPUT_IDS.ADDRESS}
                        translate={translate}
                        streetTranslationKey={fieldNameTranslationKeys.addressStreet}
                        shouldSaveDraft
                    />
                    <TextInput
                        inputID={INPUT_IDS.PHONE_NUMBER}
                        containerStyles={[styles.mt4]}
                        keyboardType={CONST.KEYBOARD_TYPE.PHONE_PAD}
                        label={translate(fieldNameTranslationKeys.phoneNumber)}
                        accessibilityLabel={translate(fieldNameTranslationKeys.phoneNumber)}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        defaultValue={currentUserPersonalDetails.phoneNumber}
                        placeholder={translate('common.phoneNumberPlaceholder')}
                        shouldSaveDraft
                    />
                    <DatePicker
                        inputID={INPUT_IDS.DOB}
                        containerStyles={[styles.mt4]}
                        label={translate(fieldNameTranslationKeys.dob)}
                        placeholder={translate('common.dob')}
                        minDate={minDate}
                        maxDate={maxDate}
                        shouldSaveDraft
                    />
                    <TextInput
                        inputID={INPUT_IDS.SSN}
                        containerStyles={[styles.mt4]}
                        label={translate(fieldNameTranslationKeys[shouldAskForFullSSN ? 'ssnFull9' : 'ssn'])}
                        accessibilityLabel={translate(fieldNameTranslationKeys[shouldAskForFullSSN ? 'ssnFull9' : 'ssn'])}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        maxLength={shouldAskForFullSSN ? 9 : 4}
                        keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                    />
                    <OfflineIndicator containerStyles={[styles.mh5, styles.mb3]} />
                </Form>
            </View>
        </>
    );
}

AdditionalDetailsStep.propTypes = propTypes;
AdditionalDetailsStep.defaultProps = defaultProps;
AdditionalDetailsStep.displayName = 'AdditionalDetailsStep';

export default compose(
    withLocalize,
    withCurrentUserPersonalDetails,
    withOnyx({
        walletAdditionalDetails: {
            key: ONYXKEYS.WALLET_ADDITIONAL_DETAILS,
        },
    }),
)(AdditionalDetailsStep);
