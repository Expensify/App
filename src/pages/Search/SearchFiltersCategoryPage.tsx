import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/SearchMultipleSelectionPicker';
import type {SearchMultipleSelectionPickerItem} from '@components/SearchMultipleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as SearchActions from '@userActions/Search';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SearchFiltersCategoryPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const selectedCategories = searchAdvancedFiltersForm?.category?.map((category) => ({name: category, value: category}));
    const policyID = searchAdvancedFiltersForm?.policyID ?? '-1';
    const [allPolicyIDCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const singlePolicyCategories = allPolicyIDCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`];

    const categoryItems = useMemo(() => {
        const categories: SearchMultipleSelectionPickerItem[] = [];
        if (!singlePolicyCategories) {
            const categoriesList = Object.values(allPolicyIDCategories ?? {})
                .map((policyCategories) => Object.values(policyCategories ?? {}))
                .flat();
            categoriesList.forEach((category) => {
                if (categories.some((item) => item.name === category.name)) {
                    return;
                }
                categories.push({name: category.name, value: category.name});
            });
        } else {
            Object.values(singlePolicyCategories ?? {}).forEach((category) => categories.push({name: category.name, value: category.name}));
        }

        return categories;
    }, [allPolicyIDCategories, singlePolicyCategories]);

    const onSaveSelection = useCallback((values: string[]) => SearchActions.updateAdvancedFilters({category: values}), []);

    return (
        <ScreenWrapper
            testID={SearchFiltersCategoryPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom={false}
        >
            <FullPageNotFoundView shouldShow={false}>
                <HeaderWithBackButton
                    title={translate('common.category')}
                    onBackButtonPress={() => {
                        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                    }}
                />
                <View style={[styles.flex1, styles.pb5]}>
                    <SearchMultipleSelectionPicker
                        pickerTitle={translate('common.category')}
                        items={categoryItems}
                        initiallySelectedItems={selectedCategories}
                        onSaveSelection={onSaveSelection}
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchFiltersCategoryPage.displayName = 'SearchFiltersCategoryPage';

export default SearchFiltersCategoryPage;
