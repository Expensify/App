import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import {useSearchQueryContext, useSearchSelectionActions} from '@components/Search/SearchContext';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useSingleExecution from '@hooks/useSingleExecution';
import type {TodoCounts} from '@hooks/useTodoCounts';
import useTodoCounts from '@hooks/useTodoCounts';

import clearSelectedText from '@libs/clearSelectedText/clearSelectedText';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {openFirstSavedSearch, openLastInsightsDashboard, openSearchMenuItem, reopenLastVisitedSearch} from '@libs/MoreNavigationUtils';
import {searchKeyToSavedSearchID} from '@libs/SearchKeyUtils';
import {navigateToSearch} from '@libs/SearchNavigationUtils';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import type {SearchTypeMenuItem} from '@libs/SearchUIUtils';
import {formatBadgeText, getItemBadgeText} from '@libs/SearchUIUtils';
import {ACCOUNTING_KEYS, EXPENSES_KEYS, getGroupedSearchTranslationPath, INSIGHTS_KEYS, REPORTS_KEYS, SAVED_SEARCHES_GROUP_ID} from '@libs/SpendNavigationGroups';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ValueOf} from 'type-fest';

import React from 'react';

import FlatNavItem from './FlatNavItem';
import FlatNavSavedSearches from './FlatNavSavedSearches';
import FlatNavSubItemList from './FlatNavSubItemList';
import useFlatNavSpendItems from './useFlatNavSpendItems';

type FlatNavSpendSectionProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;

    /** Whether the bar is drawn as an icon rail, which hides every group's children */
    isCollapsed: boolean;

    /** To-do counts for the group badges. Left out while the Spend tab is not showing, so no badge goes stale. */
    todoCounts?: TodoCounts;
};

type FlatNavGroupProps = {
    label: string;
    icon: IconAsset;
    items: SearchTypeMenuItem[];

    /** The group's broadest search, which the parent row itself stands for and so is not repeated as a child */
    rootKey?: SearchTypeMenuItem['key'];

    isCollapsed: boolean;
    isSelected: boolean;
    currentSearchKey: SearchTypeMenuItem['key'] | undefined;
    todoCounts?: TodoCounts;
    sentryLabel?: string;
    onPressItem: (item: SearchTypeMenuItem) => void;
};

/**
 * A parent row with its searches nested under it while the group is the current one. A collapsed group carries its
 * children's combined count. Once it expands, each child shows its own count, so repeating the total on the parent
 * would double-report it.
 */
function FlatNavGroup({label, icon, items, rootKey, isCollapsed, isSelected, currentSearchKey, todoCounts, sentryLabel, onPressItem}: FlatNavGroupProps) {
    const {translate} = useLocalize();
    const rootItem = rootKey ? items.find((item) => item.key === rootKey) : undefined;
    const children = rootItem ? items.filter((item) => item !== rootItem) : items;
    const isExpanded = isSelected && !isCollapsed && children.length > 0;

    // formatBadgeText returns '' for zero, which renders nothing.
    const countsBySearchKey: Record<string, number> | undefined = todoCounts;
    const groupBadgeText = countsBySearchKey ? formatBadgeText(items.reduce((total, item) => total + (countsBySearchKey[item.key] ?? 0), 0)) : undefined;
    let parentBadgeText = isExpanded ? undefined : groupBadgeText;
    if (isExpanded && rootItem && todoCounts) {
        parentBadgeText = getItemBadgeText(rootItem.key, todoCounts);
    }

    return (
        <>
            <FlatNavItem
                isCollapsed={isCollapsed}
                label={label}
                icon={icon}
                isSelected={isSelected}
                badgeText={parentBadgeText}
                // The collapsed row's dot has to outlive the badge it stands in for, so it fades rather than blinks.
                hasCollapsedStatusIndicator={!!groupBadgeText}
                sentryLabel={sentryLabel}
                onPress={() => {
                    const firstItem = rootItem ?? items.at(0);
                    if (firstItem) {
                        onPressItem(firstItem);
                    }
                }}
            />
            {isSelected && children.length > 0 && (
                <FlatNavSubItemList
                    isExpanded={isExpanded}
                    selectedIndex={children.findIndex((item) => item.key === currentSearchKey)}
                >
                    {children.map((item, index) => (
                        <FlatNavItem
                            key={item.key}
                            isCollapsed={isCollapsed}
                            label={translate(getGroupedSearchTranslationPath(item.key, item.translationPath))}
                            isSelected={currentSearchKey === item.key}
                            isSubItem
                            isFirstSubItem={index === 0}
                            isLastSubItem={index === children.length - 1}
                            badgeText={todoCounts ? getItemBadgeText(item.key, todoCounts) : undefined}
                            sentryLabel={CONST.SENTRY_LABEL.SEARCH.TYPE_MENU_ITEM}
                            onPress={() => onPressItem(item)}
                        />
                    ))}
                </FlatNavSubItemList>
            )}
        </>
    );
}

