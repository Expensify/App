import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchSingleSelectionPicker from '@components/Search/SearchSingleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateDraftRule} from '@libs/actions/User';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import {availableNonPersonalPolicyCategoriesSelector} from '@pages/Search/SearchAdvancedFiltersPage/SearchFiltersCategoryPage';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PolicyCategories} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

function AddCategoryPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [form] = useOnyx(ONYXKEYS.FORMS.EXPENSE_RULE_FORM, {canBeMissing: true});
    const [allPolicyCategories = getEmptyObject<NonNullable<OnyxCollection<PolicyCategories>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, {
        canBeMissing: true,
        selector: availableNonPersonalPolicyCategoriesSelector,
    });

    const selectedCategoryItem = form?.category ? {name: form.category, value: form.category} : undefined;

    const categoryItems = useMemo(() => {
        const items = [];
        const uniqueCategoryNames = new Set<string>();

        const categories = Object.values(allPolicyCategories ?? {}).flatMap((policyCategories) => Object.values(policyCategories ?? {}));
        for (const category of categories) {
            uniqueCategoryNames.add(category.name);
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
    }, [allPolicyCategories]);

    const onSave = (value?: string) => {
        updateDraftRule({category: value});
    };

    return (
        <ScreenWrapper
            testID="AddCategoryPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('expenseRulesPage.addRule.updateCategory')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SETTINGS_RULES_ADD.getRoute());
                }}
            />
            <View style={[styles.flex1]}>
                <SearchSingleSelectionPicker
                    backToRoute={ROUTES.SETTINGS_RULES_ADD.getRoute()}
                    initiallySelectedItem={selectedCategoryItem}
                    items={categoryItems}
                    onSaveSelection={onSave}
                    shouldShowResetButton={false}
                />
            </View>
        </ScreenWrapper>
    );
}

export default AddCategoryPage;
