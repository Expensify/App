import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/Search/SearchMultipleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalPolicy} from '@libs/PolicyUtils';
import {updateAdvancedFilters} from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PolicyCategories, PolicyCategory} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

const availableNonPersonalPolicyCategoriesSelector = (policyCategories: OnyxCollection<PolicyCategories>) =>
    Object.fromEntries(
        Object.entries(policyCategories ?? {}).filter(([key, categories]) => {
            if (key === `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getPersonalPolicy()?.id}`) {
                return false;
            }
            const availableCategories = Object.values(categories ?? {}).filter((category) => category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
            return availableCategories.length > 0;
        }),
    );

function SearchFiltersCategoryPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    const selectedCategoriesItems = searchAdvancedFiltersForm?.category?.map((category) => {
        if (category === CONST.SEARCH.CATEGORY_EMPTY_VALUE) {
            return {name: translate('search.noCategory'), value: category};
        }
        return {name: category, value: category};
    });
    const policyIDs = searchAdvancedFiltersForm?.policyID ?? [];
    const [allPolicyCategories = getEmptyObject<NonNullable<OnyxCollection<PolicyCategories>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, {
        canBeMissing: false,
        selector: availableNonPersonalPolicyCategoriesSelector,
    });

    const selectedPoliciesCategories: PolicyCategory[] = Object.keys(allPolicyCategories ?? {})
        .filter((key) => policyIDs?.map((policyID) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`)?.includes(key))
        ?.map((key) => Object.values(allPolicyCategories?.[key] ?? {}))
        .flat();

    const categoryItems = useMemo(() => {
        const items = [{name: translate('search.noCategory'), value: CONST.SEARCH.CATEGORY_EMPTY_VALUE as string}];
        const uniqueCategoryNames = new Set<string>();

        if (!selectedPoliciesCategories || selectedPoliciesCategories.length === 0) {
            const categories = Object.values(allPolicyCategories ?? {}).flatMap((policyCategories) => Object.values(policyCategories ?? {}));
            for (const category of categories) {
                uniqueCategoryNames.add(category.name);
            }
        } else {
            for (const category of selectedPoliciesCategories) {
                uniqueCategoryNames.add(category.name);
            }
        }
        items.push(
            ...Array.from(uniqueCategoryNames)
                .filter(Boolean)
                .map((categoryName) => {
                    const decodedCategoryName = getDecodedCategoryName(categoryName);
                    return {name: decodedCategoryName, value: categoryName};
                }),
        );
        return items;
    }, [allPolicyCategories, selectedPoliciesCategories, translate]);

    const onSaveSelection = useCallback((values: string[]) => updateAdvancedFilters({category: values}), []);

    return (
        <ScreenWrapper
            testID="SearchFiltersCategoryPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.category')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
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

export default SearchFiltersCategoryPage;
