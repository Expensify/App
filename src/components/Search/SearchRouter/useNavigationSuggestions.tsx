/**
 * Builds the top-level, Spend, Workspace, Domain, Account, and Create navigation suggestions shown in the Search Router.
 */
import WorkspaceAvatar from '@components/Avatar/WorkspaceAvatar';
import getSearchTabRoute from '@components/Navigation/NavigationTabBar/getSearchTabRoute';
import {useSearchSelectionActions} from '@components/Search/SearchContext';
import type {SearchQueryItem} from '@components/Search/SearchList/ListItem/SearchQueryListItem';
import TextWithIconCell from '@components/Search/SearchList/ListItem/TextWithIconCell';
import TextWithTooltip from '@components/TextWithTooltip';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';
import useThemeStyles from '@hooks/useThemeStyles';

import navigateToDomainRouteWithSidebarSync from '@libs/Navigation/helpers/navigateToDomainRouteWithSidebarSync';
import navigateToWorkspaceSettingsRoute from '@libs/Navigation/helpers/navigateToWorkspaceSettingsRoute';
import Navigation from '@libs/Navigation/Navigation';
import {shouldShowPolicy} from '@libs/PolicyUtils';
import navigateToCannedSpendSearch from '@libs/SearchNavigationUtils';
import {SEARCH_TYPE_MENU_ICON_NAMES} from '@libs/SearchUIUtils';
import type {SearchTypeMenuItem, SearchTypeMenuSection} from '@libs/SearchUIUtils';

import navigationRef from '@navigation/navigationRef';

import getDomainMenuItems, {DOMAIN_MENU_ICON_NAMES} from '@pages/domain/getDomainMenuItems';
import type {DomainMenuIconMap} from '@pages/domain/getDomainMenuItems';
import useSettingsNavigationMenuData from '@pages/settings/useSettingsNavigationMenuData';
import type {MenuData, MenuSection} from '@pages/settings/useSettingsNavigationMenuData';
import getWorkspaceMenuItems from '@pages/workspace/getWorkspaceMenuItems';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {isAdminSelector} from '@src/selectors/Domain';
import {emailSelector} from '@src/selectors/Session';
import type * as OnyxTypes from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ReactNode} from 'react';
import type {OnyxCollection} from 'react-native-onyx';

import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';

import type {NavigationSuggestionSourceItem} from './SearchRouterHelpers';

import {buildNavigationSuggestions, getGoToText} from './SearchRouterHelpers';
import useCreateNavigationSuggestions from './useCreateNavigationSuggestions';

type TopLevelNavigationIcons = Record<'Home' | 'Inbox' | 'ReceiptMultiple' | 'Building' | 'Globe' | 'Gear', IconAsset>;
type SpendNavigationIcons = Record<SearchTypeMenuItem['icon'], IconAsset>;

const SEARCH_ROUTER_ICON_NAMES = [
    'Home',
    'Inbox',
    'ReceiptMultiple',
    'Building',
    'Globe',
    'Gear',
    ...DOMAIN_MENU_ICON_NAMES,
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
const SECURITY_MATCH_TERMS = ['password', '2fa', 'two factor', 'two-factor'];

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

type BuildWorkspaceNavigationItemsParams = {
    /** Policies considered when building accessible Workspace destinations. */
    policies: OnyxCollection<OnyxTypes.Policy>;

    /** Categories used by the shared Workspace menu visibility rules. */
    policyCategories: OnyxCollection<OnyxTypes.PolicyCategories>;

    /** Login used to evaluate Workspace membership and permissions. */
    currentUserLogin: string | undefined;

    /** Icons consumed by the shared Workspace menu source. */
    icons: Parameters<typeof getWorkspaceMenuItems>[0]['icons'];

    /** Whether pending offline state should be considered by Workspace visibility rules. */
    isOffline: boolean;

    /** Whether the Rules Revamp beta is enabled for the current user. */
    isRulesRevampBetaEnabled: boolean;

    /** Whether the Vendor Matching beta is enabled for the current user. */
    isVendorMatchingBetaEnabled: boolean;

    /** Whether navigation should use the narrow-layout Workspace flow. */
    shouldUseNarrowLayout: boolean;

    /** Formats monetary values required by shared Workspace menu items. */
    convertToDisplayString: Parameters<typeof getWorkspaceMenuItems>[0]['convertToDisplayString'];

    /** Resolves the localized label for a Workspace menu item. */
    getItemText: (item: ReturnType<typeof getWorkspaceMenuItems>[number]) => string;

    /** Formats a Workspace label as navigation destination text. */
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
            <WorkspaceAvatar
                source={policy.avatarURL}
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

type BuildDomainNavigationItemsParams = {
    domains: Array<OnyxTypes.Domain | null | undefined>;
    currentUserAccountID: number;
    icons: DomainMenuIconMap;
    getItemText: (translationKey: TranslationPaths) => string;
    getDestinationText: (destination: string) => string;
    getDomainContext: (domainName: string) => ReactNode;
    onSelect: (route: Route, domainAccountID: number) => void;
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
                    action: () => navigateToWorkspaceSettingsRoute(item.getRoute(), policy.id, shouldUseNarrowLayout, item.screenName),
                    keyForList: `workspace_${policy.id}_${item.screenName}`,
                    rightElement: <WorkspaceIdentityCell policy={policy} />,
                    matchTerms: item.screenName === SCREENS.WORKSPACE.PROFILE ? [itemText, policy.name] : [itemText],
                    sortText: policy.name,
                };
            });
        });
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
    const canAdministerDomain = (domain: OnyxTypes.Domain | null | undefined): domain is OnyxTypes.Domain =>
        !!domain?.accountID && !!domain.email && domain.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && isCurrentUserDomainAdmin(domain);

    return domains.filter(canAdministerDomain).flatMap((domain) => {
        const domainName = Str.extractEmailDomain(domain.email);
        const domainContext = getDomainContext(domainName);

        return getDomainMenuItems({domainAccountID: domain.accountID, icons}).map((item) => {
            const itemText = getItemText(item.translationKey);
            return {
                text: getDestinationText(itemText),
                singleIcon: item.icon,
                action: () => onSelect(item.route, domain.accountID),
                keyForList: `domain_${domain.accountID}_${item.screenName}`,
                rightElement: domainContext,
                matchTerms: [itemText, domainName],
            };
        });
    });
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
    const {convertToDisplayString} = useCurrencyListActions();
    const {isOffline} = useNetwork();
    const {isBetaEnabled} = usePermissions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(SEARCH_ROUTER_ICON_NAMES);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [lastSearchParams] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const [allDomains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);
    const createItems = useCreateNavigationSuggestions(query);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [policyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {typeMenuSections} = useSearchTypeMenuSections(undefined, shouldWatchForApprovals);
    const {accountMenuItemsData, generalMenuItemsData} = useSettingsNavigationMenuData();

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
        onSelect: (route, domainAccountID) => navigateToDomainRouteWithSidebarSync(route, domainAccountID, shouldUseNarrowLayout),
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

    return buildNavigationSuggestions(query, [topLevelItems, spendItems, workspaceItems, domainItems, accountItems, createItems], localeCompare);
}

export default useNavigationSuggestions;
export {buildTopLevelNavigationItems, buildSpendNavigationItems, buildWorkspaceNavigationItems, buildDomainNavigationItems, buildAccountNavigationItems};