/**
 * The bar's Spend rows, from Expenses down to Travel. They live apart from the rest of the bar because deciding which
 * searches a user can see reads reports and transactions, and that work only runs while the Spend tab is showing.
 */
function FlatNavSpendSection({selectedTab, isCollapsed, todoCounts}: FlatNavSpendSectionProps) {
    const {translate, localeCompare} = useLocalize();
    const {singleExecution} = useSingleExecution();
    const {isBetaEnabled} = usePermissions();
    const isInsightsPageEnabled = isBetaEnabled(CONST.BETAS.INSIGHTS_PAGE);
    const navIcons = useMemoizedLazyExpensifyIcons(['Receipt', 'Document', 'Coins', 'InvoiceGeneric', 'Connect', 'Bookmark', 'PieChart', 'LuggageWithLines']);

    const isSpendTabSelected = selectedTab === NAVIGATION_TABS.SEARCH;
    const {currentSearchKey, currentSearchQueryJSON} = useSearchQueryContext();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {expenses, reports, accounting, insights} = useFlatNavSpendItems(isSpendTabSelected);

    const [searchFilters] = useOnyx(ONYXKEYS.SEARCH_FILTERS);
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);

    const spendSearchKey = isSpendTabSelected ? currentSearchKey : undefined;
    const isInGroup = (keys: Array<SearchTypeMenuItem['key']>) => keys.some((key) => key === spendSearchKey);
    const isSavedGroupSelected = !!searchKeyToSavedSearchID(spendSearchKey);
    // Invoices and Travel are plain searches by type, with no suggested search key of their own.
    const isTypeSearchSelected = (type: SearchDataTypes) => isSpendTabSelected && !currentSearchKey && currentSearchQueryJSON?.type === type;
    const hasSavedSearches = Object.keys(savedSearches ?? {}).length > 0;

    const navigateToSearchItem = singleExecution((item: SearchTypeMenuItem) => openSearchMenuItem(item, searchFilters, clearSelectedTransactions));

    const navigateToTypeSearch = (type: SearchDataTypes) => {
        clearSelectedText();
        interceptAnonymousUser(() => {
            navigateToSearch({query: buildCannedSearchQuery({type})});
        });
    };

    const navigateToInsights = () => {
        if (selectedTab === NAVIGATION_TABS.INSIGHTS) {
            return;
        }
        openLastInsightsDashboard();
    };

    // Opening the group returns to the saved search the user last had open, or the first one by name.
    const navigateToSavedSearches = () => {
        if (reopenLastVisitedSearch(SAVED_SEARCHES_GROUP_ID, savedSearches, clearSelectedTransactions)) {
            return;
        }
        openFirstSavedSearch(savedSearches, searchFilters, localeCompare);
    };

    return (
        <>
            {expenses.length > 0 && (
                <FlatNavGroup
                    label={translate('search.tabs.expenses')}
                    icon={navIcons.Receipt}
                    items={expenses}
                    rootKey={CONST.SEARCH.SEARCH_KEYS.EXPENSES}
                    isCollapsed={isCollapsed}
                    isSelected={isInGroup(EXPENSES_KEYS)}
                    currentSearchKey={spendSearchKey}
                    todoCounts={todoCounts}
                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.EXPENSES}
                    onPressItem={navigateToSearchItem}
                />
            )}

            {reports.length > 0 && (
                <FlatNavGroup
                    label={translate('common.reports')}
                    icon={navIcons.Document}
                    items={reports}
                    rootKey={CONST.SEARCH.SEARCH_KEYS.REPORTS}
                    isCollapsed={isCollapsed}
                    isSelected={isInGroup(REPORTS_KEYS)}
                    currentSearchKey={spendSearchKey}
                    todoCounts={todoCounts}
                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.REPORTS}
                    onPressItem={navigateToSearchItem}
                />
            )}

            {/* Bills has no destination in the app yet, so the row is shown for the design but can't be chosen. */}
            <FlatNavItem
                isCollapsed={isCollapsed}
                label={translate('workspace.common.bills')}
                icon={navIcons.Coins}
                isSelected={false}
                isDisabled
                onPress={() => {}}
            />

            <FlatNavItem
                isCollapsed={isCollapsed}
                label={translate('workspace.common.invoices')}
                icon={navIcons.InvoiceGeneric}
                isSelected={isTypeSearchSelected(CONST.SEARCH.DATA_TYPES.INVOICE)}
                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.INVOICES}
                onPress={() => navigateToTypeSearch(CONST.SEARCH.DATA_TYPES.INVOICE)}
            />

            {accounting.length > 0 && (
                <FlatNavGroup
                    label={translate('search.tabs.accounting')}
                    icon={navIcons.Connect}
                    items={accounting}
                    isCollapsed={isCollapsed}
                    isSelected={isInGroup(ACCOUNTING_KEYS)}
                    currentSearchKey={spendSearchKey}
                    todoCounts={todoCounts}
                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.ACCOUNTING}
                    onPressItem={navigateToSearchItem}
                />
            )}

            {hasSavedSearches && (
                <>
                    <FlatNavItem
                        isCollapsed={isCollapsed}
                        label={translate('search.savedSearchesMenuItemTitle')}
                        icon={navIcons.Bookmark}
                        isSelected={isSavedGroupSelected}
                        sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.SAVED_SEARCHES}
                        onPress={navigateToSavedSearches}
                    />
                    {isSavedGroupSelected && <FlatNavSavedSearches isExpanded={!isCollapsed} />}
                </>
            )}

            {isInsightsPageEnabled && (
                <FlatNavItem
                    isCollapsed={isCollapsed}
                    label={translate('common.insights')}
                    icon={navIcons.PieChart}
                    isSelected={selectedTab === NAVIGATION_TABS.INSIGHTS}
                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.INSIGHTS}
                    onPress={navigateToInsights}
                />
            )}
            {!isInsightsPageEnabled && insights.length > 0 && (
                <FlatNavGroup
                    label={translate('common.insights')}
                    icon={navIcons.PieChart}
                    items={insights}
                    isCollapsed={isCollapsed}
                    isSelected={isInGroup(INSIGHTS_KEYS)}
                    currentSearchKey={spendSearchKey}
                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.INSIGHTS}
                    onPressItem={navigateToSearchItem}
                />
            )}

            <FlatNavItem
                isCollapsed={isCollapsed}
                label={translate('workspace.common.travel')}
                icon={navIcons.LuggageWithLines}
                isSelected={isTypeSearchSelected(CONST.SEARCH.DATA_TYPES.TRIP)}
                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.TRAVEL}
                onPress={() => navigateToTypeSearch(CONST.SEARCH.DATA_TYPES.TRIP)}
            />
        </>
    );
}

/** The Spend rows with to-do badges, mounted only while the Spend tab is showing so the to-do classification runs there alone. */
function FlatNavSpendSectionWithTodoCounts(props: Omit<FlatNavSpendSectionProps, 'todoCounts'>) {
    const {counts} = useTodoCounts();
    return (
        <FlatNavSpendSection
            {...props}
            todoCounts={counts}
        />
    );
}

export default FlatNavSpendSection;
export {FlatNavSpendSectionWithTodoCounts};
