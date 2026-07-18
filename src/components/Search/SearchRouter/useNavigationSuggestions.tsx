/**
 * Builds the top-level and Spend navigation suggestions shown in the Search Router.
 */
import Icon from '@components/Icon';
import getSearchTabRoute from '@components/Navigation/NavigationTabBar/getSearchTabRoute';
import {useSearchSelectionActions} from '@components/Search/SearchContext';
import type {SearchQueryItem} from '@components/Search/SearchList/ListItem/SearchQueryListItem';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {setSearchContext} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import type {SearchTypeMenuItem, SearchTypeMenuSection} from '@libs/SearchUIUtils';

import navigationRef from '@navigation/navigationRef';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

import type {NavigationSuggestionSourceItem} from './SearchRouterHelpers';

import {buildNavigationSuggestions, getGoToText} from './SearchRouterHelpers';

type TopLevelNavigationIcons = Record<'Home' | 'Inbox' | 'ReceiptMultiple' | 'Building' | 'Gear', IconAsset>;
type SpendNavigationIcons = Record<SearchTypeMenuItem['icon'], IconAsset>;

type RightSideContextProps = {
    label: string;
    icon: IconAsset;
};

function RightSideContext({label, icon}: RightSideContextProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
            <Icon
                src={icon}
                fill={theme.icon}
                size={CONST.ICON_SIZE.SMALL}
            />
            <Text style={styles.textLabelSupporting}>{label}</Text>
        </View>
    );
}

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
        .filter((section) => section.translationPath !== 'search.savedSearchesMenuItemTitle')
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

function navigateToSpendSearch(searchQuery: string, clearSelectedTransactions: () => void) {
    clearSelectedTransactions();
    setSearchContext(false);
    Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: searchQuery}));
}

function useNavigationSuggestions(query: string, shouldWatchForApprovals = true): SearchQueryItem[] {
    const {translate, localeCompare} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons([
        'Home',
        'Inbox',
        'ReceiptMultiple',
        'Building',
        'Gear',
        'Basket',
        'CalendarSolid',
        'Receipt',
        'MoneyBag',
        'CreditCard',
        'MoneyHourglass',
        'CreditCardHourglass',
        'Bank',
        'User',
        'Folder',
        'Document',
        'Pencil',
        'ThumbsUp',
        'CheckCircle',
    ]);
    const [lastSearchParams] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {typeMenuSections} = useSearchTypeMenuSections(undefined, shouldWatchForApprovals);

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
            <RightSideContext
                label={translate('common.spend')}
                icon={icons.ReceiptMultiple}
            />
        ),
        getItemText: (item) => translate(item.translationPath),
        getDestinationText: (destination) => getGoToText(translate, destination),
        onSelect: (searchQuery) => navigateToSpendSearch(searchQuery, clearSelectedTransactions),
    });

    return buildNavigationSuggestions(query, [topLevelItems, spendItems], localeCompare);
}

export default useNavigationSuggestions;
export {buildTopLevelNavigationItems, buildSpendNavigationItems, navigateToSpendSearch};
