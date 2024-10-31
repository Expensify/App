import {subYears} from 'date-fns';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
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
import useThemeStyles from '@hooks/useThemeStyles';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import {parsePhoneNumber} from '@libs/PhoneNumber';
import * as ValidationUtils from '@libs/ValidationUtils';
import AddressFormFields from '@pages/ReimbursementAccount/AddressFormFields';
import * as Wallet from '@userActions/Wallet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/AdditionalDetailStepForm';
import type {WalletAdditionalDetails} from '@src/types/onyx';
import IdologyQuestions from './IdologyQuestions';

const DEFAULT_WALLET_ADDITIONAL_DETAILS = {
    errorFields: {},
    isLoading: false,
    errors: {},
    questions: [],
    idNumber: '',
    errorCode: '',
};

type AdditionalDetailsStepOnyxProps = {
    /** Stores additional information about the additional details step e.g. loading state and errors with fields */
    walletAdditionalDetails: OnyxEntry<WalletAdditionalDetails>;
};

type AdditionalDetailsStepProps = AdditionalDetailsStepOnyxProps & WithCurrentUserPersonalDetailsProps;

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
function AdditionalDetailsStep({walletAdditionalDetails = DEFAULT_WALLET_ADDITIONAL_DETAILS, currentUserPersonalDetails}: AdditionalDetailsStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const currentDate = new Date();
    const minDate = subYears(currentDate, CONST.DATE_BIRTH.MAX_AGE);
    const maxDate = subYears(currentDate, CONST.DATE_BIRTH.MIN_AGE_FOR_PAYMENT);
    const shouldAskForFullSSN = walletAdditionalDetails?.errorCode === CONST.WALLET.ERROR.SSN;

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS>): FormInputErrors<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS> => {
        const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);

        if (values.dob) {
            if (!ValidationUtils.isValidPastDate(values.dob) || !ValidationUtils.meetsMaximumAgeRequirement(values.dob)) {
                errors.dob = translate('bankAccount.error.dob');
            } else if (!ValidationUtils.meetsMinimumAgeRequirement(values.dob)) {
                errors.dob = translate('bankAccount.error.age');
            }
        }

        if (values.addressStreet && !ValidationUtils.isValidAddress(values.addressStreet)) {
            errors.addressStreet = translate('bankAccount.error.addressStreet');
        }

        if (values.addressZipCode && !ValidationUtils.isValidZipCode(values.addressZipCode)) {
            errors.addressZipCode = translate('bankAccount.error.zipCode');
        }

        if (values.phoneNumber && !ValidationUtils.isValidUSPhone(values.phoneNumber, true)) {
            errors.phoneNumber = translate('bankAccount.error.phoneNumber');
        }

        // walletAdditionalDetails stores errors returned by the server. If the server returns an SSN error
        // then the user needs to provide the full 9 digit SSN.
        if (walletAdditionalDetails?.errorCode === CONST.WALLET.ERROR.SSN) {
            if (values.ssn && !ValidationUtils.isValidSSNFullNine(values.ssn)) {
                errors.ssn = translate('additionalDetailsStep.ssnFull9Error');
            }
        } else if (values.ssn && !ValidationUtils.isValidSSNLastFour(values.ssn)) {
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
        Wallet.updatePersonalDetails(personalDetails);
    };

    if (walletAdditionalDetails?.questions && walletAdditionalDetails.questions.length > 0) {
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
                        defaultValue={PersonalDetailsUtils.extractFirstAndLastNameFromAvailableDetails(currentUserPersonalDetails).firstName}
                        shouldSaveDraft
                    />
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID="legalLastName"
                        containerStyles={[styles.mt4]}
                        label={translate(fieldNameTranslationKeys.legalLastName)}
                        accessibilityLabel={translate(fieldNameTranslationKeys.legalLastName)}
                        role={CONST.ROLE.PRESENTATION}
                        defaultValue={PersonalDetailsUtils.extractFirstAndLastNameFromAvailableDetails(currentUserPersonalDetails).lastName}
                        shouldSaveDraft
                    />
                    <AddressFormFields
                        formID={ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS}
                        inputKeys={{
                            street: 'addressStreet',
                            city: 'addressCity',
                            state: 'addressState',
                            zipCode: 'addressZipCode',
                        }}
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
                        role={CONST.ROLE.PRESENTATION}
                        defaultValue={currentUserPersonalDetails.phoneNumber}
                        placeholder={translate('common.phoneNumberPlaceholder')}
                        shouldSaveDraft
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
                    />
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID="ssn"
                        containerStyles={[styles.mt4]}
                        label={translate(fieldNameTranslationKeys[shouldAskForFullSSN ? 'ssnFull9' : 'ssn'])}
                        accessibilityLabel={translate(fieldNameTranslationKeys[shouldAskForFullSSN ? 'ssnFull9' : 'ssn'])}
                        role={CONST.ROLE.PRESENTATION}
                        maxLength={shouldAskForFullSSN ? 9 : 4}
                        inputMode={CONST.INPUT_MODE.NUMERIC}
                    />
                </FormProvider>
            </View>
        </>
    );
}

AdditionalDetailsStep.displayName = 'AdditionalDetailsStep';

export default withCurrentUserPersonalDetails(
    withOnyx<AdditionalDetailsStepProps, AdditionalDetailsStepOnyxProps>({
        // @ts-expect-error: ONYXKEYS.WALLET_ADDITIONAL_DETAILS is conflicting with ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS
        walletAdditionalDetails: {
            key: ONYXKEYS.WALLET_ADDITIONAL_DETAILS,
        },
    })(AdditionalDetailsStep),
);
