/* eslint-disable no-case-declarations */
import {Str} from 'expensify-common';
import React, {useCallback, useMemo, useRef} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import type {InteractiveStepSubHeaderHandle} from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as LoginUtils from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PhoneNumberUtils from '@libs/PhoneNumber';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';
import Address from './substeps/Address';
import DateOfBirth from './substeps/DateOfBirth';
import LegalName from './substeps/LegalName';
import PhoneNumber from './substeps/PhoneNumber';
import type {CountryZipRegex, CustomSubStepProps} from './types';

const formSteps = [LegalName, DateOfBirth, Address, PhoneNumber];

function MissingPersonalDetails() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const ref: ForwardedRef<InteractiveStepSubHeaderHandle> = useRef(null);
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);

    const firstUnissuedCard = useMemo(() => Object.values(cardList ?? {}).find((card) => card.state === CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED), [cardList]);

    const handleFinishStep = useCallback(() => {
        Navigation.goBack();
    }, []);

    const {
        componentToRender: SubStep,
        isEditing,
        nextScreen,
        prevScreen,
        screenIndex,
        moveTo,
        goToTheLastStep,
    } = useSubStep<CustomSubStepProps>({bodyContent: formSteps, startFrom: CONST.MISSING_PERSONAL_DETAILS_INDEXES.MAPPING.LEGAL_NAME, onFinished: handleFinishStep});

    const handleBackButtonPress = () => {
        if (isEditing) {
            goToTheLastStep();
            return;
        }

        // Clicking back on the first screen should dismiss the modal
        if (screenIndex === CONST.MISSING_PERSONAL_DETAILS_INDEXES.MAPPING.LEGAL_NAME) {
            Navigation.goBack();
            return;
        }
        ref.current?.movePrevious();
        prevScreen();
    };

    // const handleNextScreen = useCallback(() => {
    //     if (isEditing) {
    //         goToTheLastStep();
    //         return;
    //     }
    //     ref.current?.moveNext();
    //     nextScreen();
    // }, [goToTheLastStep, isEditing, nextScreen]);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> = {};
            switch (screenIndex) {
                case CONST.MISSING_PERSONAL_DETAILS_INDEXES.MAPPING.LEGAL_NAME:
                    if (!ValidationUtils.isRequiredFulfilled(values[INPUT_IDS.LEGAL_FIRST_NAME])) {
                        errors[INPUT_IDS.LEGAL_FIRST_NAME] = translate('common.error.fieldRequired');
                    } else if (!ValidationUtils.isValidLegalName(values[INPUT_IDS.LEGAL_FIRST_NAME])) {
                        errors[INPUT_IDS.LEGAL_FIRST_NAME] = translate('privatePersonalDetails.error.hasInvalidCharacter');
                    } else if (values[INPUT_IDS.LEGAL_FIRST_NAME].length > CONST.LEGAL_NAME.MAX_LENGTH) {
                        errors[INPUT_IDS.LEGAL_FIRST_NAME] = translate('common.error.characterLimitExceedCounter', {
                            length: values[INPUT_IDS.LEGAL_FIRST_NAME].length,
                            limit: CONST.LEGAL_NAME.MAX_LENGTH,
                        });
                    }
                    if (ValidationUtils.doesContainReservedWord(values[INPUT_IDS.LEGAL_FIRST_NAME], CONST.DISPLAY_NAME.RESERVED_NAMES)) {
                        ErrorUtils.addErrorMessage(errors, INPUT_IDS.LEGAL_FIRST_NAME, translate('personalDetails.error.containsReservedWord'));
                    }
                    if (!ValidationUtils.isRequiredFulfilled(values[INPUT_IDS.LEGAL_LAST_NAME])) {
                        errors[INPUT_IDS.LEGAL_LAST_NAME] = translate('common.error.fieldRequired');
                    } else if (!ValidationUtils.isValidLegalName(values[INPUT_IDS.LEGAL_LAST_NAME])) {
                        errors[INPUT_IDS.LEGAL_LAST_NAME] = translate('privatePersonalDetails.error.hasInvalidCharacter');
                    } else if (values[INPUT_IDS.LEGAL_LAST_NAME].length > CONST.LEGAL_NAME.MAX_LENGTH) {
                        errors[INPUT_IDS.LEGAL_LAST_NAME] = translate('common.error.characterLimitExceedCounter', {
                            length: values[INPUT_IDS.LEGAL_LAST_NAME].length,
                            limit: CONST.LEGAL_NAME.MAX_LENGTH,
                        });
                    }
                    if (ValidationUtils.doesContainReservedWord(values[INPUT_IDS.LEGAL_LAST_NAME], CONST.DISPLAY_NAME.RESERVED_NAMES)) {
                        ErrorUtils.addErrorMessage(errors, INPUT_IDS.LEGAL_LAST_NAME, translate('personalDetails.error.containsReservedWord'));
                    }
                    return errors;
                case CONST.MISSING_PERSONAL_DETAILS_INDEXES.MAPPING.DATE_OF_BIRTH:
                    if (!ValidationUtils.isRequiredFulfilled(values[INPUT_IDS.DATE_OF_BIRTH])) {
                        errors[INPUT_IDS.DATE_OF_BIRTH] = translate('common.error.fieldRequired');
                    } else if (!ValidationUtils.isValidPastDate(values[INPUT_IDS.DATE_OF_BIRTH]) || !ValidationUtils.meetsMaximumAgeRequirement(values[INPUT_IDS.DATE_OF_BIRTH])) {
                        errors[INPUT_IDS.DATE_OF_BIRTH] = translate('bankAccount.error.dob');
                    }
                    return errors;
                case CONST.MISSING_PERSONAL_DETAILS_INDEXES.MAPPING.ADDRESS:
                    const addressRequiredFields = [INPUT_IDS.ADDRESS_LINE_1, INPUT_IDS.CITY, INPUT_IDS.COUNTRY, INPUT_IDS.STATE] as const;
                    addressRequiredFields.forEach((fieldKey) => {
                        const fieldValue = values[fieldKey] ?? '';
                        if (ValidationUtils.isRequiredFulfilled(fieldValue)) {
                            return;
                        }
                        errors[fieldKey] = translate('common.error.fieldRequired');
                    });

                    // If no country is selected, default value is an empty string and there's no related regex data so we default to an empty object
                    const countryRegexDetails = (values.country ? CONST.COUNTRY_ZIP_REGEX_DATA?.[values.country] : {}) as CountryZipRegex;

                    // The postal code system might not exist for a country, so no regex either for them.
                    const countrySpecificZipRegex = countryRegexDetails?.regex;
                    const countryZipFormat = countryRegexDetails?.samples ?? '';
                    if (countrySpecificZipRegex) {
                        if (!countrySpecificZipRegex.test(values[INPUT_IDS.ZIP_POST_CODE]?.trim().toUpperCase())) {
                            if (ValidationUtils.isRequiredFulfilled(values[INPUT_IDS.ZIP_POST_CODE]?.trim())) {
                                errors[INPUT_IDS.ZIP_POST_CODE] = translate('privatePersonalDetails.error.incorrectZipFormat', {zipFormat: countryZipFormat});
                            } else {
                                errors[INPUT_IDS.ZIP_POST_CODE] = translate('common.error.fieldRequired');
                            }
                        }
                    } else if (!CONST.GENERIC_ZIP_CODE_REGEX.test(values[INPUT_IDS.ZIP_POST_CODE]?.trim()?.toUpperCase() ?? '')) {
                        errors[INPUT_IDS.ZIP_POST_CODE] = translate('privatePersonalDetails.error.incorrectZipFormat');
                    }
                    return errors;
                case CONST.MISSING_PERSONAL_DETAILS_INDEXES.MAPPING.PHONE_NUMBER:
                    if (!ValidationUtils.isRequiredFulfilled(values[INPUT_IDS.PHONE_NUMBER])) {
                        errors[INPUT_IDS.PHONE_NUMBER] = translate('common.error.fieldRequired');
                    }
                    const phoneNumber = LoginUtils.appendCountryCode(values[INPUT_IDS.PHONE_NUMBER]);
                    const parsedPhoneNumber = PhoneNumberUtils.parsePhoneNumber(phoneNumber);
                    if (!parsedPhoneNumber.possible || !Str.isValidE164Phone(phoneNumber.slice(0))) {
                        errors[INPUT_IDS.PHONE_NUMBER] = translate('bankAccount.error.phoneNumber');
                    }
                    return errors;
                default:
                    return errors;
            }
        },
        [screenIndex, translate],
    );

    const updatePersonalDetails = useCallback(
        (formValues: FormOnyxValues<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>) => {
            PersonalDetails.updatePersonalDetailsAndShipExpensifyCard(formValues, firstUnissuedCard?.cardID ?? 0);
            nextScreen();
        },
        [nextScreen, firstUnissuedCard],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={MissingPersonalDetails.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.expensifyCard.addShippingDetails')}
                onBackButtonPress={handleBackButtonPress}
            />
            <View style={[styles.ph5, styles.mb3, styles.mt3, {height: CONST.NETSUITE_FORM_STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    ref={ref}
                    startStepIndex={CONST.MISSING_PERSONAL_DETAILS_INDEXES.MAPPING.LEGAL_NAME}
                    stepNames={CONST.MISSING_PERSONAL_DETAILS_INDEXES.INDEX_LIST}
                />
            </View>
            <View style={styles.ph5}>
                <SubStep
                    isEditing={isEditing}
                    onNext={nextScreen}
                    onMove={moveTo}
                    screenIndex={screenIndex}
                    privatePersonalDetails={privatePersonalDetails}
                />
            </View>
            {/*<FormProvider*/}
            {/*    formID={ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM}*/}
            {/*    submitButtonText={screenIndex === formSteps.length - 1 ? translate('common.confirm') : translate('common.next')}*/}
            {/*    onSubmit={screenIndex === formSteps.length - 1 ? updatePersonalDetails : handleNextScreen}*/}
            {/*    validate={validate}*/}
            {/*    style={[styles.flexGrow1, styles.mt3]}*/}
            {/*    submitButtonStyles={[styles.ph5, styles.mb0]}*/}
            {/*    enabledWhenOffline*/}
            {/*>*/}
            {/*    <View style={styles.ph5}>*/}
            {/*        <SubStep*/}
            {/*            isEditing={isEditing}*/}
            {/*            onNext={handleNextScreen}*/}
            {/*            onMove={moveTo}*/}
            {/*            screenIndex={screenIndex}*/}
            {/*            privatePersonalDetails={privatePersonalDetails}*/}
            {/*        />*/}
            {/*    </View>*/}
            {/*</FormProvider>*/}
        </ScreenWrapper>
    );
}

MissingPersonalDetails.displayName = 'MissingPersonalDetails';

export default MissingPersonalDetails;
