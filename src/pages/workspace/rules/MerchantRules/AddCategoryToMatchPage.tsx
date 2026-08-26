import ActivityIndicator from '@components/ActivityIndicator';
import BlockingView from '@components/BlockingViews/BlockingView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RuleCategoriesDisabledEmptyState from '@components/Rule/RuleCategoriesDisabledEmptyState';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import useInitialSelection from '@hooks/useInitialSelection';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';

import {openPolicyCategoriesPage} from '@libs/actions/Policy/Category';
import {updateDraftMerchantRule} from '@libs/actions/User';
import {categoryHasTaxRule} from '@libs/CategoryTaxRulesUtils';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {useFocusEffect} from '@react-navigation/native';
import React, {useState} from 'react';
import {View} from 'react-native';

type AddCategoryToMatchPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_CATEGORY_TO_MATCH>;

type CategoryListItem = ListItem & {
    value: string;
};

function AddCategoryToMatchPage({route}: AddCategoryToMatchPageProps) {
    const {policyID} = route.params;
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policy = usePolicy(policyID);

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const areCategoriesEnabled = !!policy?.areCategoriesEnabled;

    const draftCategories = form?.categoriesToMatch ?? [];
    const [selectedCategories, setSelectedCategories] = useState<string[]>(draftCategories);
    const initialSelectedCategories = useInitialSelection(draftCategories, {resetOnFocus: true});

    const fetchPolicyCategories = () => {
        if (!areCategoriesEnabled || policyCategories !== undefined) {
            return;
        }
        openPolicyCategoriesPage(policyID);
    };

    const {isOffline} = useNetwork({onReconnect: fetchPolicyCategories});

    useFocusEffect(() => {
        fetchPolicyCategories();
    });

    // Only spin while a fetch can actually resolve. Offline there is nothing to wait for, so fall through to the
    // list instead of a spinner that never goes away.
    const arePolicyCategoriesLoading = areCategoriesEnabled && policyCategories === undefined && !isOffline;

    const categoryItems: CategoryListItem[] = Object.values(policyCategories ?? {})
        .filter((category) => {
            if (!category.enabled) {
                return false;
            }

            // Match the rules table: keep pending-delete categories visible while offline.
            if (!isOffline && category.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                return false;
            }

            // Keep the current selections available so they stay visible and removable, but don't offer a category that
            // already has a tax default — saving over it would silently replace the existing rule.
            if (selectedCategories.includes(category.name)) {
                return true;
            }

            return !categoryHasTaxRule(policy?.rules?.expenseRules, category.name);
        })
        .map((category) => ({
            keyForList: category.name,
            text: getDecodedCategoryName(category.name),
            value: category.name,
            isSelected: selectedCategories.includes(category.name),
        }));

    const filterCategory = (item: CategoryListItem, searchInput: string) => (item.text ?? '').toLowerCase().includes(searchInput.toLowerCase());

    // Pin the initially selected categories to the top of the FULL sorted list, then let the search filter run over the
    // already-pinned list so pinned rows stay at the top even while searching.
    const sortedCategoryItems = moveInitialSelectionToTop(
        [...categoryItems].sort((a, b) => localeCompare(a.text ?? '', b.text ?? '')),
        initialSelectedCategories,
    );

    const [inputValue, setInputValue, filteredCategoryItems] = useSearchResults(sortedCategoryItems, filterCategory);

    const toggleCategory = (item: CategoryListItem) => {
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

    // The condition can only be chosen while creating a rule, so the way back is always the create page. Passing it
    // explicitly, as every sibling picker does, keeps a deep link into this page from having nothing to pop to.
    const backToRoute = ROUTES.RULES_MERCHANT_NEW.getRoute(policyID);
    const goBackToRule = () => Navigation.goBack(backToRoute);
    const goBackAfterSave = () => Navigation.goBack(backToRoute, {shouldSkipFocusRestore: true});

    // The defaults a category rule can't carry were already cleared before this page opened, so saving is just the
    // selection. Clearing every category leaves an ordinary merchant rule behind.
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
