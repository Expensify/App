/**
 * Builds the top-level, Spend, Account, and Create navigation suggestions shown in the Search Router.
 */
import getSearchTabRoute from '@components/Navigation/NavigationTabBar/getSearchTabRoute';
import {useSearchSelectionActions} from '@components/Search/SearchContext';
import type {SearchQueryItem} from '@components/Search/SearchList/ListItem/SearchQueryListItem';
import TextWithIconCell from '@components/Search/SearchList/ListItem/TextWithIconCell';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import navigateToCannedSpendSearch from '@libs/SearchNavigationUtils';
import {SEARCH_TYPE_MENU_ICON_NAMES} from '@libs/SearchUIUtils';
import type {SearchTypeMenuItem, SearchTypeMenuSection} from '@libs/SearchUIUtils';

import navigationRef from '@navigation/navigationRef';

import useSettingsNavigationMenuData from '@pages/settings/useSettingsNavigationMenuData';
import type {MenuData, MenuSection} from '@pages/settings/useSettingsNavigationMenuData';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ReactNode} from 'react';

import React from 'react';

import type {NavigationSuggestionSourceItem} from './SearchRouterHelpers';

import {buildNavigationSuggestions, getGoToText} from './SearchRouterHelpers';
import useCreateNavigationSuggestions from './useCreateNavigationSuggestions';

type TopLevelNavigationIcons = Record<'Home' | 'Inbox' | 'ReceiptMultiple' | 'Building' | 'Gear', IconAsset>;
type SpendNavigationIcons = Record<SearchTypeMenuItem['icon'], IconAsset>;

const SEARCH_ROUTER_ICON_NAMES = ['Home', 'Inbox', 'ReceiptMultiple', 'Building', 'Gear', ...SEARCH_TYPE_MENU_ICON_NAMES] as const;

// Saved searches are user-defined searches, not canned destinations, so they are excluded from go-to navigation suggestions.
const SAVED_SEARCHES_SECTION_PATH = 'search.savedSearchesMenuItemTitle';
const SECURITY_MATCH_TERMS = ['password', '2fa', 'two factor', 'two-factor'];

type BuildTopLevelNavigationItemsParams = {
    labels: {
        home: string;
        inbox: string;
        spend: string;
        workspaces: string;
        account: string;
    };
    icons: TopLevelNavigationIcons;
    getSpendRoute: () => Route;
    getDestinationText: (destination: string) => string;
};

type BuildSpendNavigationItemsParams = {
    sections: SearchTypeMenuSection[];
    icons: SpendNavigationIcons;
    rightElement: ReactNode;
    getItemText: (item: SearchTypeMenuItem) => string;
    getDestinationText: (destination: string) => string;
    onSelect: (searchQuery: string) => void;
};

type BuildAccountNavigationItemsParams = {
    /** Settings menu sections to expose as navigation suggestions. */
    sections: MenuSection[];

    /** Context shown on the right side of each suggestion row. */
    rightElement: ReactNode;

    /** Resolves a localized label for a Settings menu item. */
    getItemText: (item: MenuData) => string;

    /** Formats a Settings label as navigation destination text. */
    getDestinationText: (destination: string) => string;
};

// Tab buttons own stateful navigation behavior and do not expose reusable descriptors, so Search Router keeps deterministic destination actions here.
function buildTopLevelNavigationItems({labels, icons, getSpendRoute, getDestinationText}: BuildTopLevelNavigationItemsParams): NavigationSuggestionSourceItem[] {
    return [
        {
            text: getDestinationText(labels.home),
            singleIcon: icons.Home,
            action: () => Navigation.navigate(ROUTES.HOME),
            keyForList: 'topLevelHome',
            matchTerms: [labels.home],
        },
        {
            text: getDestinationText(labels.inbox),
            singleIcon: icons.Inbox,
            action: () => Navigation.navigate(ROUTES.INBOX),
            keyForList: 'topLevelInbox',
            matchTerms: [labels.inbox],
        },
        {
            text: getDestinationText(labels.spend),
            singleIcon: icons.ReceiptMultiple,
            action: () => Navigation.navigate(getSpendRoute()),
            keyForList: 'topLevelSpend',
            matchTerms: [labels.spend],
        },
        {
            text: getDestinationText(labels.workspaces),
            singleIcon: icons.Building,
            action: () => Navigation.navigate(ROUTES.WORKSPACES_LIST.route),
            keyForList: 'topLevelWorkspaces',
            matchTerms: [labels.workspaces],
        },
        {
            text: getDestinationText(labels.account),
            singleIcon: icons.Gear,
            action: () => Navigation.navigate(ROUTES.SETTINGS),
            keyForList: 'topLevelAccount',
            matchTerms: [labels.account],
        },
    ];
}

