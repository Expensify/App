/**
 * Builds the top-level, Spend, Workspace, and Create navigation suggestions shown in the Search Router.
 */
import Avatar from '@components/Avatar';
import getSearchTabRoute from '@components/Navigation/NavigationTabBar/getSearchTabRoute';
import {useSearchSelectionActions} from '@components/Search/SearchContext';
import type {SearchQueryItem} from '@components/Search/SearchList/ListItem/SearchQueryListItem';
import TextWithIconCell from '@components/Search/SearchList/ListItem/TextWithIconCell';
import TextWithTooltip from '@components/TextWithTooltip';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {shouldShowPolicy} from '@libs/PolicyUtils';
import navigateToCannedSpendSearch from '@libs/SearchNavigationUtils';
import {SEARCH_TYPE_MENU_ICON_NAMES} from '@libs/SearchUIUtils';
import type {SearchTypeMenuItem, SearchTypeMenuSection} from '@libs/SearchUIUtils';

import navigationRef from '@navigation/navigationRef';

import getWorkspaceMenuItems from '@pages/workspace/getWorkspaceMenuItems';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {emailSelector} from '@src/selectors/Session';
import type * as OnyxTypes from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ReactNode} from 'react';
import type {OnyxCollection} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

import type {NavigationSuggestionSourceItem} from './SearchRouterHelpers';

import navigateToWorkspaceSettingsRoute from './navigateToWorkspaceSettingsRoute';
import {buildNavigationSuggestions, getGoToText} from './SearchRouterHelpers';
import useCreateNavigationSuggestions from './useCreateNavigationSuggestions';

type TopLevelNavigationIcons = Record<'Home' | 'Inbox' | 'ReceiptMultiple' | 'Building' | 'Gear', IconAsset>;
type SpendNavigationIcons = Record<SearchTypeMenuItem['icon'], IconAsset>;

const SEARCH_ROUTER_ICON_NAMES = [
    'Home',
    'Inbox',
    'ReceiptMultiple',
    'Building',
    'Gear',
    ...SEARCH_TYPE_MENU_ICON_NAMES,
    'Users',
    'Hashtag',
    'Sync',
    'Briefcase',
    'Tag',
    'Coins',
    'Workflows',
    'Feed',
    'Car',
    'LuggageWithLines',
    'ExpensifyCard',
    'Clock',
    'InvoiceGeneric',
    'Bolt',
] as const;

// Saved searches are user-defined searches, not canned destinations, so they are excluded from go-to navigation suggestions.
const SAVED_SEARCHES_SECTION_PATH = 'search.savedSearchesMenuItemTitle';

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

type BuildWorkspaceNavigationItemsParams = {
    policies: OnyxCollection<OnyxTypes.Policy>;
    policyCategories: OnyxCollection<OnyxTypes.PolicyCategories>;
    currentUserLogin: string | undefined;
    icons: Parameters<typeof getWorkspaceMenuItems>[0]['icons'];
    isOffline: boolean;
    isRulesRevampBetaEnabled: boolean;
    isVendorMatchingBetaEnabled: boolean;
    shouldUseNarrowLayout: boolean;
    convertToDisplayString: Parameters<typeof getWorkspaceMenuItems>[0]['convertToDisplayString'];
    getItemText: (item: ReturnType<typeof getWorkspaceMenuItems>[number]) => string;
    getDestinationText: (destination: string) => string;
};

type WorkspaceIdentityCellProps = {
    /** The policy used to identify the workspace suggestion */
    policy: OnyxTypes.Policy;
};

function WorkspaceIdentityCell({policy}: WorkspaceIdentityCellProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexRow, styles.flexShrink1, styles.alignItemsCenter, styles.gap1]}>
            <Avatar
                source={policy.avatarURL}
                type={CONST.ICON_TYPE_WORKSPACE}
                name={policy.name}
                avatarID={policy.id}
                size={CONST.AVATAR_SIZE.XXX_SMALL}
            />
            <TextWithTooltip
                text={policy.name}
                shouldShowTooltip
                numberOfLines={1}
                style={[styles.textLabelSupporting, styles.flexShrink1]}
            />
        </View>
    );
}

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

function buildWorkspaceNavigationItems({
    policies,
    policyCategories,
    currentUserLogin,
    icons,
    isOffline,
    isRulesRevampBetaEnabled,
    isVendorMatchingBetaEnabled,
    shouldUseNarrowLayout,
    convertToDisplayString,
    getItemText,
    getDestinationText,
}: BuildWorkspaceNavigationItemsParams): NavigationSuggestionSourceItem[] {
    return Object.values(policies ?? {})
        .filter(
            (policy): policy is OnyxTypes.Policy =>
                !!policy?.id && !policy.isJoinRequestPending && policy.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && shouldShowPolicy(policy, isOffline, currentUserLogin),
        )
        .flatMap((policy) => {
            const items = getWorkspaceMenuItems({
                policy,
                policyID: policy.id,
                currentUserLogin,
                icons,
                policyCategories: policyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`],
                isRulesRevampBetaEnabled,
                isVendorMatchingBetaEnabled,
                convertToDisplayString,
            });

            return items.map((item) => {
                const itemText = getItemText(item);
                return {
                    text: getDestinationText(itemText),
                    singleIcon: item.icon,
                    action: () => navigateToWorkspaceSettingsRoute(item.getRoute(), policy.id, shouldUseNarrowLayout),
                    keyForList: `workspace_${policy.id}_${item.screenName}`,
                    rightElement: <WorkspaceIdentityCell policy={policy} />,
                    matchTerms: item.screenName === SCREENS.WORKSPACE.PROFILE ? [itemText, policy.name] : [itemText],
                    sortText: policy.name,
                };
            });
        });
}

function useNavigationSuggestions(query: string, shouldWatchForApprovals = true): SearchQueryItem[] {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const {convertToDisplayString} = useCurrencyListActions();
    const {isOffline} = useNetwork();
    const {isBetaEnabled} = usePermissions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(SEARCH_ROUTER_ICON_NAMES);
    const [lastSearchParams] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const createItems = useCreateNavigationSuggestions(query);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [policyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
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

    const workspaceItems = buildWorkspaceNavigationItems({
        policies: allPolicies,
        policyCategories,
        currentUserLogin,
        icons,
        isOffline: !!isOffline,
        isRulesRevampBetaEnabled: isBetaEnabled(CONST.BETAS.RULES_REVAMP),
        isVendorMatchingBetaEnabled: isBetaEnabled(CONST.BETAS.VENDOR_MATCHING),
        shouldUseNarrowLayout,
        convertToDisplayString,
        getItemText: (item) => translate(item.translationKey),
        getDestinationText: (destination) => getGoToText(translate, destination),
    });

    return buildNavigationSuggestions(query, [topLevelItems, spendItems, workspaceItems, createItems], localeCompare);
}

export default useNavigationSuggestions;
export {buildTopLevelNavigationItems, buildSpendNavigationItems, buildWorkspaceNavigationItems};
