import Avatar from '@components/Avatar';
import Icon from '@components/Icon';
import type {IconProps} from '@components/Icon';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {SearchQueryItem} from '@components/Search/SearchList/ListItem/SearchQueryListItem';
import Text from '@components/Text';

import useCreateReport from '@hooks/useCreateReport';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {isConnectionInProgress} from '@libs/actions/connections';
import {startDistanceRequest, startMoneyRequest} from '@libs/actions/IOU/MoneyRequest';
import {createNewReport, startNewChat} from '@libs/actions/Report';
import getIconForAction from '@libs/getIconForAction';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import getCreateReportRoute, {getReportsRootRoute, navigateToCreateReportWorkspaceSelection} from '@libs/Navigation/helpers/getCreateReportRoute';
import Navigation from '@libs/Navigation/Navigation';
import {openTravelDotLink} from '@libs/openTravelDotLink';
import Permissions from '@libs/Permissions';
import {
    canSendInvoice as canSendInvoicePolicyUtils,
    getDefaultChatEnabledPolicy,
    getGroupPoliciesWhereReportCanBeCreated,
    // eslint-disable-next-line no-restricted-imports -- This mirrors the existing Book travel quick-create readiness check, which is billing/paid-policy specific.
    isPaidGroupPolicy,
    isWorkspaceProvisionedForTravel,
    shouldShowPolicy,
} from '@libs/PolicyUtils';
import {generateReportID, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {buildCannedSearchQuery, buildSearchQueryString} from '@libs/SearchQueryUtils';
import StringUtils from '@libs/StringUtils';

import isOnSearchMoneyRequestReportPage from '@navigation/helpers/isOnSearchMoneyRequestReportPage';

import useInitialSettingsPageMenuData from '@pages/settings/useInitialSettingsPageMenuData';
import getWorkspaceMenuItems from '@pages/workspace/getWorkspaceMenuItems';

import {clearLastSearchParams} from '@userActions/ReportNavigation';
import {setSearchContext} from '@userActions/Search';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {primaryLoginSelector} from '@src/selectors/Account';
import {isAdminSelector} from '@src/selectors/Domain';
import {emailSelector, sessionEmailAndAccountIDSelector} from '@src/selectors/Session';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {Str} from 'expensify-common';
import React, {useMemo} from 'react';
import {View} from 'react-native';

import navigateToWorkspaceSettingsRoute from './navigateToWorkspaceSettingsRoute';

type RightSideContextProps = {
    label: string;
    icon: IconProps['src'];
};

function RightSideContext({label, icon}: RightSideContextProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
            <Icon
                src={icon}
                fill={theme.icon}
                small
            />
            <Text style={styles.textLabelSupporting}>{label}</Text>
        </View>
    );
}

type WorkspaceContextProps = {
    policy: OnyxTypes.Policy;
};

const MAX_NAVIGATION_SUGGESTIONS = 8;
const MIN_NAVIGATION_QUERY_LENGTH = 3;
const EXCLUDED_SETTINGS_ITEMS = new Set<string>(['initialSettingsPage.whatIsNew', 'sidebarScreen.saveTheWorld', 'initialSettingsPage.signOut', 'initialSettingsPage.restoreStashed']);
const ACCOUNT_NAVIGATION_KEYWORDS = new Map<TranslationPaths, string[]>([['initialSettingsPage.security', ['password', '2fa', 'two factor', 'two-factor']]]);

type NavigationSuggestionSourceItem = SearchQueryItem & {
    action?: () => void;
    matchTerms?: string[];
};

function WorkspaceContext({policy}: WorkspaceContextProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
            <Avatar
                source={policy.avatarURL}
                type={CONST.ICON_TYPE_WORKSPACE}
                name={policy.name}
                avatarID={policy.id}
                size={CONST.AVATAR_SIZE.SMALL}
            />
            <Text style={styles.textLabelSupporting}>{policy.name}</Text>
        </View>
    );
}

function stripNavigationIntentPrefix(query: string) {
    const trimmedQuery = query.trim();
    if (/^go to\s+/i.test(trimmedQuery)) {
        return trimmedQuery.replace(/^go to\s+/i, '').trim();
    }
    if (/^go\s+/i.test(trimmedQuery)) {
        return trimmedQuery.replace(/^go\s+/i, '').trim();
    }
    return trimmedQuery;
}

