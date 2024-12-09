import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';

function SearchFiltersKeywordPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const keyword = searchAdvancedFiltersForm?.[FILTER_KEYS.KEYWORD];
    const {inputCallbackRef} = useAutoFocusInput();

    const updateKeywordFilter = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>) => {
        updateAdvancedFilters(values);
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    };

    return (
        <ScreenWrapper
            testID={SearchFiltersKeywordPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            <FullPageNotFoundView shouldShow={false}>
                <HeaderWithBackButton
                    title={translate('search.filters.keyword')}
                    onBackButtonPress={() => {
                        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                    }}
                />
                <FormProvider
                    style={[styles.flex1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM}
                    onSubmit={updateKeywordFilter}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={FILTER_KEYS.KEYWORD}
                            name={FILTER_KEYS.KEYWORD}
                            defaultValue={keyword}
                            label={translate('search.filters.keyword')}
                            accessibilityLabel={translate('search.filters.keyword')}
                            role={CONST.ROLE.PRESENTATION}
                            ref={inputCallbackRef}
                        />
                    </View>
                </FormProvider>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchFiltersKeywordPage.displayName = 'SearchFiltersKeywordPage';

export default SearchFiltersKeywordPage;
