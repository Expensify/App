/**
 * Builds the top-level, Spend, and Create navigation suggestions shown in the Search Router.
 */
import getSearchTabRoute from '@components/Navigation/NavigationTabBar/getSearchTabRoute';
import {useSearchSelectionActions} from '@components/Search/SearchContext';
import type {SearchQueryItem} from '@components/Search/SearchList/ListItem/SearchQueryListItem';
import TextWithIconCell from '@components/Search/SearchList/ListItem/TextWithIconCell';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
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

import getDomainMenuItems from '@pages/domain/getDomainMenuItems';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import {isAdminSelector} from '@src/selectors/Domain';
import type {Domain} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ReactNode} from 'react';
import type {TupleToUnion} from 'type-fest';

import {Str} from 'expensify-common';
import React from 'react';

import type {NavigationSuggestionSourceItem} from './SearchRouterHelpers';

import {buildNavigationSuggestions, getGoToText} from './SearchRouterHelpers';
import useCreateNavigationSuggestions from './useCreateNavigationSuggestions';

type TopLevelNavigationIcons = Record<'Home' | 'Inbox' | 'ReceiptMultiple' | 'Building' | 'Globe' | 'Gear', IconAsset>;
type SpendNavigationIcons = Record<SearchTypeMenuItem['icon'], IconAsset>;

const DOMAIN_NAVIGATION_ICON_NAMES = ['User', 'UserLock', 'UserShield', 'Users'] as const;
type DomainNavigationIcons = Record<TupleToUnion<typeof DOMAIN_NAVIGATION_ICON_NAMES>, IconAsset>;

const SEARCH_ROUTER_ICON_NAMES = ['Home', 'Inbox', 'ReceiptMultiple', 'Building', 'Globe', 'Gear', ...DOMAIN_NAVIGATION_ICON_NAMES, ...SEARCH_TYPE_MENU_ICON_NAMES] as const;

// Saved searches are user-defined searches, not canned destinations, so they are excluded from go-to navigation suggestions.
const SAVED_SEARCHES_SECTION_PATH = 'search.savedSearchesMenuItemTitle';

type BuildTopLevelNavigationItemsParams = {
    labels: {
        home: string;
        inbox: string;
        spend: string;
        workspaces: string;
        domains: string;
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

type BuildDomainNavigationItemsParams = {
    domains: Array<Domain | null | undefined>;
    currentUserAccountID: number;
    icons: DomainNavigationIcons;
    getItemText: (translationKey: TranslationPaths) => string;
    getDestinationText: (destination: string) => string;
    getDomainContext: (domainName: string) => ReactNode;
    onSelect: (route: Route) => void;
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
            text: getDestinationText(labels.domains),
            singleIcon: icons.Globe,
            action: () => Navigation.navigate(ROUTES.DOMAINS_LIST.route),
            keyForList: 'topLevelDomains',
            matchTerms: [labels.domains],
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

function buildDomainNavigationItems({
    domains,
    currentUserAccountID,
    icons,
    getItemText,
    getDestinationText,
    getDomainContext,
    onSelect,
}: BuildDomainNavigationItemsParams): NavigationSuggestionSourceItem[] {
    const isCurrentUserDomainAdmin = isAdminSelector(currentUserAccountID);

    return domains
        .filter(
            (domain): domain is Domain => !!domain?.accountID && !!domain.email && domain.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && isCurrentUserDomainAdmin(domain),
        )
        .flatMap((domain) => {
            const domainName = Str.extractEmailDomain(domain.email);
            const domainContext = getDomainContext(domainName);

            return getDomainMenuItems({domainAccountID: domain.accountID, icons}).map((item) => {
                const itemText = getItemText(item.translationKey);
                return {
                    text: getDestinationText(itemText),
                    singleIcon: item.icon,
                    action: () => onSelect(item.route),
                    keyForList: `domain_${domain.accountID}_${item.screenName}`,
                    rightElement: domainContext,
                    matchTerms: [itemText, domainName],
                };
            });
        });
}

function useNavigationSuggestions(query: string, shouldWatchForApprovals = true): SearchQueryItem[] {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(SEARCH_ROUTER_ICON_NAMES);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [lastSearchParams] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const [allDomains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);
    const createItems = useCreateNavigationSuggestions(query);
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {typeMenuSections} = useSearchTypeMenuSections(undefined, shouldWatchForApprovals);

    const topLevelItems = buildTopLevelNavigationItems({
        labels: {
            home: translate('common.home'),
            inbox: translate('common.inbox'),
            spend: translate('common.spend'),
            workspaces: translate('common.workspacesTabTitle'),
            domains: translate('common.domains'),
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

    const domainItems = buildDomainNavigationItems({
        domains: Object.values(allDomains ?? {}),
        currentUserAccountID: currentUserPersonalDetails.accountID,
        icons,
        getItemText: (translationKey) => translate(translationKey),
        getDestinationText: (destination) => getGoToText(translate, destination),
        getDomainContext: (domainName) => (
            <TextWithIconCell
                text={domainName}
                icon={icons.Globe}
                iconSize={variables.fontSizeLabel}
                showTooltip={false}
                textStyle={[styles.textLabelSupporting, styles.label]}
            />
        ),
        onSelect: (route) => Navigation.navigate(route),
    });

    return buildNavigationSuggestions(query, [topLevelItems, spendItems, domainItems, createItems], localeCompare);
}

export default useNavigationSuggestions;
export {buildTopLevelNavigationItems, buildSpendNavigationItems, buildDomainNavigationItems};
