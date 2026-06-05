import type {OnyxCollection} from 'react-native-onyx';
import type {ExpensifyIconName} from '@components/Icon/ExpensifyIconLoader';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {SearchQueryItem} from '@components/Search/SearchList/ListItem/SearchQueryListItem';
import {isAnyHRConnected} from '@libs/HRUtils';
import {canEditWorkspaceSettings, canPolicyAccessFeature, hasAccountingFeatureConnection, isGroupPolicy, isTimeTrackingEnabled, shouldShowPolicy} from '@libs/PolicyUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import type {SearchKey, SearchTypeMenuItem, SearchTypeMenuSection} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type {PolicyFeatureName} from '@src/types/onyx/Policy';
import type IconAsset from '@src/types/utils/IconAsset';

/**
 * A static navigation target surfaced in the Cmd+K SearchRouter. Typing part of the page name (or
 * one of its `keywords`) shows a "Go to X" row that navigates straight to the page.
 *
 * To add a destination, append an entry to NAVIGATION_OPTIONS below:
 *   - titleKey:   translation key for the page name shown after "Go to " (e.g. 'common.profile')
 *   - icon:       ExpensifyIconName literal (so it can be lazy-loaded, see NAVIGATION_OPTION_ICONS)
 *   - getRoute:   returns the Route to navigate to when selected
 *   - keywords:   optional UNTRANSLATED synonyms to widen matching (e.g. 'logout' -> Security)
 *   - shouldShow: optional gate; return false to hide the entry
 *
 * Note: the Spend page tabs and per-workspace pages are NOT listed here. They are sourced from the
 * live Spend menu (INDEXED_SPEND_SEARCH_KEYS) and the workspace sidebar (WORKSPACE_PAGE_OPTIONS)
 * respectively, so their labels, queries and visibility always stay in sync.
 *
 * Intentionally excluded for now: per-domain pages (they require a domain account ID).
 */
type NavigationOption = {
    /** Translation key for the page name shown after "Go to " */
    titleKey: TranslationPaths;

    /** ExpensifyIconName literal (so it can be lazy-loaded) */
    icon: ExpensifyIconName;

    /** Returns the Route to navigate to when selected */
    getRoute: () => Route;

    /** Optional untranslated synonyms to widen matching (e.g. 'logout', 'password') */
    keywords?: string[];

    /** Optional gate; return false to hide the entry */
    shouldShow?: () => boolean;
};

/**
 * The top-level navigation tabs (the destinations the bottom/side tab bar links to). These are the
 * roots of the navigation hierarchy, so unlike the Account sub-pages and Spend tabs they carry no
 * parent-tab label on the right.
 */
const TOP_LEVEL_NAVIGATION_OPTIONS: NavigationOption[] = [
    {titleKey: 'common.home', icon: 'Home', getRoute: () => ROUTES.HOME, keywords: ['dashboard']},
    {titleKey: 'common.inbox', icon: 'Inbox', getRoute: () => ROUTES.INBOX, keywords: ['chat', 'chats', 'messages']},
    {titleKey: 'common.spend', icon: 'ReceiptMultiple', getRoute: () => ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery()}), keywords: ['expenses', 'search']},
    {titleKey: 'common.workspaces', icon: 'Buildings', getRoute: () => ROUTES.WORKSPACES_LIST.getRoute()},
    {titleKey: 'initialSettingsPage.account', icon: 'User', getRoute: () => ROUTES.SETTINGS, keywords: ['settings']},
];

const NAVIGATION_OPTIONS: NavigationOption[] = [
    // Account / Settings pages
    {titleKey: 'common.profile', icon: 'Profile', getRoute: () => ROUTES.SETTINGS_PROFILE.getRoute()},
    {titleKey: 'common.wallet', icon: 'Wallet', getRoute: () => ROUTES.SETTINGS_WALLET},
    {titleKey: 'common.preferences', icon: 'Gear', getRoute: () => ROUTES.SETTINGS_PREFERENCES},
    {titleKey: 'initialSettingsPage.security', icon: 'Lock', getRoute: () => ROUTES.SETTINGS_SECURITY, keywords: ['password', '2fa', 'logout', 'sign out']},
    {titleKey: 'allSettingsScreen.subscription', icon: 'CreditCard', getRoute: () => ROUTES.SETTINGS_SUBSCRIPTION.getRoute(), keywords: ['billing']},
    {titleKey: 'initialSettingsPage.about', icon: 'Info', getRoute: () => ROUTES.SETTINGS_ABOUT},
    {titleKey: 'initialSettingsPage.help', icon: 'QuestionMark', getRoute: () => ROUTES.SETTINGS_HELP},
    {titleKey: 'initialSettingsPage.aboutPage.troubleshoot', icon: 'Lightbulb', getRoute: () => ROUTES.SETTINGS_TROUBLESHOOT},
];

