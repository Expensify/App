import type {SearchQueryItem} from '@components/Search/SearchList/ListItem/SearchQueryListItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery, buildSearchQueryString} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
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
    spendRoute: Route;
    getDestinationText: (destination: string) => string;
};

function buildTopLevelNavigationItems({labels, icons, spendRoute, getDestinationText}: BuildTopLevelNavigationItemsParams): NavigationSuggestionSourceItem[] {
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
            action: () => Navigation.navigate(spendRoute),
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

    const defaultSpendQuery = buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE});
    const lastSpendQuery = lastSearchParams?.queryJSON ? buildSearchQueryString(lastSearchParams.queryJSON) : undefined;
    const spendRoute = ROUTES.SEARCH_ROOT.getRoute({query: lastSpendQuery ?? defaultSpendQuery});
    const topLevelItems = buildTopLevelNavigationItems({
        labels: {
            home: translate('common.home'),
            inbox: translate('common.inbox'),
            spend: translate('common.spend'),
            workspaces: translate('common.workspacesTabTitle'),
            account: translate('initialSettingsPage.account'),
        },
        icons,
        spendRoute,
        getDestinationText: (destination) => getGoToText(translate, destination),
    });

    return buildNavigationSuggestions(query, [topLevelItems], localeCompare);
}

export default useNavigationSuggestions;
export {buildTopLevelNavigationItems};
