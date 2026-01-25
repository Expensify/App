import {subYears} from 'date-fns';
import React from 'react';
import {View} from 'react-native';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import TextLink from '@components/TextLink';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {extractFirstAndLastNameFromAvailableDetails} from '@libs/PersonalDetailsUtils';
import {parsePhoneNumber} from '@libs/PhoneNumber';
import {
    getFieldRequiredErrors,
    isValidAddress,
    isValidPastDate,
    isValidSSNFullNine,
    isValidSSNLastFour,
    isValidUSPhone,
    isValidZipCode,
    meetsMaximumAgeRequirement,
    meetsMinimumAgeRequirement,
} from '@libs/ValidationUtils';
import AddressFormFields from '@pages/ReimbursementAccount/AddressFormFields';
import {setAdditionalDetailsQuestions, updatePersonalDetails} from '@userActions/Wallet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/AdditionalDetailStepForm';
import IdologyQuestions from './IdologyQuestions';

const DEFAULT_WALLET_ADDITIONAL_DETAILS = {
    errorFields: {},
    isLoading: false,
    errors: {},
    questions: [],
    idNumber: '',
    errorCode: '',
};

type AdditionalDetailsStepProps = WithCurrentUserPersonalDetailsProps;

const fieldNameTranslationKeys = {
    legalFirstName: 'additionalDetailsStep.legalFirstNameLabel',
    legalLastName: 'additionalDetailsStep.legalLastNameLabel',
    addressStreet: 'common.personalAddress',
    phoneNumber: 'common.phoneNumber',
    dob: 'common.dob',
    ssn: 'common.ssnLast4',
    ssnFull9: 'common.ssnFull9',
} as const;
const STEP_FIELDS = [
    INPUT_IDS.LEGAL_FIRST_NAME,
    INPUT_IDS.LEGAL_LAST_NAME,
    INPUT_IDS.ADDRESS_STREET,
    INPUT_IDS.ADDRESS_CITY,
    INPUT_IDS.ADDRESS_ZIP_CODE,
    INPUT_IDS.PHONE_NUMBER,
    INPUT_IDS.DOB,
    INPUT_IDS.ADDRESS_STATE,
    INPUT_IDS.SSN,
];
function AdditionalDetailsStep({currentUserPersonalDetails}: AdditionalDetailsStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [walletAdditionalDetails = DEFAULT_WALLET_ADDITIONAL_DETAILS] = useOnyx(ONYXKEYS.WALLET_ADDITIONAL_DETAILS);
    const currentDate = new Date();
    const minDate = subYears(currentDate, CONST.DATE_BIRTH.MAX_AGE);
    const maxDate = subYears(currentDate, CONST.DATE_BIRTH.MIN_AGE_FOR_PAYMENT);
    const shouldAskForFullSSN = walletAdditionalDetails?.errorCode === CONST.WALLET.ERROR.SSN;

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS>): FormInputErrors<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS> => {
        const errors = getFieldRequiredErrors(values, STEP_FIELDS);

        if (values.dob) {
            if (!isValidPastDate(values.dob) || !meetsMaximumAgeRequirement(values.dob)) {
                errors.dob = translate('bankAccount.error.dob');
            } else if (!meetsMinimumAgeRequirement(values.dob)) {
                errors.dob = translate('bankAccount.error.age');
            }
        }

        if (values.addressStreet && !isValidAddress(values.addressStreet)) {
            errors.addressStreet = translate('bankAccount.error.addressStreet');
        }

        if (values.addressZipCode && !isValidZipCode(values.addressZipCode)) {
            errors.addressZipCode = translate('bankAccount.error.zipCode');
        }

        if (values.phoneNumber && !isValidUSPhone(values.phoneNumber, true)) {
            errors.phoneNumber = translate('bankAccount.error.phoneNumber');
        }

        // walletAdditionalDetails stores errors returned by the server. If the server returns an SSN error
        // then the user needs to provide the full 9 digit SSN.
        if (walletAdditionalDetails?.errorCode === CONST.WALLET.ERROR.SSN) {
            if (values.ssn && !isValidSSNFullNine(values.ssn)) {
                errors.ssn = translate('additionalDetailsStep.ssnFull9Error');
            }
        } else if (values.ssn && !isValidSSNLastFour(values.ssn)) {
            errors.ssn = translate('bankAccount.error.ssnLast4');
        }

        return errors;
    };

    const activateWallet = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS>) => {
        const personalDetails = {
            phoneNumber: (values.phoneNumber && parsePhoneNumber(values.phoneNumber, {regionCode: CONST.COUNTRY.US}).number?.significant) ?? '',
            legalFirstName: values.legalFirstName ?? '',
            legalLastName: values.legalLastName ?? '',
            addressStreet: values.addressStreet ?? '',
            addressCity: values.addressCity ?? '',
            addressState: values.addressState ?? '',
            addressZip: values.addressZipCode ?? '',
            dob: values.dob ?? '',
            ssn: values.ssn ?? '',
        };
        // Attempt to set the personal details
        updatePersonalDetails(personalDetails);
    };

    if (walletAdditionalDetails?.questions && walletAdditionalDetails.questions.length > 0) {
        return (
            <ScreenWrapper
                shouldShowOfflineIndicator={false}
                style={[styles.flex1, styles.pt0]}
                keyboardAvoidingViewBehavior="height"
                testID="AdditionalDetailsStep"
            >
                <HeaderWithBackButton
                    title={translate('additionalDetailsStep.headerTitle')}
                    onBackButtonPress={() => setAdditionalDetailsQuestions(null)}
                />
                <IdologyQuestions
                    questions={walletAdditionalDetails.questions}
                    idNumber={walletAdditionalDetails.idNumber ?? ''}
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
                        href={CONST.HELP_LINK_URL}
                    >
                        {translate('additionalDetailsStep.helpLink')}
                    </TextLink>
                </View>
                <FormProvider
                    formID={ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS}
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
                        role={CONST.ROLE.PRESENTATION}
                        defaultValue={extractFirstAndLastNameFromAvailableDetails(currentUserPersonalDetails).firstName}
                        shouldSaveDraft
                        forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                    />
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID="legalLastName"
                        containerStyles={[styles.mt4]}
                        label={translate(fieldNameTranslationKeys.legalLastName)}
                        accessibilityLabel={translate(fieldNameTranslationKeys.legalLastName)}
                        role={CONST.ROLE.PRESENTATION}
                        defaultValue={extractFirstAndLastNameFromAvailableDetails(currentUserPersonalDetails).lastName}
                        shouldSaveDraft
                        forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                    />
                    <AddressFormFields
                        inputKeys={{
                            street: 'addressStreet',
                            city: 'addressCity',
                            state: 'addressState',
                            zipCode: 'addressZipCode',
                        }}
                        streetTranslationKey={fieldNameTranslationKeys.addressStreet}
                        shouldSaveDraft
                        forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                    />
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID="phoneNumber"
                        containerStyles={[styles.mt4]}
                        inputMode={CONST.INPUT_MODE.TEL}
                        label={translate(fieldNameTranslationKeys.phoneNumber)}
                        accessibilityLabel={translate(fieldNameTranslationKeys.phoneNumber)}
                        role={CONST.ROLE.PRESENTATION}
                        defaultValue={currentUserPersonalDetails.phoneNumber}
                        placeholder={translate('common.phoneNumberPlaceholder')}
                        shouldSaveDraft
                        forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                    />
                    <InputWrapper
                        InputComponent={DatePicker}
                        inputID="dob"
                        containerStyles={[styles.mt4]}
                        label={translate(fieldNameTranslationKeys.dob)}
                        placeholder={translate('common.dob')}
                        minDate={minDate}
                        maxDate={maxDate}
                        shouldSaveDraft
                        forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                    />
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID="ssn"
                        containerStyles={[styles.mt4]}
                        label={translate(fieldNameTranslationKeys[shouldAskForFullSSN ? 'ssnFull9' : 'ssn'])}
                        accessibilityLabel={translate(fieldNameTranslationKeys[shouldAskForFullSSN ? 'ssnFull9' : 'ssn'])}
                        role={CONST.ROLE.PRESENTATION}
                        maxLength={shouldAskForFullSSN ? CONST.BANK_ACCOUNT.MAX_LENGTH.FULL_SSN : CONST.BANK_ACCOUNT.MAX_LENGTH.SSN}
                        inputMode={CONST.INPUT_MODE.NUMERIC}
                        forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                    />
                </FormProvider>
            </View>
        </>
    );
}

export default withCurrentUserPersonalDetails(AdditionalDetailsStep);
