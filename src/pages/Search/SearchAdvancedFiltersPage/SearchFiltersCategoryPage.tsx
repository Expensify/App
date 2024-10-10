import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/Search/SearchMultipleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useSafePaddingBottomStyle from '@hooks/useSafePaddingBottomStyle';
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
    const selectedCategoriesItems = searchAdvancedFiltersForm?.category?.map((category) => ({name: category, value: category}));
    const policyID = searchAdvancedFiltersForm?.policyID ?? '-1';
    const [allPolicyIDCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const singlePolicyCategories = allPolicyIDCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`];

    const categoryItems = useMemo(() => {
        const items = [{name: translate('search.filters.noCategory'), value: CONST.SEARCH.FILTER_NO.CATEGORY as string}];
        if (!singlePolicyCategories) {
            const uniqueCategoryNames = new Set<string>();
            Object.values(allPolicyIDCategories ?? {}).map((policyCategories) => Object.values(policyCategories ?? {}).forEach((category) => uniqueCategoryNames.add(category.name)));
            items.push(...Array.from(uniqueCategoryNames).map((categoryName) => ({name: categoryName, value: categoryName})));
        } else {
            items.push(...Object.values(singlePolicyCategories ?? {}).map((category) => ({name: category.name, value: category.name})));
        }
        return items;
    }, [allPolicyIDCategories, singlePolicyCategories, translate]);

    const onSaveSelection = useCallback((values: string[]) => {
        if (values.at(0) === CONST.SEARCH.FILTER_NO.CATEGORY) {
            SearchActions.updateAdvancedFilters({no: [CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY]});
            return;
        }
        SearchActions.updateAdvancedFilters({category: values});
    }, []);
    const safePaddingBottomStyle = useSafePaddingBottomStyle();

    return (
        <ScreenWrapper
            testID={SearchFiltersCategoryPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.category')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />
            <View style={[styles.flex1, safePaddingBottomStyle]}>
                <SearchMultipleSelectionPicker
                    pickerTitle={translate('common.category')}
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
