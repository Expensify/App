import {Str} from 'expensify-common';
import {useCallback, useState} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {SearchQueryItem} from '@components/Search/SearchList/ListItem/SearchQueryListItem';
import useCreateReport from '@hooks/useCreateReport';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMappedPolicies from '@hooks/useMappedPolicies';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import {startDistanceRequest, startMoneyRequest} from '@libs/actions/IOU/MoneyRequest';
import {createNewReport, startNewChat} from '@libs/actions/Report';
import getIconForAction from '@libs/getIconForAction';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import getCreateReportRoute, {getReportsRootRoute, navigateToCreateReportWorkspaceSelection} from '@libs/Navigation/helpers/getCreateReportRoute';
import isOnSearchMoneyRequestReportPage from '@libs/Navigation/helpers/isOnSearchMoneyRequestReportPage';
import Navigation from '@libs/Navigation/Navigation';
import {openTravelDotLink, shouldOpenTravelDotLinkWeb} from '@libs/openTravelDotLink';
import Permissions from '@libs/Permissions';
import {canSendInvoice as canSendInvoicePolicyUtils, getDefaultChatEnabledPolicy, isPaidGroupPolicy, shouldShowPolicy} from '@libs/PolicyUtils';
import {generateReportID, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {clearLastSearchParams} from '@userActions/ReportNavigation';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {primaryLoginSelector} from '@src/selectors/Account';
import {groupPaidPoliciesWithExpenseChatEnabledSelector, policyMapper} from '@src/selectors/Policy';
import {emailSelector, sessionEmailAndAccountIDSelector} from '@src/selectors/Session';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';
import type * as OnyxTypes from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';

/** A create-menu action surfaced in the router, mirroring one item of the FAB popover menu. */
type CreateMenuSearchOption = {
    /** Stable identifier (one of CONST.FAB_MENU_ITEM_IDS) used to build the row key */
    id: string;

    /** Translation key for the action label shown after "Go to " */
    titleKey: TranslationPaths;

    /** The resolved icon shown on the left of the row */
    icon: IconAsset | undefined;

    /** Whether the theme fill color should be applied to the icon (false for multi-colored assets) */
    shouldIconApplyFill?: boolean;

    /** Untranslated synonyms to widen matching (e.g. 'mileage' -> Track distance) */
    keywords?: string[];

    /** Whether the user can currently perform this action (mirrors the FAB item's gating) */
    isVisible: boolean;

    /** The action to run when the row is selected */
    onSelect: () => void;
};

/**
 * Surfaces the create-menu actions (the FAB popover menu) in the Cmd+K SearchRouter, so typing e.g.
 * "expense" or "invoice" shows a row that opens that create flow. Unlike the navigation rows, these
 * are labeled with the action itself (e.g. "Create expense") rather than "Go to X", and carry no
 * parent-tab label on the right. Mirrors {@link FloatingActionButtonAndPopover}'s items and their
 * gating, except the contextual Quick action item, which is intentionally excluded. Returns a query
 * filter that yields ready-to-render rows.
 */
function useCreateMenuSearchOptions(): (query: string) => SearchQueryItem[] {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Coins', 'Receipt', 'Cash', 'Transfer', 'MoneyCircle', 'Location', 'Document', 'ChatBubble', 'InvoiceGeneric', 'Suitcase', 'NewWorkspace']);

    const [reportID] = useState(() => generateReportID());

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: sessionEmailAndAccountIDSelector});
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const [allBetas] = useOnyx(ONYXKEYS.BETAS);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`);
    const [travelSettings] = useOnyx(ONYXKEYS.NVP_TRAVEL_SETTINGS);
    const [primaryLogin] = useOnyx(ONYXKEYS.ACCOUNT, {selector: primaryLoginSelector});
    const [isLoadingApp = false] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [allMappedPolicies] = useMappedPolicies(policyMapper);
    const {isOffline} = useNetwork();
    const {isRestrictedPolicyCreation} = usePreferredPolicy();

    const groupPoliciesWithChatEnabledSelector = useCallback(
        (policies: OnyxCollection<OnyxTypes.Policy>) => groupPaidPoliciesWithExpenseChatEnabledSelector(policies, session?.email),
        [session?.email],
    );
    const [groupPoliciesWithChatEnabled = CONST.EMPTY_ARRAY] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: groupPoliciesWithChatEnabledSelector}, [session?.email]);
    const defaultChatEnabledPolicy = getDefaultChatEnabledPolicy(groupPoliciesWithChatEnabled as Array<OnyxEntry<OnyxTypes.Policy>>, activePolicy);

    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
    const isReportInSearch = isOnSearchMoneyRequestReportPage();

    const handleCreateWorkspaceReport = useCallback(
        (shouldDismissEmptyReportsConfirmation?: boolean) => {
            if (!defaultChatEnabledPolicy?.id) {
                return;
            }

            if (isReportInSearch) {
                clearLastSearchParams();
            }

            const {reportID: createdReportID} = createNewReport(
                currentUserPersonalDetails,
                hasViolations,
                isASAPSubmitBetaEnabled,
                defaultChatEnabledPolicy,
                allBetas,
                false,
                shouldDismissEmptyReportsConfirmation,
            );
            Navigation.navigate(getReportsRootRoute(), {forceReplace: isReportInSearch});
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                Navigation.navigate(getCreateReportRoute({reportID: createdReportID}), {forceReplace: isReportInSearch});
            });
        },
        [allBetas, currentUserPersonalDetails, defaultChatEnabledPolicy, hasViolations, isASAPSubmitBetaEnabled, isReportInSearch],
    );

    const {createReport, isVisible: isCreateReportVisible} = useCreateReport({
        onCreateReport: handleCreateWorkspaceReport,
        groupPoliciesWithChatEnabled,
        onNavigateToWorkspaceSelection: () => navigateToCreateReportWorkspaceSelection({forceReplace: isReportInSearch}),
        shouldHandleNavigationBack: false,
    });

    // Invoice gating mirrors InvoiceMenuItem.
    const canSendInvoice = canSendInvoicePolicyUtils(allMappedPolicies as OnyxCollection<OnyxTypes.Policy>, sessionEmail);

    // Travel gating mirrors TravelMenuItem.
    const isTravelVisible = !!activePolicy?.isTravelEnabled;
    const isBlockedFromSpotnanaTravel = Permissions.isBetaEnabled(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL, allBetas);
    const primaryContactMethod = primaryLogin ?? sessionEmail ?? '';
    const isPolicyProvisioned = activePolicy?.travelSettings?.spotnanaCompanyID ?? activePolicy?.travelSettings?.associatedTravelDomainAccountID;
    const isTravelEnabled =
        !isBlockedFromSpotnanaTravel &&
        !!primaryContactMethod &&
        !Str.isSMSLogin(primaryContactMethod) &&
        isPaidGroupPolicy(activePolicy) &&
        (activePolicy?.travelSettings?.hasAcceptedTerms ?? (travelSettings?.hasAcceptedTerms && isPolicyProvisioned));

    // New workspace gating mirrors NewWorkspaceMenuItem.
    const shouldShowNewWorkspaceButton =
        !isRestrictedPolicyCreation && Object.values(allMappedPolicies ?? {}).every((policy) => !shouldShowPolicy(policy as OnyxEntry<OnyxTypes.Policy>, !!isOffline, sessionEmail));
    const isNewWorkspaceVisible = !isLoadingApp && shouldShowNewWorkspaceButton;

    const getCreateMenuSearchOptions = useCallback(
        (query: string): SearchQueryItem[] => {
            const normalizedQuery = query.trim().toLowerCase();
            if (!normalizedQuery) {
                return [];
            }

            const options: CreateMenuSearchOption[] = [
                {
                    id: CONST.FAB_MENU_ITEM_IDS.EXPENSE,
                    titleKey: 'iou.createExpense',
                    icon: getIconForAction(CONST.IOU.TYPE.CREATE, icons),
                    keywords: ['expense', 'submit', 'receipt', 'scan'],
                    isVisible: true,
                    onSelect: () => interceptAnonymousUser(() => startMoneyRequest(CONST.IOU.TYPE.CREATE, reportID, draftTransactionIDs, undefined, undefined, undefined, true)),
                },
                {
                    id: CONST.FAB_MENU_ITEM_IDS.TRACK_DISTANCE,
                    titleKey: 'iou.trackDistance',
                    icon: icons.Location,
                    keywords: ['distance', 'mileage', 'miles', 'drive'],
                    isVisible: true,
                    onSelect: () =>
                        interceptAnonymousUser(() => startDistanceRequest(CONST.IOU.TYPE.CREATE, reportID, draftTransactionIDs, lastDistanceExpenseType, undefined, undefined, true)),
                },
                {
                    id: CONST.FAB_MENU_ITEM_IDS.CREATE_REPORT,
                    titleKey: 'report.newReport.createReport',
                    icon: icons.Document,
                    keywords: ['report'],
                    isVisible: isCreateReportVisible,
                    onSelect: createReport,
                },
                {
                    id: CONST.FAB_MENU_ITEM_IDS.NEW_CHAT,
                    titleKey: 'sidebarScreen.fabNewChat',
                    icon: icons.ChatBubble,
                    keywords: ['chat', 'message', 'dm'],
                    isVisible: true,
                    onSelect: () => interceptAnonymousUser(startNewChat),
                },
                {
                    id: CONST.FAB_MENU_ITEM_IDS.INVOICE,
                    titleKey: 'workspace.invoices.sendInvoice',
                    icon: icons.InvoiceGeneric,
                    keywords: ['invoice', 'bill'],
                    isVisible: canSendInvoice,
                    onSelect: () => interceptAnonymousUser(() => startMoneyRequest(CONST.IOU.TYPE.INVOICE, reportID, draftTransactionIDs, undefined, undefined, undefined, true)),
                },
                {
                    id: CONST.FAB_MENU_ITEM_IDS.TRAVEL,
                    titleKey: 'travel.bookTravel',
                    icon: icons.Suitcase,
                    keywords: ['travel', 'trip', 'flight', 'hotel'],
                    isVisible: isTravelVisible,
                    onSelect: () =>
                        interceptAnonymousUser(() => {
                            if (isTravelEnabled) {
                                openTravelDotLink(activePolicy?.id);
                                return;
                            }
                            Navigation.navigate(ROUTES.TRAVEL_MY_TRIPS.getRoute(activePolicy?.id));
                        }),
                },
                {
                    id: CONST.FAB_MENU_ITEM_IDS.NEW_WORKSPACE,
                    titleKey: 'workspace.new.newWorkspace',
                    icon: icons.NewWorkspace,
                    shouldIconApplyFill: false,
                    keywords: ['workspace'],
                    isVisible: isNewWorkspaceVisible,
                    onSelect: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACE_CONFIRMATION.getRoute(Navigation.getActiveRoute()))),
                },
            ];

            return options
                .filter((option) => option.isVisible)
                .map((option) => ({option, title: translate(option.titleKey)}))
                .filter(({option, title}) => [title, ...(option.keywords ?? [])].join(' ').toLowerCase().includes(normalizedQuery))
                .map(
                    ({option, title}): SearchQueryItem => ({
                        // Create-menu rows show the action itself (e.g. "Create expense") rather than a "Go to X" destination, and carry no parent-tab label.
                        text: title,
                        singleIcon: option.icon,
                        shouldIconApplyFill: option.shouldIconApplyFill,
                        keyForList: `${CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.NAVIGATE}-create-${option.id}`,
                        searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.NAVIGATE,
                        onSelectAction: option.onSelect,
                    }),
                );
        },
        [
            translate,
            icons,
            reportID,
            draftTransactionIDs,
            lastDistanceExpenseType,
            isCreateReportVisible,
            createReport,
            canSendInvoice,
            isTravelVisible,
            isTravelEnabled,
            activePolicy?.id,
            isNewWorkspaceVisible,
        ],
    );

    return getCreateMenuSearchOptions;
}

export default useCreateMenuSearchOptions;
export type {CreateMenuSearchOption};
