import ActivityIndicator from '@components/ActivityIndicator';
import BlockingView from '@components/BlockingViews/BlockingView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchResults from '@hooks/useSearchResults';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import React from 'react';
import {View} from 'react-native';

import useRuleConditionSelection from './useRuleConditionSelection';

/** The fields of a rule that match on a list of values, which are the ones this page can pick for */
type RuleConditionListField = 'cardsToMatch' | 'currenciesToMatch' | 'merchantTypesToMatch' | 'submittersToMatch' | 'taxRatesToMatch';

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
    /** The form field the picked values are read from */
    field: RuleConditionListField;

    title: string;

    testID: string;

    sentryLabel: SentryLabel;

    backToRoute: Route;

    items: RuleConditionItem[];

    onSave: (values: string[]) => void;

    /**
     * Words a saved value the workspace no longer offers, which defaults to the stored value itself.
     *
     * Only the merchant type needs it, because its values are labelled from a list rather than named by the
     * workspace.
     */
    getFallbackText?: (value: string) => string;

    /** Whether the items are still arriving, which an empty list would otherwise read as none existing */
    isLoading?: boolean;
};

/**
 * The picker every list condition of a rule opens, which only differs by the values it lists and where it saves.
 *
 * A rule keeps matching on a value the workspace has since dropped. Listing it is the only way to see what the
 * rule matches on and the only way to take it off, so such a value is added back rather than left out.
 */
function RuleConditionMultiSelectPage({field, title, testID, sentryLabel, backToRoute, items, onSave, getFallbackText, isLoading}: RuleConditionMultiSelectPageProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, localeCompare} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);

    const {selectedValues, initialSelectedValues, toggleValue, toggleAll} = useRuleConditionSelection(form?.[field] ?? []);

    const listItems: RuleConditionListItem[] = items.map(({value, text, alternateText, searchableText}) => ({
        keyForList: value,
        text,
        alternateText,
        searchableText,
        value,
        isSelected: selectedValues.includes(value),
    }));

    const listedValues = new Set(listItems.map((item) => item.value));
    for (const value of selectedValues) {
        if (listedValues.has(value)) {
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

    const toggleItem = (item: RuleConditionListItem) => toggleValue(item.value);
    const toggleSelectAll = () => toggleAll(filteredItems.map((item) => item.value));

    const goBackToRule = () => Navigation.goBack(backToRoute);

    // Clearing every value leaves the rule matching on whatever its other conditions are.
    const handleSave = () => {
        onSave(selectedValues);
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
                canSelectMultiple
                shouldUpdateFocusedIndex
                ListItem={MultiSelectListItem}
                data={filteredItems}
                selectedItems={selectedValues}
                shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                onSelectRow={toggleItem}
                onSelectionButtonPress={toggleItem}
                onSelectAll={filteredItems.length > 0 ? toggleSelectAll : undefined}
                textInputOptions={
                    sortedItems.length >= CONST.STANDARD_LIST_ITEM_LIMIT
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

export default RuleConditionMultiSelectPage;
export type {RuleConditionItem};
