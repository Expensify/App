import ActivityIndicator from '@components/ActivityIndicator';
import BlockingView from '@components/BlockingViews/BlockingView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSearchResults from '@hooks/useSearchResults';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import React from 'react';
import {View} from 'react-native';

import useRuleConditionSelection from './useRuleConditionSelection';

type RuleConditionItem = {
    /** What the rule stores, such as a card ID or a currency code */
    value: string;

    text: string;

    alternateText?: string;

    /** Further text the search matches on, such as a currency's full name */
    searchableText?: string;
};

type RuleConditionListItem = ListItem & {
    value: string;
    searchableText?: string;
};

type RuleConditionMultiSelectPageProps = {
    draftValues?: string[];

    /** Use radio buttons and an explicit Any option. */
    isSingleSelection?: boolean;
    shouldAlwaysShowSearch?: boolean;

    title: string;

    testID: string;

    sentryLabel: SentryLabel;

    backToRoute: Route;

    items: RuleConditionItem[];

    onSave: (values: string[]) => void;

    /**
     * Words a saved value the page has no row for, which defaults to the stored value itself.
     *
     * A value can outlive the workspace that named it, such as a card of a feed the workspace no longer has, and
     * a merchant type is labelled from a list rather than named by the workspace at all.
     */
    getFallbackText?: (value: string) => string;

    /** Whether the items are still arriving, which an empty list would otherwise read as none existing */
    isLoading?: boolean;
};

const ANY_RULE_CONDITION = 'any';

/**
 * The picker every list condition of a rule opens, which only differs by the values it lists and where it saves.
 *
 * A rule keeps matching on a value the workspace has since dropped. Listing it is the only way to see what the
 * rule matches on and the only way to take it off, so such a value is added back rather than left out.
 */
function RuleConditionMultiSelectPage({
    draftValues,
    isSingleSelection,
    shouldAlwaysShowSearch,
    title,
    testID,
    sentryLabel,
    backToRoute,
    items,
    onSave,
    getFallbackText,
    isLoading,
}: RuleConditionMultiSelectPageProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, localeCompare} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    let initialValues = draftValues ?? [];
    if (isSingleSelection) {
        if (initialValues.length > 1) {
            // Picking a budget must never silently keep one of several previous matches.
            initialValues = [];
        } else if (initialValues.length === 0) {
            initialValues = [ANY_RULE_CONDITION];
        }
    }
    const {selectedValues, initialSelectedValues, toggleValue, toggleAll} = useRuleConditionSelection(initialValues, isSingleSelection);

    const listItems: RuleConditionListItem[] = items.map(({value, text, alternateText, searchableText}) => ({
        keyForList: value,
        text,
        alternateText,
        searchableText,
        value,
        isSelected: selectedValues.includes(value),
    }));

    const listedValues = new Set(listItems.map((item) => item.value));
    if (isSingleSelection) {
        listedValues.add(ANY_RULE_CONDITION);
    }
    const hasUnavailableSelection = isSingleSelection && selectedValues.some((value) => !listedValues.has(value) && !draftValues?.includes(value));
    for (const value of selectedValues) {
        if (listedValues.has(value) || (isSingleSelection && !draftValues?.includes(value))) {
            continue;
        }
        listItems.push({keyForList: value, text: getFallbackText ? getFallbackText(value) : value, value, isSelected: true});
    }

    const filterItem = (item: RuleConditionListItem, searchInput: string) =>
        tokenizedSearch([item], searchInput, (listItem) => [listItem.text ?? '', listItem.alternateText ?? '', listItem.searchableText ?? '']).length > 0;

    // Pin the initially selected values to the top of the FULL sorted list, then let the search filter run over the
    // already-pinned list so pinned rows stay at the top even while searching.
    const sortedItems = moveInitialSelectionToTop(
        [...listItems].sort((a, b) => localeCompare(a.text ?? '', b.text ?? '')),
        initialSelectedValues,
    );

    const [inputValue, setInputValue, filteredItems] = useSearchResults(sortedItems, filterItem);
    const anyItem = {keyForList: ANY_RULE_CONDITION, value: ANY_RULE_CONDITION, text: translate('common.any'), isSelected: selectedValues.includes(ANY_RULE_CONDITION)};
    const selectableItems = isSingleSelection ? [anyItem, ...filteredItems] : filteredItems;
    const isLoadingOptions = !!isLoading && listItems.length === 0;
    const isSaveDisabled = isLoadingOptions || (isSingleSelection && (selectedValues.length !== 1 || hasUnavailableSelection));

    const toggleItem = (item: RuleConditionListItem) => toggleValue(item.value);
    const toggleSelectAll = () => toggleAll(filteredItems.map((item) => item.value));

    const goBackToRule = () => Navigation.goBack(backToRoute);

    // Clearing every value leaves the rule matching on whatever its other conditions are.
    const handleSave = () => {
        if (isSaveDisabled) {
            return;
        }
        onSave(isSingleSelection ? selectedValues.filter((value) => value !== ANY_RULE_CONDITION) : selectedValues);
        Navigation.goBack(backToRoute, {shouldSkipFocusRestore: true});
    };

    return (
        <ScreenWrapper
            testID={testID}
            shouldEnableMaxHeight
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButtonAndTitle
                title={title}
                onBackButtonPress={goBackToRule}
            />
            <SelectionList
                canSelectMultiple={!isSingleSelection}
                shouldSingleExecuteRowSelect={isSingleSelection}
                shouldUpdateFocusedIndex
                ListItem={isSingleSelection ? SingleSelectListItem : MultiSelectListItem}
                data={isLoadingOptions ? [] : selectableItems}
                selectedItems={selectedValues}
                shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                onSelectRow={toggleItem}
                onSelectionButtonPress={toggleItem}
                onSelectAll={!isSingleSelection && filteredItems.length > 0 ? toggleSelectAll : undefined}
                textInputOptions={
                    shouldAlwaysShowSearch || sortedItems.length >= CONST.STANDARD_LIST_ITEM_LIMIT
                        ? {
                              value: inputValue,
                              label: translate('common.search'),
                              onChangeText: setInputValue,
                          }
                        : undefined
                }
                style={{
                    listHeaderWrapperStyle: [styles.pt5, styles.pb2],
                    listHeaderSelectAllTextStyle: [styles.textLabelSupporting],
                }}
                listEmptyContent={
                    isLoading ? (
                        <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                            <ActivityIndicator
                                color={theme.spinner}
                                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                            />
                        </View>
                    ) : (
                        <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                            <BlockingView
                                icon={illustrations.Telescope}
                                iconWidth={variables.emptyListIconWidth}
                                iconHeight={variables.emptyListIconHeight}
                                title={translate('common.noResultsFound')}
                            />
                        </ScrollView>
                    )
                }
                footerContent={
                    <FormAlertWithSubmitButton
                        sentryLabel={sentryLabel}
                        buttonText={translate('common.save')}
                        isAlertVisible={hasUnavailableSelection}
                        message={hasUnavailableSelection ? translate('common.error.fieldRequired') : undefined}
                        isDisabled={isSaveDisabled}
                        onSubmit={handleSave}
                        enabledWhenOffline
                        containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                    />
                }
            />
        </ScreenWrapper>
    );
}

export default RuleConditionMultiSelectPage;
export type {RuleConditionItem};