/**
 * Spend-page tabs to surface in the router, keyed by their search key. Add or remove keys here to
 * control which Spend tabs are reachable. Labels, icons, queries and per-policy visibility are all
 * sourced from the live Spend menu (useSearchTypeMenuSections), so a tab only appears if the user
 * can actually see it on the Spend page. 'export' (Awaiting export) is intentionally excluded.
 */
const INDEXED_SPEND_SEARCH_KEYS = new Set<SearchKey>([
    CONST.SEARCH.SEARCH_KEYS.EXPENSES,
    CONST.SEARCH.SEARCH_KEYS.REPORTS,
    CONST.SEARCH.SEARCH_KEYS.SUBMIT,
    CONST.SEARCH.SEARCH_KEYS.APPROVE,
    CONST.SEARCH.SEARCH_KEYS.PAY,
    CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CASH,
    CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CARD,
    CONST.SEARCH.SEARCH_KEYS.STATEMENTS,
    CONST.SEARCH.SEARCH_KEYS.RECONCILIATION,
    CONST.SEARCH.SEARCH_KEYS.SPEND_OVER_TIME,
    CONST.SEARCH.SEARCH_KEYS.TOP_SPENDERS,
    CONST.SEARCH.SEARCH_KEYS.TOP_CATEGORIES,
    CONST.SEARCH.SEARCH_KEYS.TOP_MERCHANTS,
]);

/**
 * A per-workspace page surfaced in the router (the workspace sidebar items). One row is produced
 * per workspace the user can see, gated by what that workspace actually has enabled.
 *
 * To add/remove a workspace page, edit WORKSPACE_PAGE_OPTIONS below:
 *   - titleKey:          translation key for the page name
 *   - icon:              ExpensifyIconName literal (kept in WORKSPACE_NAVIGATION_ICONS)
 *   - getRoute:          returns the Route given the workspace's policyID
 *   - requiresProtected: only show for group policies where the user can edit settings
 *   - feature:           required "More Features" flag (mirrors the workspace sidebar gating)
 *   - isAvailable:       extra gate (e.g. a beta)
 */
type WorkspacePageOption = {
    titleKey: TranslationPaths;
    icon: ExpensifyIconName;
    getRoute: (policyID: string) => Route;
    requiresProtected?: boolean;
    feature?: PolicyFeatureName;
    isAvailable?: (context: {isRoomsBetaEnabled: boolean}) => boolean;
};