function isNavigationIntentOnlyQuery(query: string) {
    return /^go(?:\s+to)?$/i.test(query.trim());
}

function matchesNavigationQuery(query: string, ...values: Array<string | undefined>) {
    const normalizedQuery = StringUtils.normalizeAccents(query).toLowerCase();
    if (!normalizedQuery) {
        return false;
    }

    return values.some((value) =>
        StringUtils.normalizeAccents(value ?? '')
            .toLowerCase()
            .includes(normalizedQuery),
    );
}

function getGoToText(translate: LocaleContextProps['translate'], destination: string) {
    return translate('search.goTo', {destination});
}

function sortNavigationSuggestionItems<T extends NavigationSuggestionSourceItem>(items: T[], localeCompare: LocaleContextProps['localeCompare']): T[] {
    return [...items].sort((firstItem, secondItem) => {
        const firstText = StringUtils.normalizeAccents(firstItem.text ?? '').toLowerCase();
        const secondText = StringUtils.normalizeAccents(secondItem.text ?? '').toLowerCase();
        const textComparison = localeCompare(firstText, secondText);
        if (textComparison !== 0) {
            return textComparison;
        }

        return localeCompare(firstItem.keyForList ?? '', secondItem.keyForList ?? '');
    });
}

function replaceTopmostModalWithAction(action: () => void) {
    if (!Navigation.isTopmostRouteModalScreen()) {
        action();
        return;
    }

    Navigation.dismissModal({afterTransition: action});
}

