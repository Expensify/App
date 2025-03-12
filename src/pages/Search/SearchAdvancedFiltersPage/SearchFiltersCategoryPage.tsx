import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/Search/SearchMultipleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as SearchActions from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SearchFiltersCategoryPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const selectedCategoriesItems = searchAdvancedFiltersForm?.category?.map((category) => {
        if (category === CONST.SEARCH.EMPTY_VALUE) {
            return {name: translate('search.noCategory'), value: category};
        }
        return {name: category, value: category};
    });
    const policyID = searchAdvancedFiltersForm?.policyID ?? '-1';
    const [allPolicyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const singlePolicyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`];

    const categoryItems = useMemo(() => {
        const items = [{name: translate('search.noCategory'), value: CONST.SEARCH.EMPTY_VALUE as string}];
        if (!singlePolicyCategories) {
            const uniqueCategoryNames = new Set<string>();
            Object.values(allPolicyCategories ?? {}).map((policyCategories) => Object.values(policyCategories ?? {}).forEach((category) => uniqueCategoryNames.add(category.name)));
            items.push(...Array.from(uniqueCategoryNames).map((categoryName) => ({name: categoryName, value: categoryName})));
        } else {
            items.push(...Object.values(singlePolicyCategories ?? {}).map((category) => ({name: category.name, value: category.name})));
        }
        return items;
    }, [allPolicyCategories, singlePolicyCategories, translate]);

    const onSaveSelection = useCallback((values: string[]) => SearchActions.updateAdvancedFilters({category: values}), []);

    return (
        <ScreenWrapper
            testID={SearchFiltersCategoryPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.category')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />
            <View style={[styles.flex1]}>
                <SearchMultipleSelectionPicker
                    items={categoryItems}
                    initiallySelectedItems={selectedCategoriesItems}
                    onSaveSelection={onSaveSelection}
                />
            </View>
        </ScreenWrapper>
    );
}

SearchFiltersCategoryPage.displayName = 'SearchFiltersCategoryPage';

export default SearchFiltersCategoryPage;
