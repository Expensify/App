import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateDraftSpendRule} from '@libs/actions/User';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {SPEND_RULE_CATEGORIES} from '@src/types/form/SpendRuleForm';
import type {SpendRuleCategory} from '@src/types/form/SpendRuleForm';
import {getParentRoute} from './SpendRulesUtils';

type CategoryListItem = ListItem & {
    value: SpendRuleCategory;
};

type SpendRuleCategoryPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_SPEND_CATEGORY>;

function SpendRuleCategoryPage({route}: SpendRuleCategoryPageProps) {
    const {policyID, ruleID} = route.params;
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const parentRoute = getParentRoute(policyID, ruleID);

    const [spendRuleForm] = useOnyx(ONYXKEYS.FORMS.SPEND_RULE_FORM);

    const [selectedCategories, setSelectedCategories] = useState<SpendRuleCategory[]>([]);

    useFocusEffect(
        useCallback(() => {
            setSelectedCategories(spendRuleForm?.categories ?? []);
        }, [spendRuleForm?.categories]),
    );

    const categoryItems: CategoryListItem[] = SPEND_RULE_CATEGORIES.map((category) => ({
        keyForList: category,
        text: translate(`workspace.rules.spendRules.categoryOptions.${category}`),
        value: category,
    }));

    const filterCategory = (item: CategoryListItem, searchInput: string) => (item.text ?? '').toLowerCase().includes(searchInput.toLowerCase());
    const sortCategories = (items: CategoryListItem[]) => items.sort((a, b) => localeCompare(a.text ?? '', b.text ?? ''));

    const [inputValue, setInputValue, filteredCategoryItems] = useSearchResults(categoryItems, filterCategory, sortCategories);

    const listData: CategoryListItem[] = filteredCategoryItems.map((item) => ({
        ...item,
        isSelected: selectedCategories.includes(item.value),
    }));

    const toggleCategory = (item: CategoryListItem) => {
        setSelectedCategories((prev) => {
            if (prev.includes(item.value)) {
                return prev.filter((categoryName) => categoryName !== item.value);
            }
            return [...prev, item.value];
        });
    };

    const toggleSelectAll = () => {
        const visibleValues = listData.map((item) => item.value);
        const allVisibleSelected = visibleValues.length > 0 && visibleValues.every((value) => selectedCategories.includes(value));
        if (allVisibleSelected) {
            const visibleSet = new Set(visibleValues);
            setSelectedCategories((prev) => prev.filter((value) => !visibleSet.has(value)));
            return;
        }
        setSelectedCategories((prev) => {
            const next = new Set(prev);
            for (const value of visibleValues) {
                next.add(value);
            }
            return Array.from(next);
        });
    };

    const handleSave = () => {
        updateDraftSpendRule({categories: selectedCategories});
        Navigation.goBack(parentRoute);
    };

    return (
        <ScreenWrapper
            testID="SpendRuleCategoryPage"
            shouldEnableMaxHeight
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton
                title={translate('workspace.rules.spendRules.spendCategory')}
                onBackButtonPress={() => Navigation.goBack(parentRoute)}
            />
            <SelectionList
                canSelectMultiple
                textInputOptions={{
                    value: inputValue,
                    label: translate('common.search'),
                    onChangeText: setInputValue,
                }}
                data={listData}
                style={{
                    listHeaderWrapperStyle: [styles.pt5, styles.pb2],
                    listHeaderSelectAllTextStyle: [styles.textLabelSupporting],
                }}
                onSelectAll={listData.length > 0 ? toggleSelectAll : undefined}
                onCheckboxPress={toggleCategory}
                onSelectRow={toggleCategory}
                selectedItems={selectedCategories}
                ListItem={MultiSelectListItem}
                shouldUpdateFocusedIndex
                shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
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
        </ScreenWrapper>
    );
}

SpendRuleCategoryPage.displayName = 'SpendRuleCategoryPage';

export default SpendRuleCategoryPage;
