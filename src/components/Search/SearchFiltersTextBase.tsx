import React from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
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
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type SearchFiltersTextBaseProps = {
    /** The filter key from FILTER_KEYS */
    filterKey: string;

    /** The translation key for the page title and input label */
    titleKey: TranslationPaths;

    /** Test ID for the screen wrapper */
    testID: string;

    /** Optional validation function */
    validate?: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>) => FormInputErrors<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>;

    /** Whether to hide fix errors alert */
    shouldHideFixErrorsAlert?: boolean;

    /** Whether to wrap content with FullPageNotFoundView */
    shouldShowFullPageNotFoundView?: boolean;
};

function SearchFiltersTextBase({
    filterKey,
    titleKey,
    testID,
    validate,
    shouldHideFixErrorsAlert = true,
    shouldShowFullPageNotFoundView = false,
}: SearchFiltersTextBaseProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: false});
    const value = searchAdvancedFiltersForm?.[filterKey as keyof typeof searchAdvancedFiltersForm];
    const {inputCallbackRef} = useAutoFocusInput();

    const updateFilter = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>) => {
        updateAdvancedFilters(values);
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    };

    return (
        <ScreenWrapper
            testID={testID}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <FullPageNotFoundView shouldShow={shouldShowFullPageNotFoundView}>
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
                    shouldHideFixErrorsAlert={shouldHideFixErrorsAlert}
                >
                    <View style={styles.mb5}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={filterKey}
                            name={filterKey}
                            defaultValue={value as string}
                            label={translate(titleKey)}
                            accessibilityLabel={translate(titleKey)}
                            role={CONST.ROLE.PRESENTATION}
                            ref={inputCallbackRef}
                        />
                    </View>
                </FormProvider>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchFiltersTextBase.displayName = 'SearchFiltersTextBase';

export default SearchFiltersTextBase;
