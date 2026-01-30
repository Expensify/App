import React from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import type {SearchTextFilterKeys} from '@components/Search/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {isValidInputLength} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type SearchFiltersTextBaseProps = {
    filterKey: SearchTextFilterKeys;
    title: string;
    characterLimit?: number;
    onSubmit: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>) => void;
    description?: string;
};

function TextFilterBase({filterKey, title, onSubmit, characterLimit = CONST.MERCHANT_NAME_MAX_BYTES, description}: SearchFiltersTextBaseProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: false});
    const currentValue = searchAdvancedFiltersForm?.[filterKey] ?? '';
    const {inputCallbackRef} = useAutoFocusInput();

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM> = {};
        const fieldValue = values[filterKey] ?? '';
        const trimmedValue = fieldValue.trim();
        const {isValid, byteLength} = isValidInputLength(trimmedValue, characterLimit);

        if (!isValid) {
            errors[filterKey] = translate('common.error.characterLimitExceedCounter', byteLength, characterLimit);
        }

        return errors;
    };

    return (
        <FormProvider
            style={[styles.flex1, styles.ph5]}
            formID={ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM}
            validate={validate}
            onSubmit={onSubmit}
            submitButtonText={translate('common.save')}
            enabledWhenOffline
            shouldHideFixErrorsAlert
        >
            {!!description && <Text style={styles.mb6}>{description}</Text>}
            <View style={styles.mb5}>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={filterKey}
                    name={filterKey}
                    defaultValue={currentValue}
                    label={title}
                    accessibilityLabel={title}
                    role={CONST.ROLE.PRESENTATION}
                    ref={inputCallbackRef}
                />
            </View>
        </FormProvider>
    );
}

export default TextFilterBase;
