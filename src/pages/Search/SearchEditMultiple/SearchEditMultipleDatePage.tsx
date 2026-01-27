import React from 'react';
import {View} from 'react-native';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateBulkEditDraftTransaction} from '@libs/actions/IOU';
import Navigation from '@libs/Navigation/Navigation';
import {isValidDate} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/SearchEditMultipleDateForm';

function SearchEditMultipleDatePage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`, {canBeMissing: true});

    const currentDate = draftTransaction?.created ?? '';

    const validate = (value: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_EDIT_MULTIPLE_DATE_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.SEARCH_EDIT_MULTIPLE_DATE_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.SEARCH_EDIT_MULTIPLE_DATE_FORM> = {};
        const dateValue = value.date;
        if (dateValue && !isValidDate(dateValue)) {
            errors.date = translate('common.error.dateInvalid');
        }
        return errors;
    };

    const saveDate = (value: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_EDIT_MULTIPLE_DATE_FORM>) => {
        const newDate = value.date;
        updateBulkEditDraftTransaction({
            created: newDate,
        });
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={SearchEditMultipleDatePage.displayName}
        >
            <HeaderWithBackButton
                title={translate('common.date')}
                onBackButtonPress={Navigation.goBack}
            />
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.SEARCH_EDIT_MULTIPLE_DATE_FORM}
                onSubmit={saveDate}
                validate={validate}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <View style={styles.mb4}>
                    <InputWrapper
                        InputComponent={DatePicker}
                        inputID={INPUT_IDS.DATE}
                        label={translate('common.date')}
                        defaultValue={currentDate}
                        maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                        minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

SearchEditMultipleDatePage.displayName = 'SearchEditMultipleDatePage';

export default SearchEditMultipleDatePage;