const WORKSPACE_PAGE_OPTIONS: WorkspacePageOption[] = [
    {titleKey: 'workspace.common.profile', icon: 'Building', getRoute: (id) => ROUTES.WORKSPACE_OVERVIEW.getRoute(id)},
    {titleKey: 'workspace.common.members', icon: 'Users', getRoute: (id) => ROUTES.WORKSPACE_MEMBERS.getRoute(id)},
    {titleKey: 'workspace.common.rooms', icon: 'Hashtag', getRoute: (id) => ROUTES.WORKSPACE_ROOMS.getRoute(id), isAvailable: ({isRoomsBetaEnabled}) => isRoomsBetaEnabled},
    {titleKey: 'common.reports', icon: 'Document', getRoute: (id) => ROUTES.WORKSPACE_REPORTS.getRoute(id), requiresProtected: true},
    {
        titleKey: 'workspace.common.accounting',
        icon: 'Sync',
        getRoute: (id) => ROUTES.POLICY_ACCOUNTING.getRoute(id),
        requiresProtected: true,
        feature: CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED,
    },
    {titleKey: 'workspace.common.hr', icon: 'Users', getRoute: (id) => ROUTES.WORKSPACE_HR.getRoute(id), requiresProtected: true, feature: CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED},
    {
        titleKey: 'workspace.common.receiptPartners',
        icon: 'Receipt',
        getRoute: (id) => ROUTES.WORKSPACE_RECEIPT_PARTNERS.getRoute(id),
        requiresProtected: true,
        feature: CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED,
    },
    {
        titleKey: 'workspace.common.categories',
        icon: 'Folder',
        getRoute: (id) => ROUTES.WORKSPACE_CATEGORIES.getRoute(id),
        requiresProtected: true,
        feature: CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED,
    },
    {titleKey: 'workspace.common.tags', icon: 'Tag', getRoute: (id) => ROUTES.WORKSPACE_TAGS.getRoute(id), requiresProtected: true, feature: CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED},
    {
        titleKey: 'workspace.common.taxes',
        icon: 'Coins',
        getRoute: (id) => ROUTES.WORKSPACE_TAXES.getRoute(id),
        requiresProtected: true,
        feature: CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED,
    },
    {
        titleKey: 'workspace.common.workflows',
        icon: 'Workflows',
        getRoute: (id) => ROUTES.WORKSPACE_WORKFLOWS.getRoute(id),
        requiresProtected: true,
        feature: CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED,
    },
    {titleKey: 'workspace.common.rules', icon: 'Feed', getRoute: (id) => ROUTES.WORKSPACE_RULES.getRoute(id), requiresProtected: true, feature: CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED},
    {
        titleKey: 'workspace.common.distanceRates',
        icon: 'Car',
        getRoute: (id) => ROUTES.WORKSPACE_DISTANCE_RATES.getRoute(id),
        requiresProtected: true,
        feature: CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED,
    },
    {
        titleKey: 'workspace.common.travel',
        icon: 'LuggageWithLines',
        getRoute: (id) => ROUTES.WORKSPACE_TRAVEL.getRoute(id),
        requiresProtected: true,
        feature: CONST.POLICY.MORE_FEATURES.IS_TRAVEL_ENABLED,
    },
    {
        titleKey: 'workspace.common.expensifyCard',
        icon: 'ExpensifyCard',
        getRoute: (id) => ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(id),
        requiresProtected: true,
        feature: CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED,
    },
    {
        titleKey: 'workspace.common.companyCards',
        icon: 'CreditCard',
        getRoute: (id) => ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(id),
        requiresProtected: true,
        feature: CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED,
    },
    {
        titleKey: 'common.perDiem',
        icon: 'CalendarSolid',
        getRoute: (id) => ROUTES.WORKSPACE_PER_DIEM.getRoute(id),
        requiresProtected: true,
        feature: CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED,
    },
    {
        titleKey: 'iou.time',
        icon: 'Clock',
        getRoute: (id) => ROUTES.WORKSPACE_TIME_TRACKING.getRoute(id),
        requiresProtected: true,
        feature: CONST.POLICY.MORE_FEATURES.IS_TIME_TRACKING_ENABLED,
    },
    {
        titleKey: 'workspace.common.invoices',
        icon: 'InvoiceGeneric',
        getRoute: (id) => ROUTES.WORKSPACE_INVOICES.getRoute(id),
        requiresProtected: true,
        feature: CONST.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED,
    },
    {titleKey: 'workspace.common.moreFeatures', icon: 'Gear', getRoute: (id) => ROUTES.WORKSPACE_MORE_FEATURES.getRoute(id), requiresProtected: true},
];

/** Distinct icon names referenced by the static config, used to pre-resolve icons via the lazy icon hook. */
const NAVIGATION_OPTION_ICONS = Array.from(new Set(NAVIGATION_OPTIONS.map((option) => option.icon)));

/** Distinct icon names referenced by the top-level tabs, used to pre-resolve icons via the lazy icon hook. */
const TOP_LEVEL_NAVIGATION_ICONS = Array.from(new Set(TOP_LEVEL_NAVIGATION_OPTIONS.map((option) => option.icon)));

/** Distinct icon names referenced by the per-workspace pages, used to pre-resolve icons via the lazy icon hook. */
const WORKSPACE_NAVIGATION_ICONS = Array.from(new Set(WORKSPACE_PAGE_OPTIONS.map((option) => option.icon)));

/** Top-level tab icons shown on the right side of Account ('User') and Spend ('ReceiptMultiple') rows, pre-resolved via the lazy icon hook. */
const NAVIGATION_TAB_ICONS: ExpensifyIconName[] = ['User', 'ReceiptMultiple'];

