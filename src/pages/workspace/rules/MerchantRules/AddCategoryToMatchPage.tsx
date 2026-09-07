import ActivityIndicator from '@components/ActivityIndicator';
import BlockingView from '@components/BlockingViews/BlockingView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RuleCategoriesDisabledEmptyState from '@components/Rule/RuleCategoriesDisabledEmptyState';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import useInitialSelection from '@hooks/useInitialSelection';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyCategoryPickerCategories from '@hooks/usePolicyCategoryPickerCategories';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateDraftMerchantRule} from '@libs/actions/User';
import {categoryHasTaxRule} from '@libs/CategoryTaxRulesUtils';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useState} from 'react';
import {View} from 'react-native';

type AddCategoryToMatchPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_CATEGORY_TO_MATCH>;

type CategoryListItem = ListItem & {
    value: string;
};

function AddCategoryToMatchPage({route}: AddCategoryToMatchPageProps) {
    const {policyID, categoryName: editingCategoryName} = route.params;
    // Editing a category tax default edits one rule, so its category is swapped, not added to.
    const isEditingCategoryTaxRule = !!editingCategoryName;
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policy = usePolicy(policyID);

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);

    const draftCategories = form?.categoriesToMatch ?? [];
    const [selectedCategories, setSelectedCategories] = useState<string[]>(draftCategories);
    const initialSelectedCategories = useInitialSelection(draftCategories, {resetOnFocus: true});

    const {
        categories,
        areCategoriesEnabled,
        isLoading: arePolicyCategoriesLoading,
    } = usePolicyCategoryPickerCategories({
        policyID,
        // Keep current selections so they stay removable; don't offer a category that already has a tax default.
        // The rule being edited stays listed even once the selection moves off it, since its own category still has a
        // tax rule and would otherwise drop out of the list with no way to switch back.
        isEligible: (category) => selectedCategories.includes(category.name) || category.name === editingCategoryName || !categoryHasTaxRule(policy?.rules?.expenseRules, category.name),
    });

    const categoryItems: CategoryListItem[] = categories.map((category) => ({
        keyForList: category.name,
        text: getDecodedCategoryName(category.name),
        value: category.name,
        isSelected: selectedCategories.includes(category.name),
    }));

    // Tokenized like the main category picker, so the words can be typed in any order and a nested name is still found
    // by any part of it.
    const filterCategory = (item: CategoryListItem, searchInput: string) => tokenizedSearch([item], searchInput, (category) => [category.text ?? '']).length > 0;

    // Pin the initially selected categories to the top of the FULL sorted list, then let the search filter run over the
    // already-pinned list so pinned rows stay at the top even while searching.
    const sortedCategoryItems = moveInitialSelectionToTop(
        [...categoryItems].sort((a, b) => localeCompare(a.text ?? '', b.text ?? '')),
        initialSelectedCategories,
    );

    const [inputValue, setInputValue, filteredCategoryItems] = useSearchResults(sortedCategoryItems, filterCategory);

    const toggleCategory = (item: CategoryListItem) => {
        // One rule holds one category. Saving several would write a rule each and orphan the edited one.
        if (isEditingCategoryTaxRule) {
            setSelectedCategories([item.value]);
            return;
        }
        setSelectedCategories((prev) => (prev.includes(item.value) ? prev.filter((categoryName) => categoryName !== item.value) : [...prev, item.value]));
    };

    const toggleSelectAll = () => {
        const visibleValues = filteredCategoryItems.map((item) => item.value);
        const allVisibleSelected = visibleValues.length > 0 && visibleValues.every((value) => selectedCategories.includes(value));

        if (allVisibleSelected) {
            const visibleSet = new Set(visibleValues);
            setSelectedCategories((prev) => prev.filter((value) => !visibleSet.has(value)));
            return;
        }

        setSelectedCategories((prev) => Array.from(new Set([...prev, ...visibleValues])));
    };

    // Passed explicitly like every sibling picker, so a deep link has somewhere to pop to. A category tax default is
    // addressed by category rather than ruleID.
    const backToRoute = editingCategoryName ? ROUTES.RULES_CATEGORY_TAX_EDIT.getRoute(policyID, editingCategoryName) : ROUTES.RULES_MERCHANT_NEW.getRoute(policyID);
    const goBackToRule = () => Navigation.goBack(backToRoute);
    const goBackAfterSave = () => Navigation.goBack(backToRoute, {shouldSkipFocusRestore: true});

    // Incompatible defaults were cleared before this page opened, so saving is just the selection. Clearing every
    // category leaves an ordinary merchant rule.
    const handleSave = () => {
        updateDraftMerchantRule({categoriesToMatch: selectedCategories});
        goBackAfterSave();
    };

    if (!areCategoriesEnabled) {
        return (
            <ScreenWrapper
                testID="AddCategoryToMatchPage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('common.category')}
                    onBackButtonPress={goBackToRule}
                />
                <RuleCategoriesDisabledEmptyState policyID={policyID} />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            testID="AddCategoryToMatchPage"
            shouldEnableMaxHeight
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton
                title={translate('common.category')}
                onBackButtonPress={goBackToRule}
            />
            {arePolicyCategoriesLoading ? (
                <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                    <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                </View>
            ) : (
                <SelectionList
                    canSelectMultiple={!isEditingCategoryTaxRule}
                    shouldUpdateFocusedIndex
                    // One rule holds one category, so editing swaps the selection. Radios say that; checkboxes imply
                    // several can be ticked.
                    ListItem={isEditingCategoryTaxRule ? SingleSelectListItem : MultiSelectListItem}
                    data={filteredCategoryItems}
                    selectedItems={selectedCategories}
                    shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                    onSelectRow={toggleCategory}
                    onSelectionButtonPress={toggleCategory}
                    onSelectAll={!isEditingCategoryTaxRule && filteredCategoryItems.length > 0 ? toggleSelectAll : undefined}
                    textInputOptions={{
                        value: inputValue,
                        label: translate('common.search'),
                        onChangeText: setInputValue,
                    }}
                    style={{
                        listHeaderWrapperStyle: [styles.pt5, styles.pb2],
                        listHeaderSelectAllTextStyle: [styles.textLabelSupporting],
                    }}
                    listEmptyContent={
                        <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                            <BlockingView
                                icon={illustrations.Telescope}
                                iconWidth={variables.emptyListIconWidth}
                                iconHeight={variables.emptyListIconHeight}
                                title={translate('common.noResultsFound')}
                            />
                        </ScrollView>
                    }
                    footerContent={
                        <FormAlertWithSubmitButton
                            buttonText={translate('common.save')}
                            isAlertVisible={false}
                            onSubmit={handleSave}
                            enabledWhenOffline
                            containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                        />
                    }
                />
            )}
        </ScreenWrapper>
    );
}

export default AddCategoryToMatchPage;
