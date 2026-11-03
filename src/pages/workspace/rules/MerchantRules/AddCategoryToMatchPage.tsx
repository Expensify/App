import ActivityIndicator from '@components/ActivityIndicator';
import BlockingView from '@components/BlockingViews/BlockingView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import RuleCategoriesDisabledEmptyState from '@components/Rule/RuleCategoriesDisabledEmptyState';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicyCategoryPickerCategories from '@hooks/usePolicyCategoryPickerCategories';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateDraftMerchantRule} from '@libs/actions/User';
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
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';

import useMerchantRuleRoute from './useMerchantRuleRoute';
import useRuleConditionSelection from './useRuleConditionSelection';

type AddCategoryToMatchPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.RULES_CATEGORY_TO_MATCH | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_CATEGORY_TO_MATCH
>;

type CategoryListItem = ListItem & {
    value: string;
};

function AddCategoryToMatchPage({route}: AddCategoryToMatchPageProps) {
    const {policyID, ruleID} = route.params;
    const {backToRoute} = useMerchantRuleRoute(DYNAMIC_ROUTES.RULES_CATEGORY_TO_MATCH_FROM_EXPENSE.path, policyID, ruleID);
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);

    const {
        selectedValues: selectedCategories,
        initialSelectedValues: initialSelectedCategories,
        toggleValue: toggleCategoryValue,
        toggleAll,
    } = useRuleConditionSelection(form?.categoriesToMatch ?? []);

    const {
        categories,
        areCategoriesEnabled,
        isLoading: arePolicyCategoriesLoading,
    } = usePolicyCategoryPickerCategories({
        policyID,
        // A rule only matches on the category, so every category is eligible.
        isEligible: () => true,
    });

    const categoryItems: CategoryListItem[] = categories.map((category) => ({
        keyForList: category.name,
        text: getDecodedCategoryName(category.name),
        value: category.name,
        isSelected: selectedCategories.includes(category.name),
    }));

    // A rule keeps matching on a category the workspace has since deleted. Listing it is the only way to see what the
    // rule matches on and the only way to take it off, so it is added back rather than left out of the picker.
    const listedCategoryNames = new Set(categories.map((category) => category.name));
    for (const categoryName of selectedCategories) {
        if (listedCategoryNames.has(categoryName)) {
            continue;
        }
        categoryItems.push({keyForList: categoryName, text: getDecodedCategoryName(categoryName), value: categoryName, isSelected: true});
    }

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

    const toggleCategory = (item: CategoryListItem) => toggleCategoryValue(item.value);
    const toggleSelectAll = () => toggleAll(filteredCategoryItems.map((item) => item.value));

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
                <HeaderWithBackButtonAndTitle
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
            <HeaderWithBackButtonAndTitle
                title={translate('common.category')}
                onBackButtonPress={goBackToRule}
            />
            {arePolicyCategoriesLoading ? (
                <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                    <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                </View>
            ) : (
                <SelectionList
                    canSelectMultiple
                    shouldUpdateFocusedIndex
                    ListItem={MultiSelectListItem}
                    data={filteredCategoryItems}
                    selectedItems={selectedCategories}
                    shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                    onSelectRow={toggleCategory}
                    onSelectionButtonPress={toggleCategory}
                    onSelectAll={filteredCategoryItems.length > 0 ? toggleSelectAll : undefined}
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