/** Maximum number of navigation rows to surface so they don't crowd out the rest of the list. */
const MAX_NAVIGATION_RESULTS = 8;

/** The Spend menu items we index, flattened across sections and filtered by the allowlist. */
function getIndexedSpendMenuItems(typeMenuSections: SearchTypeMenuSection[]): SearchTypeMenuItem[] {
    return typeMenuSections.flatMap((section) => section.menuItems).filter((item) => INDEXED_SPEND_SEARCH_KEYS.has(item.key));
}

/** Icon names referenced by the indexed Spend tabs, for pre-resolving via the lazy icon hook. */
function getSpendNavigationIconNames(typeMenuSections: SearchTypeMenuSection[]): ExpensifyIconName[] {
    return getIndexedSpendMenuItems(typeMenuSections).map((item) => item.icon);
}

/** Replicates the workspace sidebar's feature gating (see WorkspaceInitialPage's policyFeatureStates). */
function getPolicyFeatureStates(policy: Policy): Partial<Record<PolicyFeatureName, boolean>> {
    return {
        [CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED]: policy.areDistanceRatesEnabled,
        [CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED]: policy.areWorkflowsEnabled,
        [CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED]: policy.areCategoriesEnabled,
        [CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED]: policy.areTagsEnabled,
        [CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED]: policy.tax?.trackingEnabled,
        [CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED]: policy.areCompanyCardsEnabled,
        [CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED]: !!policy.areConnectionsEnabled || hasAccountingFeatureConnection(policy),
        [CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED]: (policy.isHREnabled === true || isAnyHRConnected(policy)) && canPolicyAccessFeature(policy, CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED),
        [CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED]: policy.areExpensifyCardsEnabled,
        [CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED]: policy.areRulesEnabled,
        [CONST.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED]: policy.areInvoicesEnabled,
        [CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED]: policy.arePerDiemRatesEnabled && canPolicyAccessFeature(policy, CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED),
        [CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED]: policy.receiptPartners?.enabled ?? false,
        [CONST.POLICY.MORE_FEATURES.IS_TRAVEL_ENABLED]: policy.isTravelEnabled,
        [CONST.POLICY.MORE_FEATURES.IS_TIME_TRACKING_ENABLED]: isTimeTrackingEnabled(policy),
    };
}

/** Optional parent-tab decoration shown on the right side of a navigation row. */
type RightTabDecoration = {text: string; icon?: IconAsset};

/**
 * Builds the SearchRouter rows for a list of static navigation options, keeping only those whose
 * translated title or keywords match the typed query (case-insensitive substring). When `rightTab`
 * is supplied, each row shows that parent-tab label and icon on the right.
 */
function buildNavigationOptionRows(
    options: NavigationOption[],
    query: string,
    translate: LocaleContextProps['translate'],
    icons: Partial<Record<ExpensifyIconName, IconAsset>>,
    rightTab?: RightTabDecoration,
): SearchQueryItem[] {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
        return [];
    }

    return options
        .filter((option) => option.shouldShow?.() !== false)
        .map((option) => ({option, title: translate(option.titleKey)}))
        .filter(({option, title}) => [title, ...(option.keywords ?? [])].join(' ').toLowerCase().includes(normalizedQuery))
        .map(
            ({option, title}): SearchQueryItem => ({
                text: translate('search.goTo', {destination: title}),
                singleIcon: icons[option.icon],
                rightText: rightTab?.text,
                rightIcon: rightTab?.icon,
                keyForList: `${CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.NAVIGATE}-${option.titleKey}`,
                searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.NAVIGATE,
                route: option.getRoute(),
            }),
        );
}

/**
 * Returns the navigation rows for the top-level tabs (Home, Inbox, Spend, Workspaces, Account) that
 * match the typed query. These are the roots of the navigation hierarchy, so they carry no
 * parent-tab label on the right.
 */
function getTopLevelNavigationSearchOptions(query: string, translate: LocaleContextProps['translate'], icons: Partial<Record<ExpensifyIconName, IconAsset>>): SearchQueryItem[] {
    return buildNavigationOptionRows(TOP_LEVEL_NAVIGATION_OPTIONS, query, translate, icons);
}

/**
 * Returns the navigation rows for Account sub-pages that match the typed query, ready to render in
 * the SearchRouter list. Each row carries the Account tab label in `rightText` so the user can tell
 * which top-level tab the page lives under.
 */
