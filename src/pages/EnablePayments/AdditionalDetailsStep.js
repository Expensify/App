import {parsePhoneNumber} from 'awesome-phonenumber';
import {subYears} from 'date-fns';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import NewDatePicker from '@components/NewDatePicker';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import TextLink from '@components/TextLink';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import * as ValidationUtils from '@libs/ValidationUtils';
import AddressForm from '@pages/ReimbursementAccount/AddressForm';
import useThemeStyles from '@styles/useThemeStyles';
import * as PersonalDetails from '@userActions/PersonalDetails';
import * as Wallet from '@userActions/Wallet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import IdologyQuestions from './IdologyQuestions';

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
    const styles = useThemeStyles();
    const currentDate = new Date();
    const minDate = subYears(currentDate, CONST.DATE_BIRTH.MAX_AGE);
    const maxDate = subYears(currentDate, CONST.DATE_BIRTH.MIN_AGE_FOR_PAYMENT);
    const shouldAskForFullSSN = walletAdditionalDetails.errorCode === CONST.WALLET.ERROR.SSN;

    /**
     * @param {Object} values The values object is passed from Form.js and contains info for each form element that has an inputID
     * @returns {Object}
     */
    const validate = (values) => {
        const requiredFields = ['legalFirstName', 'legalLastName', 'addressStreet', 'addressCity', 'addressZipCode', 'phoneNumber', 'dob', 'ssn', 'addressState'];
        const errors = ValidationUtils.getFieldRequiredErrors(values, requiredFields);

        if (values.dob) {
            if (!ValidationUtils.isValidPastDate(values.dob) || !ValidationUtils.meetsMaximumAgeRequirement(values.dob)) {
                errors.dob = 'bankAccount.error.dob';
            } else if (!ValidationUtils.meetsMinimumAgeRequirement(values.dob)) {
                errors.dob = 'bankAccount.error.age';
            }
        }

        if (values.addressStreet && !ValidationUtils.isValidAddress(values.addressStreet)) {
            errors.addressStreet = 'bankAccount.error.addressStreet';
        }

        if (values.addressZipCode && !ValidationUtils.isValidZipCode(values.addressZipCode)) {
            errors.addressZipCode = 'bankAccount.error.zipCode';
        }

        if (values.phoneNumber && !ValidationUtils.isValidUSPhone(values.phoneNumber, true)) {
            errors.phoneNumber = 'bankAccount.error.phoneNumber';
        }

        // walletAdditionalDetails stores errors returned by the server. If the server returns an SSN error
        // then the user needs to provide the full 9 digit SSN.
        if (walletAdditionalDetails.errorCode === CONST.WALLET.ERROR.SSN) {
            if (values.ssn && !ValidationUtils.isValidSSNFullNine(values.ssn)) {
                errors.ssn = 'additionalDetailsStep.ssnFull9Error';
            }
        } else if (values.ssn && !ValidationUtils.isValidSSNLastFour(values.ssn)) {
            errors.ssn = 'bankAccount.error.ssnLast4';
        }

        return errors;
    };

    /**
     * @param {Object} values The values object is passed from Form.js and contains info for each form element that has an inputID
     */
    const activateWallet = (values) => {
        const personalDetails = {
            phoneNumber: parsePhoneNumber(values.phoneNumber, {regionCode: CONST.COUNTRY.US}).number.significant,
            legalFirstName: values.legalFirstName,
            legalLastName: values.legalLastName,
            addressStreet: values.addressStreet,
            addressCity: values.addressCity,
            addressState: values.addressState,
            addressZip: values.addressZipCode,
            dob: values.dob,
            ssn: values.ssn,
        };
        // Attempt to set the personal details
        Wallet.updatePersonalDetails(personalDetails);
    };

    if (!_.isEmpty(walletAdditionalDetails.questions)) {
        return (
            <ScreenWrapper
                shouldShowOfflineIndicator={false}
                style={[styles.flex1, styles.pt0]}
                keyboardAvoidingViewBehavior="height"
                testID={AdditionalDetailsStep.displayName}
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
                <FormProvider
                    formID={ONYXKEYS.WALLET_ADDITIONAL_DETAILS}
                    validate={validate}
                    onSubmit={activateWallet}
                    scrollContextEnabled
                    submitButtonText={translate('common.saveAndContinue')}
                    style={[styles.mh5, styles.flexGrow1]}
                >
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID="legalFirstName"
                        containerStyles={[styles.mt4]}
                        label={translate(fieldNameTranslationKeys.legalFirstName)}
                        accessibilityLabel={translate(fieldNameTranslationKeys.legalFirstName)}
                        role={CONST.ACCESSIBILITY_ROLE.TEXT}
                        defaultValue={PersonalDetails.extractFirstAndLastNameFromAvailableDetails(currentUserPersonalDetails).firstName}
                        shouldSaveDraft
                    />
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID="legalLastName"
                        containerStyles={[styles.mt4]}
                        label={translate(fieldNameTranslationKeys.legalLastName)}
                        accessibilityLabel={translate(fieldNameTranslationKeys.legalLastName)}
                        role={CONST.ACCESSIBILITY_ROLE.TEXT}
                        defaultValue={PersonalDetails.extractFirstAndLastNameFromAvailableDetails(currentUserPersonalDetails).lastName}
                        shouldSaveDraft
                    />
                    <AddressForm
                        inputKeys={{
                            street: 'addressStreet',
                            city: 'addressCity',
                            state: 'addressState',
                            zipCode: 'addressZipCode',
                        }}
                        translate={translate}
                        streetTranslationKey={fieldNameTranslationKeys.addressStreet}
                        shouldSaveDraft
                    />
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID="phoneNumber"
                        containerStyles={[styles.mt4]}
                        inputMode={CONST.INPUT_MODE.TEL}
                        label={translate(fieldNameTranslationKeys.phoneNumber)}
                        accessibilityLabel={translate(fieldNameTranslationKeys.phoneNumber)}
                        role={CONST.ACCESSIBILITY_ROLE.TEXT}
                        defaultValue={currentUserPersonalDetails.phoneNumber}
                        placeholder={translate('common.phoneNumberPlaceholder')}
                        shouldSaveDraft
                    />
                    <NewDatePicker
                        inputID="dob"
                        containerStyles={[styles.mt4]}
                        label={translate(fieldNameTranslationKeys.dob)}
                        placeholder={translate('common.dob')}
                        minDate={minDate}
                        maxDate={maxDate}
                        shouldSaveDraft
                    />
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID="ssn"
                        containerStyles={[styles.mt4]}
                        label={translate(fieldNameTranslationKeys[shouldAskForFullSSN ? 'ssnFull9' : 'ssn'])}
                        accessibilityLabel={translate(fieldNameTranslationKeys[shouldAskForFullSSN ? 'ssnFull9' : 'ssn'])}
                        role={CONST.ACCESSIBILITY_ROLE.TEXT}
                        maxLength={shouldAskForFullSSN ? 9 : 4}
                        inputMode={CONST.INPUT_MODE.NUMERIC}
                    />
                </FormProvider>
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
