/**
 * Builds the top-level navigation suggestions shown in the Search Router.
 */
import getSearchTabRoute from '@components/Navigation/NavigationTabBar/getSearchTabRoute';
import type {SearchQueryItem} from '@components/Search/SearchList/ListItem/SearchQueryListItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';

import navigationRef from '@navigation/navigationRef';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';

import type {NavigationSuggestionSourceItem} from './SearchRouterHelpers';

import {buildNavigationSuggestions, getGoToText} from './SearchRouterHelpers';

type TopLevelNavigationIcons = Record<'Home' | 'Inbox' | 'ReceiptMultiple' | 'Building' | 'Gear', IconAsset>;

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

function useNavigationSuggestions(query: string): SearchQueryItem[] {
    const {translate, localeCompare} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Home', 'Inbox', 'ReceiptMultiple', 'Building', 'Gear']);
    const [lastSearchParams] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);

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

    return buildNavigationSuggestions(query, [topLevelItems], localeCompare);
}

export default useNavigationSuggestions;
export {buildTopLevelNavigationItems};