function buildSpendNavigationItems({sections, icons, rightElement, getItemText, getDestinationText, onSelect}: BuildSpendNavigationItemsParams): NavigationSuggestionSourceItem[] {
    return sections
        .filter((section) => section.translationPath !== SAVED_SEARCHES_SECTION_PATH)
        .flatMap((section) =>
            section.menuItems.map((item) => {
                const itemText = getItemText(item);
                return {
                    text: getDestinationText(itemText),
                    singleIcon: icons[item.icon],
                    action: () => onSelect(item.searchQuery),
                    keyForList: `spend_${item.key}`,
                    rightElement,
                    matchTerms: [itemText],
                };
            }),
        );
}

function buildAccountNavigationItems({sections, rightElement, getItemText, getDestinationText}: BuildAccountNavigationItemsParams): NavigationSuggestionSourceItem[] {
    return sections.flatMap((section) =>
        section.items.flatMap((item) => {
            // Keep future action-only Settings rows from becoming Search Router destinations.
            if (!item.screenName || item.screenName === SCREENS.SETTINGS.SAVE_THE_WORLD) {
                return [];
            }

            const itemText = getItemText(item);
            return {
                text: getDestinationText(itemText),
                singleIcon: item.icon,
                action: item.action,
                keyForList: `account_${item.screenName}`,
                rightElement,
                matchTerms: [itemText, ...(item.screenName === SCREENS.SETTINGS.SECURITY ? SECURITY_MATCH_TERMS : [])],
            };
        }),
    );
}

function useNavigationSuggestions(query: string, shouldWatchForApprovals = true): SearchQueryItem[] {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(SEARCH_ROUTER_ICON_NAMES);
    const [lastSearchParams] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const createItems = useCreateNavigationSuggestions(query);
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {typeMenuSections} = useSearchTypeMenuSections(undefined, shouldWatchForApprovals);
    const {accountMenuItemsData, generalMenuItemsData} = useSettingsNavigationMenuData();

    const topLevelItems = buildTopLevelNavigationItems({
        labels: {
            home: translate('common.home'),
            inbox: translate('common.inbox'),
            spend: translate('common.spend'),
            workspaces: translate('common.workspacesTabTitle'),
            account: translate('initialSettingsPage.account'),
        },
        icons,
        getSpendRoute: () => getSearchTabRoute(navigationRef.getRootState(), lastSearchParams),
        getDestinationText: (destination) => getGoToText(translate, destination),
    });

    const spendItems = buildSpendNavigationItems({
        sections: typeMenuSections,
        icons,
        rightElement: (
            <TextWithIconCell
                text={translate('common.spend')}
                icon={icons.ReceiptMultiple}
                iconSize={variables.fontSizeLabel}
                showTooltip={false}
                textStyle={[styles.textLabelSupporting, styles.label]}
            />
        ),
        getItemText: (item) => translate(item.translationPath),
        getDestinationText: (destination) => getGoToText(translate, destination),
        onSelect: (searchQuery) => navigateToCannedSpendSearch(searchQuery, clearSelectedTransactions),
    });

    const accountItems = buildAccountNavigationItems({
        sections: [accountMenuItemsData, generalMenuItemsData],
        rightElement: (
            <TextWithIconCell
                text={translate('initialSettingsPage.account')}
                icon={icons.Gear}
                iconSize={variables.fontSizeLabel}
                showTooltip={false}
                textStyle={[styles.textLabelSupporting, styles.label]}
            />
        ),
        getItemText: (item) => translate(item.translationKey),
        getDestinationText: (destination) => getGoToText(translate, destination),
    });

    return buildNavigationSuggestions(query, [topLevelItems, spendItems, accountItems, createItems], localeCompare);
}

export default useNavigationSuggestions;
export {buildTopLevelNavigationItems, buildSpendNavigationItems, buildAccountNavigationItems};
