import {subYears} from 'date-fns';
import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import DatePicker from '@components/DatePicker';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/DateOfBirthForm';

function DateOfBirthPage() {
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {initialValue: true});
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    /**
     * @returns An object containing the errors for each inputID
     */
    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.DATE_OF_BIRTH_FORM>) => {
        const requiredFields = ['dob' as const];
        const errors = ValidationUtils.getFieldRequiredErrors(values, requiredFields);

        const minimumAge = CONST.DATE_BIRTH.MIN_AGE;
        const maximumAge = CONST.DATE_BIRTH.MAX_AGE;
        const dateError = ValidationUtils.getAgeRequirementError(values.dob ?? '', minimumAge, maximumAge);

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
                        onSubmit={PersonalDetails.updateDateOfBirth}
                        submitButtonText={translate('common.save')}
                        enabledWhenOffline
                    >
                        <InputWrapper
                            InputComponent={DatePicker}
                            inputID={INPUT_IDS.DOB}
                            label={translate('common.date')}
                            defaultValue={privatePersonalDetails?.dob ?? ''}
                            minDate={subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE)}
                            maxDate={subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE)}
                        />
                    </FormProvider>
                )}
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

DateOfBirthPage.displayName = 'DateOfBirthPage';

export default DateOfBirthPage;
