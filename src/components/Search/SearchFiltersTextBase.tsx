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
import type {SearchTextFilterKeys} from './types';

// Text-based filter keys that accept string input - these are keys from SearchTextFilterKeys that have string values
type SearchFiltersTextBaseProps = {
    /** The filter key from text-based FILTER_KEYS */
    filterKey: SearchTextFilterKeys;

    /** The translation key for the page title and input label */
    titleKey: TranslationPaths;

    /** Test ID for the screen wrapper */
    testID: string;

    /** The character limit for the input */
    characterLimit?: number;
};

function SearchFiltersTextBase({filterKey, titleKey, testID, characterLimit = CONST.MERCHANT_NAME_MAX_BYTES}: SearchFiltersTextBaseProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: false});
    const currentValue = searchAdvancedFiltersForm?.[filterKey] ?? '';
    const {inputCallbackRef} = useAutoFocusInput();

    const updateFilter = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>) => {
        updateAdvancedFilters(values);
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM> = {};
        const fieldValue = values[filterKey] ?? '';
        const trimmedValue = fieldValue.trim();
        const {isValid, byteLength} = isValidInputLength(trimmedValue, characterLimit);

        if (!isValid) {
            errors[filterKey] = translate('common.error.characterLimitExceedCounter', {length: byteLength, limit: characterLimit});
        }

        return errors;
    };

    return (
        <ScreenWrapper
            testID={testID}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate(titleKey)}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
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
                        defaultValue={currentValue}
                        label={translate(titleKey)}
                        accessibilityLabel={translate(titleKey)}
                        role={CONST.ROLE.PRESENTATION}
                        ref={inputCallbackRef}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

SearchFiltersTextBase.displayName = 'SearchFiltersTextBase';

export default SearchFiltersTextBase;
