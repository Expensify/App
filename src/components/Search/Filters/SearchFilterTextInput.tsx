import React from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {isValidInputLength} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchFilterKey} from '@components/Search/types';

type SearchFilterTextInputProps = {
    /** The filter key */
    filterKey: SearchFilterKey;
    
    /** Title translation key */
    titleKey: TranslationPaths;
    
    /** Label translation key */
    labelKey?: TranslationPaths;
    
    /** Maximum byte length for validation */
    maxLength?: number;
    
    /** Custom validation function */
    validate?: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>) => FormInputErrors<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>;
};

function SearchFilterTextInput({
    filterKey,
    titleKey,
    labelKey,
    maxLength = CONST.MERCHANT_NAME_MAX_BYTES,
    validate: customValidate,
}: SearchFilterTextInputProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    const filterValue = searchAdvancedFiltersForm?.[filterKey as keyof typeof searchAdvancedFiltersForm] as string | undefined;
    const {inputCallbackRef} = useAutoFocusInput();

    const updateFilter = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>) => {
        updateAdvancedFilters(values);
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    };

    const validate = customValidate ?? ((values: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM> = {};
        const inputValue = values[filterKey as keyof typeof values] as string | undefined;
        
        if (typeof inputValue === 'string') {
            const trimmedValue = inputValue.trim();
            const {isValid, byteLength} = isValidInputLength(trimmedValue, maxLength);

            if (!isValid) {
                (errors as any)[filterKey] = translate('common.error.characterLimitExceedCounter', {length: byteLength, limit: maxLength});
            }
        }

        return errors;
    });

    const title = translate(titleKey);
    const label = labelKey ? translate(labelKey) : title;

    return (
        <ScreenWrapper
            testID={SearchFilterTextInput.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={title}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />
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
                        inputID={filterKey}
                        name={filterKey}
                        defaultValue={filterValue}
                        label={label}
                        accessibilityLabel={label}
                        role={CONST.ROLE.PRESENTATION}
                        ref={inputCallbackRef}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

SearchFilterTextInput.displayName = 'SearchFilterTextInput';

export default SearchFilterTextInput;