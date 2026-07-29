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
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import type {SpendRuleCategory} from '@src/types/form/SpendRuleForm';
import {SPEND_RULE_CATEGORIES} from '@src/types/form/SpendRuleForm';

import React, {useState} from 'react';

type CategoryListItem = ListItem & {
    value: SpendRuleCategory;
};

type SpendRuleCategoryBaseProps = {
    categories: SpendRuleCategory[];
    onCategoriesChange: (categories: SpendRuleCategory[]) => void;
};

export default function SpendRuleCategoryBase({categories, onCategoriesChange}: SpendRuleCategoryBaseProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const [selectedCategories, setSelectedCategories] = useState<SpendRuleCategory[]>(categories);

    const categoryItems: CategoryListItem[] = SPEND_RULE_CATEGORIES.map((category) => ({
        keyForList: category,
        text: translate(`workspace.rules.spendRules.categoryOptions.${category}`),
        value: category,
        isSelected: selectedCategories.includes(category),
    }));

    const filterCategory = (item: CategoryListItem, searchInput: string) => {
        return (item.text ?? '').toLowerCase().includes(searchInput.toLowerCase());
    };

    const sortCategories = (items: CategoryListItem[]) => {
        return items.sort((a, b) => localeCompare(a.text ?? '', b.text ?? ''));
    };

    const [inputValue, setInputValue, filteredCategoryItems] = useSearchResults(categoryItems, filterCategory, sortCategories);

    const toggleCategory = (item: CategoryListItem) => {
        setSelectedCategories((prev) => {
            if (prev.includes(item.value)) {
                return prev.filter((categoryName) => categoryName !== item.value);
            }
            return [...prev, item.value];
        });
    };

    const toggleSelectAll = () => {
        const visibleValues = filteredCategoryItems.map((item) => item.value);
        const allVisibleSelected = visibleValues.length > 0 && visibleValues.every((value) => selectedCategories.includes(value));

        if (allVisibleSelected) {
            const visibleSet = new Set(visibleValues);
            setSelectedCategories((prev) => prev.filter((value) => !visibleSet.has(value)));
            return;
        }

        setSelectedCategories((prev) => {
            const next = new Set([...prev, ...visibleValues]);
            return Array.from(next);
        });
    };

    const goBack = () => {
        Navigation.goBack();
    };

    const handleSave = () => {
        onCategoriesChange(selectedCategories);
        Navigation.goBack(undefined, {shouldSkipFocusRestore: true});
    };

    return (
        <ScreenWrapper
            testID="SpendRuleCategoryPage"
            shouldEnableMaxHeight
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton
                title={translate('workspace.rules.spendRules.merchantTypes')}
                onBackButtonPress={goBack}
            />
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
        </ScreenWrapper>
    );
}
