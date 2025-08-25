import {subYears} from 'date-fns';
import React, {useCallback} from 'react';
import DatePicker from '@components/DatePicker';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getEarliestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getAgeRequirementError, getFieldRequiredErrors} from '@libs/ValidationUtils';
import {clearDateOfBirthError, updateDateOfBirth} from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/DateOfBirthForm';

function DateOfBirthPage() {
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: true});
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const validateLoginError = getEarliestErrorField(privatePersonalDetails, 'dob');

    /**
     * @returns An object containing the errors for each inputID
     */
    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.DATE_OF_BIRTH_FORM>) => {
        const requiredFields = ['dob' as const];
        const errors = getFieldRequiredErrors(values, requiredFields);

        const minimumAge = CONST.DATE_BIRTH.MIN_AGE;
        const maximumAge = CONST.DATE_BIRTH.MAX_AGE;
        const dateError = getAgeRequirementError(values.dob ?? '', minimumAge, maximumAge);

        if (values.dob && dateError) {
            errors.dob = dateError;
        }

        return errors;
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID={DateOfBirthPage.displayName}
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton
                    title={translate('common.dob')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                {isLoadingApp ? (
                    <FullscreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
                ) : (
                    <FormProvider
                        style={[styles.flexGrow1, styles.ph5]}
                        formID={ONYXKEYS.FORMS.DATE_OF_BIRTH_FORM}
                        validate={validate}
                        onSubmit={(values: FormOnyxValues<typeof ONYXKEYS.FORMS.DATE_OF_BIRTH_FORM>) => {
                            // Clear the error when the user tries to submit the form
                            if (validateLoginError) {
                                clearDateOfBirthError();
                            }
                            updateDateOfBirth(values);
                        }}
                        submitButtonText={translate('common.save')}
                        enabledWhenOffline
                        shouldHideFixErrorsAlert
                    >
                        <OfflineWithFeedback
                            errors={validateLoginError}
                            errorRowStyles={styles.mt2}
                            onClose={() => clearDateOfBirthError()}
                        >
                            <InputWrapper
                                InputComponent={DatePicker}
                                inputID={INPUT_IDS.DOB}
                                label={translate('common.date')}
                                defaultValue={privatePersonalDetails?.dob ?? ''}
                                minDate={subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE)}
                                maxDate={subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE)}
                                autoFocus
                            />
                        </OfflineWithFeedback>
                    </FormProvider>
                )}
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

DateOfBirthPage.displayName = 'DateOfBirthPage';

export default DateOfBirthPage;