function getNavigationSearchOptions(query: string, translate: LocaleContextProps['translate'], icons: Partial<Record<ExpensifyIconName, IconAsset>>): SearchQueryItem[] {
    return buildNavigationOptionRows(NAVIGATION_OPTIONS, query, translate, icons, {text: translate('initialSettingsPage.account'), icon: icons.User});
}

/**
 * Returns the navigation rows for the indexed Spend tabs that match the typed query. Each row opens
 * the Spend page with that tab's search query and carries the Spend tab label in `rightText` so the
 * user can tell which top-level tab the page lives under.
 */
function getSpendNavigationSearchOptions(
    query: string,
    translate: LocaleContextProps['translate'],
    typeMenuSections: SearchTypeMenuSection[],
    icons: Partial<Record<ExpensifyIconName, IconAsset>>,
): SearchQueryItem[] {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
        return [];
    }

    return getIndexedSpendMenuItems(typeMenuSections)
        .map((item) => ({item, title: translate(item.translationPath)}))
        .filter(({title}) => title.toLowerCase().includes(normalizedQuery))
        .map(
            ({item, title}): SearchQueryItem => ({
                text: translate('search.goTo', {destination: title}),
                singleIcon: icons[item.icon],
                rightText: translate('common.spend'),
                rightIcon: icons.ReceiptMultiple,
                keyForList: `${CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.NAVIGATE}-${item.key}`,
                searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.NAVIGATE,
                route: ROUTES.SEARCH_ROOT.getRoute({query: item.searchQuery}),
            }),
        );
}

type WorkspaceNavigationParams = {
    policies: OnyxCollection<Policy>;
    currentUserEmail: string | undefined;
    isRoomsBetaEnabled: boolean;
};

/**
 * Returns the navigation rows for per-workspace sidebar pages that match the typed query. One row is
 * produced per visible workspace and enabled page; the workspace name is carried in `rightText` so
 * the user can tell which workspace each row refers to.
 */
function getWorkspaceNavigationSearchOptions(
    query: string,
    translate: LocaleContextProps['translate'],
    {policies, currentUserEmail, isRoomsBetaEnabled}: WorkspaceNavigationParams,
    icons: Partial<Record<ExpensifyIconName, IconAsset>>,
): SearchQueryItem[] {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
        return [];
    }

    const rows: SearchQueryItem[] = [];
    for (const policy of Object.values(policies ?? {})) {
        if (!policy || !shouldShowPolicy(policy, true, currentUserEmail)) {
            continue;
        }

        const featureStates = getPolicyFeatureStates(policy);
        const canEditSettings = isGroupPolicy(policy) && canEditWorkspaceSettings(policy, currentUserEmail);
        const workspaceAvatar = {
            source: policy.avatarURL ? policy.avatarURL : getDefaultWorkspaceAvatar(policy.name),
            name: policy.name,
            id: policy.id,
        };

        for (const option of WORKSPACE_PAGE_OPTIONS) {
            if (option.requiresProtected && !canEditSettings) {
                continue;
            }
            if (option.feature && !featureStates[option.feature]) {
                continue;
            }
            if (option.isAvailable && !option.isAvailable({isRoomsBetaEnabled})) {
                continue;
            }

            const title = translate(option.titleKey);
            if (!title.toLowerCase().includes(normalizedQuery)) {
                continue;
            }

            rows.push({
                text: translate('search.goTo', {destination: title}),
                singleIcon: icons[option.icon],
                rightText: policy.name,
                rightAvatar: workspaceAvatar,
                keyForList: `${CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.NAVIGATE}-ws-${policy.id}-${option.titleKey}`,
                searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.NAVIGATE,
                route: option.getRoute(policy.id),
            });
        }
    }

    return rows;
}

export default NAVIGATION_OPTIONS;
export {
    NAVIGATION_OPTION_ICONS,
    WORKSPACE_NAVIGATION_ICONS,
    NAVIGATION_TAB_ICONS,
    TOP_LEVEL_NAVIGATION_ICONS,
    MAX_NAVIGATION_RESULTS,
    getTopLevelNavigationSearchOptions,
    getNavigationSearchOptions,
    getSpendNavigationSearchOptions,
    getSpendNavigationIconNames,
    getWorkspaceNavigationSearchOptions,
};
export type {NavigationOption, WorkspacePageOption};