function useNavigationSuggestions(query: string): SearchQueryItem[] {
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {convertToDisplayString} = useCurrencyListActions();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {accountMenuItemsData, generalMenuItemsData} = useInitialSettingsPageMenuData(currentUserPersonalDetails);
    const {typeMenuSections} = useSearchTypeMenuSections();
    const {isBetaEnabled} = usePermissions();
    const {isOffline} = useNetwork();
    const {isRestrictedPolicyCreation} = usePreferredPolicy();

    const icons = useMemoizedLazyExpensifyIcons([
        'Home',
        'Inbox',
        'Basket',
        'ReceiptMultiple',
        'Buildings',
        'UserLock',
        'UserShield',
        'Gear',
        'Profile',
        'Wallet',
        'Bolt',
        'Users',
        'Lock',
        'Bot',
        'CreditCard',
        'MoneyBag',
        'MoneyHourglass',
        'CreditCardHourglass',
        'Bank',
        'User',
        'QuestionMark',
        'Info',
        'Lightbulb',
        'Building',
        'Hashtag',
        'Document',
        'Sync',
        'Receipt',
        'Folder',
        'Tag',
        'Coins',
        'Workflows',
        'Feed',
        'Car',
        'LuggageWithLines',
        'ExpensifyCard',
        'CalendarSolid',
        'Clock',
        'InvoiceGeneric',
        'Location',
        'ChatBubble',
        'Suitcase',
        'NewWorkspace',
        'Pencil',
        'ThumbsUp',
        'CheckCircle',
        'Cash',
        'Transfer',
        'MoneyCircle',
    ]);

    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allDomains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);
    const [policyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const [connectionSyncProgress] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
        selector: validTransactionDraftIDsSelector,
    });
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`);
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const [session] = useOnyx(ONYXKEYS.SESSION, {
        selector: sessionEmailAndAccountIDSelector,
    });
    const [primaryLogin] = useOnyx(ONYXKEYS.ACCOUNT, {
        selector: primaryLoginSelector,
    });
    const [allBetas] = useOnyx(ONYXKEYS.BETAS);
    const [lastSearchParams] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const [cardFeedErrors] = useOnyx(ONYXKEYS.DERIVED.CARD_FEED_ERRORS);
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE);
    const currentUserLogin = currentUserPersonalDetails.login ?? sessionEmail ?? '';
    const activePolicyEntry = Array.isArray(activePolicy) ? undefined : activePolicy;
    const reportID = useMemo(() => generateReportID(), []);

    const spendContext = useMemo(
        () => (
            <RightSideContext
                label={translate('common.spend')}
                icon={icons.ReceiptMultiple}
            />
        ),
        [icons.ReceiptMultiple, translate],
    );
    const accountContext = useMemo(
        () => (
            <RightSideContext
                label={translate('initialSettingsPage.account')}
                icon={icons.Gear}
            />
        ),
        [icons.Gear, translate],
    );

    const defaultSpendQuery = buildCannedSearchQuery({
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    });
    const lastSpendQuery = lastSearchParams?.queryJSON ? buildSearchQueryString(lastSearchParams.queryJSON) : undefined;
    const spendRoute = ROUTES.SEARCH_ROOT.getRoute({
        query: lastSpendQuery ?? defaultSpendQuery,
    });

    const topLevelItems = useMemo(() => {
        const homeText = translate('common.home');
        const inboxText = translate('common.inbox');
        const spendText = translate('common.spend');
        const workspacesText = translate('common.workspacesTabTitle');
        const domainsText = translate('common.domains');
        const accountText = translate('initialSettingsPage.account');

        return [
            {
                text: getGoToText(translate, homeText),
                singleIcon: icons.Home,
                action: () => Navigation.navigate(ROUTES.HOME),
                keyForList: 'topLevelHome',
                matchTerms: [homeText],
            },
            {
                text: getGoToText(translate, inboxText),
                singleIcon: icons.Inbox,
                action: () => Navigation.navigate(ROUTES.INBOX),
                keyForList: 'topLevelInbox',
                matchTerms: [inboxText],
            },
            {
                text: getGoToText(translate, spendText),
                singleIcon: icons.ReceiptMultiple,
                action: () => Navigation.navigate(spendRoute),
                keyForList: 'topLevelSpend',
                matchTerms: [spendText],
            },
            {
                text: getGoToText(translate, workspacesText),
                singleIcon: icons.Buildings,
                action: () => Navigation.navigate(ROUTES.WORKSPACES_LIST.route),
                keyForList: 'topLevelWorkspaces',
                matchTerms: [workspacesText],
            },
            {
                text: getGoToText(translate, domainsText),
                singleIcon: icons.Buildings,
                action: () => Navigation.navigate(ROUTES.DOMAINS_LIST.route),
                keyForList: 'topLevelDomains',
                matchTerms: [domainsText],
            },
            {
                text: getGoToText(translate, accountText),
                singleIcon: icons.Gear,
                action: () => Navigation.navigate(ROUTES.SETTINGS),
                keyForList: 'topLevelAccount',
                matchTerms: [accountText],
            },
        ];
    }, [icons.Buildings, icons.Gear, icons.Home, icons.Inbox, icons.ReceiptMultiple, spendRoute, translate]);

    const spendItems = useMemo(
        () =>
            typeMenuSections
                .filter((section) => section.translationPath !== 'search.savedSearchesMenuItemTitle')
                .flatMap((section) =>
                    section.menuItems.map((item) => {
                        const itemText = translate(item.translationPath);
                        return {
                            text: getGoToText(translate, itemText),
                            singleIcon: typeof item.icon === 'string' ? icons[item.icon] : item.icon,
                            action: () => {
                                setSearchContext(false);
                                Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: item.searchQuery}));
                            },
                            keyForList: `spend_${item.key}`,
                            rightElement: spendContext,
                            matchTerms: [itemText],
                        };
                    }),
                ),
        [icons, spendContext, translate, typeMenuSections],
    );

    const accountItems = useMemo(
        () =>
            [...accountMenuItemsData.items, ...generalMenuItemsData.items]
                .filter((item) => !EXCLUDED_SETTINGS_ITEMS.has(item.translationKey))
                .map((item) => {
                    const itemText = translate(item.translationKey);
                    return {
                        text: getGoToText(translate, itemText),
                        singleIcon: item.icon,
                        action: item.action,
                        keyForList: `account_${item.translationKey}`,
                        rightElement: accountContext,
                        matchTerms: [itemText, ...(ACCOUNT_NAVIGATION_KEYWORDS.get(item.translationKey) ?? [])],
                    };
                }),
        [accountContext, accountMenuItemsData.items, generalMenuItemsData.items, translate],
    );

    const workspaceItems = useMemo(() => {
        const accessiblePolicies = Object.values(allPolicies ?? {}).filter((policy): policy is OnyxTypes.Policy => !!policy?.id && shouldShowPolicy(policy, isOffline, currentUserLogin));

        return accessiblePolicies.flatMap((policy) => {
            const items = getWorkspaceMenuItems({
                policy,
                policyID: policy.id,
                currentUserLogin,
                icons: {
                    Building: icons.Building,
                    Users: icons.Users,
                    Hashtag: icons.Hashtag,
                    Document: icons.Document,
                    Sync: icons.Sync,
                    Receipt: icons.Receipt,
                    Folder: icons.Folder,
                    Tag: icons.Tag,
                    Coins: icons.Coins,
                    Workflows: icons.Workflows,
                    Feed: icons.Feed,
                    Car: icons.Car,
                    LuggageWithLines: icons.LuggageWithLines,
                    ExpensifyCard: icons.ExpensifyCard,
                    CreditCard: icons.CreditCard,
                    CalendarSolid: icons.CalendarSolid,
                    Clock: icons.Clock,
                    InvoiceGeneric: icons.InvoiceGeneric,
                    Gear: icons.Gear,
                    Bolt: icons.Bolt,
                },
                isRoomsPageBetaEnabled: isBetaEnabled(CONST.BETAS.WORKSPACE_ROOMS_PAGE),
                isRulesRevampBetaEnabled: isBetaEnabled(CONST.BETAS.RULES_REVAMP),
                isConnectionInProgress: isConnectionInProgress(connectionSyncProgress?.[`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policy.id}`], policy),
                policyCategories: policyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`],
                shouldShowEnterCredentialsError: !!policy.receiptPartners?.uber?.error,
                shouldShowRBR: !!cardFeedErrors?.shouldShowRbrForWorkspaceAccountID?.[policy.policyAccountID ?? CONST.DEFAULT_NUMBER_ID],
                convertToDisplayString,
            });

            return items.map((item) => {
                const itemText = translate(item.translationKey);
                return {
                    text: getGoToText(translate, itemText),
                    singleIcon: item.icon,
                    action: () => navigateToWorkspaceSettingsRoute(item.route, policy.id, shouldUseNarrowLayout),
                    keyForList: `workspace_${policy.id}_${item.screenName}`,
                    rightElement: <WorkspaceContext policy={policy} />,
                    matchTerms: item.screenName === SCREENS.WORKSPACE.PROFILE ? [itemText, policy.name] : [itemText],
                };
            });
        });
    }, [
        allPolicies,
        cardFeedErrors?.shouldShowRbrForWorkspaceAccountID,
        connectionSyncProgress,
        convertToDisplayString,
        currentUserLogin,
        icons,
        isBetaEnabled,
        isOffline,
        policyCategories,
        shouldUseNarrowLayout,
        translate,
    ]);

    const domainItems = useMemo(() => {
        const domainMenuItems = [
            {
                translationKey: 'domain.domainMembers' as const,
                icon: icons.User,
                getRoute: ROUTES.DOMAIN_MEMBERS.getRoute,
                key: 'members',
            },
            {
                translationKey: 'domain.domainAdmins' as const,
                icon: icons.UserShield,
                getRoute: ROUTES.DOMAIN_ADMINS.getRoute,
                key: 'admins',
            },
            {
                translationKey: 'domain.groups.title' as const,
                icon: icons.Users,
                getRoute: ROUTES.DOMAIN_GROUPS.getRoute,
                key: 'groups',
            },
            {
                translationKey: 'domain.saml' as const,
                icon: icons.UserLock,
                getRoute: ROUTES.DOMAIN_SAML.getRoute,
                key: 'saml',
            },
        ];

        return Object.values(allDomains ?? {})
            .filter((domain): domain is OnyxTypes.Domain => !!domain?.accountID && !!domain.email && isAdminSelector(currentUserPersonalDetails.accountID)(domain))
            .flatMap((domain) => {
                const domainName = Str.extractEmailDomain(domain.email);
                const domainContext = (
                    <RightSideContext
                        label={domainName}
                        icon={icons.Buildings}
                    />
                );

                return domainMenuItems.map((item) => {
                    const itemText = translate(item.translationKey);
                    return {
                        text: getGoToText(translate, itemText),
                        singleIcon: item.icon,
                        action: () => Navigation.navigate(item.getRoute(domain.accountID)),
                        keyForList: `domain_${domain.accountID}_${item.key}`,
                        rightElement: domainContext,
                        matchTerms: [itemText, domainName],
                    };
                });
            });
    }, [allDomains, currentUserPersonalDetails.accountID, icons.Buildings, icons.User, icons.UserLock, icons.Users, icons.UserShield, translate]);

    const allPoliciesCollection = (allPolicies ?? {}) as OnyxCollection<OnyxTypes.Policy>;
    const groupPoliciesWithChatEnabled = [...getGroupPoliciesWhereReportCanBeCreated(allPoliciesCollection, isBetaEnabled(CONST.BETAS.SUBMIT_2026))];
    const defaultChatEnabledPolicy = getDefaultChatEnabledPolicy(groupPoliciesWithChatEnabled, activePolicyEntry);
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
    const {createReport, isVisible: isCreateReportVisible} = useCreateReport({
        onCreateReport: (shouldDismissEmptyReportsConfirmation?: boolean) => {
            if (!defaultChatEnabledPolicy?.id) {
                return;
            }

            const isReportInSearch = isOnSearchMoneyRequestReportPage();
            if (isReportInSearch) {
                clearLastSearchParams();
            }

            const {reportID: createdReportID} = createNewReport(
                currentUserPersonalDetails,
                hasViolations,
                isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
                defaultChatEnabledPolicy,
                allBetas,
                false,
                shouldDismissEmptyReportsConfirmation,
            );
            Navigation.navigate(getReportsRootRoute(), {
                forceReplace: isReportInSearch,
            });
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                Navigation.navigate(getCreateReportRoute({reportID: createdReportID}), {forceReplace: isReportInSearch});
            });
        },
        groupPoliciesWithChatEnabled,
        onNavigateToWorkspaceSelection: () =>
            navigateToCreateReportWorkspaceSelection({
                forceReplace: isOnSearchMoneyRequestReportPage(),
            }),
        shouldHandleNavigationBack: false,
    });

    const canSendInvoice = canSendInvoicePolicyUtils(allPoliciesCollection, sessionEmail);
    const travelEnabledPolicy = useMemo(() => Object.values(allPoliciesCollection ?? {}).find((policy) => !!policy?.isTravelEnabled), [allPoliciesCollection]);
    const isTravelVisible = !!travelEnabledPolicy;
    const isBlockedFromSpotnanaTravel = Permissions.isBetaEnabled(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL, allBetas);
    const primaryContactMethod = primaryLogin ?? sessionEmail ?? '';
    const [travelSettings] = useOnyx(ONYXKEYS.NVP_TRAVEL_SETTINGS);
    const shouldOpenTravelDirectly =
        !isBlockedFromSpotnanaTravel &&
        !!primaryContactMethod &&
        !Str.isSMSLogin(primaryContactMethod) &&
        isPaidGroupPolicy(travelEnabledPolicy) &&
        (travelEnabledPolicy?.travelSettings?.hasAcceptedTerms ?? (travelSettings?.hasAcceptedTerms && isWorkspaceProvisionedForTravel(travelEnabledPolicy?.travelSettings)));

    const shouldShowNewWorkspaceButton = !isRestrictedPolicyCreation && Object.values(allPoliciesCollection ?? {}).every((policy) => !shouldShowPolicy(policy, !!isOffline, sessionEmail));

    const createItems = useMemo(
        () =>
            [
                {
                    visible: true,
                    text: translate('iou.createExpense'),
                    icon: getIconForAction(CONST.IOU.TYPE.CREATE, icons),
                    action: () =>
                        replaceTopmostModalWithAction(() => {
                            interceptAnonymousUser(() => {
                                startMoneyRequest(CONST.IOU.TYPE.CREATE, reportID, draftTransactionIDs, undefined, undefined, undefined, true);
                            });
                        }),
                    keyForList: 'create_expense',
                },
                {
                    visible: true,
                    text: translate('iou.trackDistance'),
                    icon: icons.Location,
                    action: () =>
                        replaceTopmostModalWithAction(() => {
                            interceptAnonymousUser(() => {
                                startDistanceRequest(CONST.IOU.TYPE.CREATE, reportID, draftTransactionIDs, lastDistanceExpenseType, undefined, undefined, true);
                            });
                        }),
                    keyForList: 'create_trackDistance',
                },
                {
                    visible: isCreateReportVisible,
                    text: translate('report.newReport.createReport'),
                    icon: icons.Document,
                    action: () => replaceTopmostModalWithAction(createReport),
                    keyForList: 'create_report',
                },
                {
                    visible: true,
                    text: translate('sidebarScreen.fabNewChat'),
                    icon: icons.ChatBubble,
                    action: () => replaceTopmostModalWithAction(() => interceptAnonymousUser(startNewChat)),
                    keyForList: 'create_chat',
                },
                {
                    visible: canSendInvoice,
                    text: translate('workspace.invoices.sendInvoice'),
                    icon: icons.InvoiceGeneric,
                    action: () =>
                        replaceTopmostModalWithAction(() => {
                            interceptAnonymousUser(() => {
                                startMoneyRequest(CONST.IOU.TYPE.INVOICE, reportID, draftTransactionIDs, undefined, undefined, undefined, true);
                            });
                        }),
                    keyForList: 'create_invoice',
                },
                {
                    visible: isTravelVisible,
                    text: translate('travel.bookTravel'),
                    icon: icons.Suitcase,
                    action: () =>
                        replaceTopmostModalWithAction(() => {
                            interceptAnonymousUser(() => {
                                if (shouldOpenTravelDirectly) {
                                    openTravelDotLink(travelEnabledPolicy?.id);
                                    return;
                                }
                                Navigation.navigate(ROUTES.TRAVEL_MY_TRIPS.getRoute(travelEnabledPolicy?.id));
                            });
                        }),
                    keyForList: 'create_travel',
                },
                {
                    visible: shouldShowNewWorkspaceButton,
                    text: translate('workspace.new.newWorkspace'),
                    icon: icons.NewWorkspace,
                    action: () =>
                        replaceTopmostModalWithAction(() => {
                            interceptAnonymousUser(() => {
                                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_CONFIRMATION.path));
                            });
                        }),
                    keyForList: 'create_workspace',
                },
            ]
                .filter((item) => item.visible)
                .map((item) => ({
                    text: item.text,
                    singleIcon: item.icon,
                    action: item.action,
                    keyForList: item.keyForList,
                    matchTerms: [item.text],
                })),
        [
            canSendInvoice,
            createReport,
            draftTransactionIDs,
            icons,
            isCreateReportVisible,
            isTravelVisible,
            lastDistanceExpenseType,
            reportID,
            shouldOpenTravelDirectly,
            shouldShowNewWorkspaceButton,
            translate,
            travelEnabledPolicy?.id,
        ],
    );

    return useMemo(() => {
        const trimmedQuery = query.trim();
        const isNavigationIntentOnly = isNavigationIntentOnlyQuery(trimmedQuery);
        const matchQuery = stripNavigationIntentPrefix(trimmedQuery) || trimmedQuery;
        const isAllowedShortQuery = /^hr$/i.test(matchQuery);
        if (trimmedQuery.length < MIN_NAVIGATION_QUERY_LENGTH && !isNavigationIntentOnly && !isAllowedShortQuery) {
            return [];
        }

        const buildItem = (item: NavigationSuggestionSourceItem): SearchQueryItem | null => {
            if (!isNavigationIntentOnly && !matchesNavigationQuery(matchQuery, item.text, ...(item.matchTerms ?? []))) {
                return null;
            }

            return {
                ...item,
                searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.NAVIGATE,
            };
        };

        return [
            ...sortNavigationSuggestionItems(topLevelItems, localeCompare),
            ...sortNavigationSuggestionItems(spendItems, localeCompare),
            ...sortNavigationSuggestionItems(accountItems, localeCompare),
            ...sortNavigationSuggestionItems(workspaceItems, localeCompare),
            ...sortNavigationSuggestionItems(domainItems, localeCompare),
            ...sortNavigationSuggestionItems(createItems, localeCompare),
        ]
            .map(buildItem)
            .filter((item): item is SearchQueryItem => !!item)
            .slice(0, MAX_NAVIGATION_SUGGESTIONS);
    }, [accountItems, createItems, domainItems, localeCompare, query, spendItems, topLevelItems, workspaceItems]);
}

export default useNavigationSuggestions;
