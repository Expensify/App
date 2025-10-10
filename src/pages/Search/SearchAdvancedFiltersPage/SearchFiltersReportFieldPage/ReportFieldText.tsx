import React from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import {isValidInputLength} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyReportField} from '@src/types/onyx';

type ReportFieldListProps = {
    field: PolicyReportField;
    close: () => void;
};

function ReportFieldText({field, close}: ReportFieldListProps) {
    const formKey = `${CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX}${field.name.toLowerCase().replaceAll(' ', '-')}` as const;
    const [value = ''] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true, selector: (form) => form?.[formKey]}, [formKey]);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM> = {};
        const fieldValue = values[formKey] ?? '';
        const trimmedValue = fieldValue.trim();
        const {isValid, byteLength} = isValidInputLength(trimmedValue, CONST.MAX_COMMENT_LENGTH);

        if (!isValid) {
            errors[formKey] = translate('common.error.characterLimitExceedCounter', {length: byteLength, limit: CONST.MAX_COMMENT_LENGTH});
        }

        return errors;
    };

    const updateFilter = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>) => {
        updateAdvancedFilters(values);
        close();
    };

    return (
        <FormProvider
            style={[styles.flex1, styles.ph5]}
            formID={ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM}
            validate={validate}
            onSubmit={updateFilter}
            submitButtonText={translate('common.save')}
            enabledWhenOffline
            shouldHideFixErrorsAlert
        >
            <View style={styles.mb5}>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={formKey}
                    name={formKey}
                    defaultValue={value}
                    label={field.name}
                    accessibilityLabel={field.name}
                    role={CONST.ROLE.PRESENTATION}
                    ref={inputCallbackRef}
                />
            </View>
        </FormProvider>
    );
}

ReportFieldText.displayName = 'ReportFieldText';

export default ReportFieldText;
