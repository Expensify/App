/**
 * Builds the Create/FAB navigation suggestions shown in the Search Router.
 */
import useCreateReport from '@hooks/useCreateReport';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePreferredPolicy from '@hooks/usePreferredPolicy';

import {startDistanceRequest, startMoneyRequest} from '@libs/actions/IOU/MoneyRequest';
import {createNewReport, startNewChat} from '@libs/actions/Report';
import getIconForAction from '@libs/getIconForAction';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import getCreateReportRoute, {getReportsRootRoute, navigateToCreateReportWorkspaceSelection} from '@libs/Navigation/helpers/getCreateReportRoute';
import Navigation from '@libs/Navigation/Navigation';
import {openTravelDotLink} from '@libs/openTravelDotLink';
import Permissions from '@libs/Permissions';
// eslint-disable-next-line no-restricted-imports -- TravelDot booking requires a paid workspace, matching the existing FAB behavior.
import {canSendInvoice, getDefaultChatEnabledPolicy, getGroupPoliciesWhereReportCanBeCreated, hasAcceptedTravelTerms, isPaidGroupPolicy, shouldShowPolicy} from '@libs/PolicyUtils';
import {generateReportID} from '@libs/ReportUtils';

import isOnSearchMoneyRequestReportPage from '@navigation/helpers/isOnSearchMoneyRequestReportPage';

import {clearLastSearchParams} from '@userActions/ReportNavigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import {primaryLoginSelector} from '@src/selectors/Account';
import {isTrackIntentUserSelector} from '@src/selectors/Onboarding';
import {emailSelector} from '@src/selectors/Session';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';
import type IconAsset from '@src/types/utils/IconAsset';

import {Str} from 'expensify-common';
import {useState} from 'react';

import type {NavigationSuggestionSourceItem} from './SearchRouterHelpers';

import {isNavigationIntentOnlyQuery, matchesNavigationQuery, stripNavigationIntentPrefix} from './SearchRouterHelpers';

/** Input used to build a Create action navigation suggestion. */
type CreateNavigationItem = {
    visible: boolean;
    text: string;
    icon: IconAsset;
    action: () => void;
    keyForList: string;
    matchTerms?: string[];
};

function buildCreateNavigationItems(items: CreateNavigationItem[]): NavigationSuggestionSourceItem[] {
    return items
        .filter((item) => item.visible)
        .map(({text, icon, action, keyForList, matchTerms}) => ({
            text,
            singleIcon: icon,
            action,
            keyForList,
            matchTerms: matchTerms ?? [text],
        }));
}

// Search Router is already hidden when this runs, so the topmost modal is an underlying RHP.
// Wait for it to close before opening the Create flow to avoid stacking modal routes.
function replaceTopmostModalWithAction(action: () => void) {
    if (!Navigation.isTopmostRouteModalScreen()) {
        action();
        return;
    }

    Navigation.dismissModal({afterTransition: action});
}

function openBookTravel(policyID: string | undefined, isTravelEnabled: boolean) {
    if (isTravelEnabled) {
        openTravelDotLink(policyID);
        return;
    }

    Navigation.navigate(ROUTES.TRAVEL_MY_TRIPS.getRoute(policyID));
}

function useCreateNavigationSuggestions(query = ''): NavigationSuggestionSourceItem[] {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Coins', 'Receipt', 'Cash', 'Transfer', 'MoneyCircle', 'Location', 'Document', 'ChatBubble', 'InvoiceGeneric', 'Suitcase', 'NewWorkspace']);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const {isBetaEnabled} = usePermissions();
    const {isOffline} = useNetwork();
    const {isRestrictedPolicyCreation} = usePreferredPolicy();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [reportID] = useState(() => generateReportID());
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE);
    const [primaryLogin] = useOnyx(ONYXKEYS.ACCOUNT, {selector: primaryLoginSelector});
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const [allBetas] = useOnyx(ONYXKEYS.BETAS);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`);
    const [travelSettings] = useOnyx(ONYXKEYS.NVP_TRAVEL_SETTINGS);

    // Match Quick Creation and Search actions by using shared report eligibility rules.
    const groupPoliciesWithChatEnabled = getGroupPoliciesWhereReportCanBeCreated(allPolicies ?? null, sessionEmail);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [isLoading = false] = useOnyx(ONYXKEYS.IS_LOADING_APP);

    const defaultChatEnabledPolicy = getDefaultChatEnabledPolicy([...groupPoliciesWithChatEnabled], activePolicy);
    const isInvoiceVisible = canSendInvoice(allPolicies ?? null, sessionEmail);
    const isTravelVisible = !!activePolicy?.isTravelEnabled;
    const isBlockedFromSpotnanaTravel = Permissions.isBetaEnabled(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL, allBetas);
    const primaryContactMethod = primaryLogin ?? sessionEmail ?? '';
    const isTravelEnabled =
        !isBlockedFromSpotnanaTravel &&
        !!primaryContactMethod &&
        !Str.isSMSLogin(primaryContactMethod) &&
        isPaidGroupPolicy(activePolicy) &&
        hasAcceptedTravelTerms(activePolicy, travelSettings);

    const createExpenseMatchTerms = [translate('iou.createExpense'), translate('iou.addExpense'), translate('homePage.gettingStartedSection.createExpense')];
    const createReportMatchTerms = [translate('report.newReport.createReport')];
    const trackDistanceMatchTerms = [translate('iou.trackDistance')];
    const chatMatchTerms = [translate('sidebarScreen.fabNewChat'), `${translate('common.new')} ${translate('common.chat')}`];
    const invoiceMatchTerms = [translate('workspace.invoices.sendInvoice')];
    const bookTravelLabel = translate('travel.bookTravel');
    const travelMatchTerms = [bookTravelLabel];
    const workspaceMatchTerms = [translate('workspace.new.newWorkspace'), translate('onboarding.workspace.createWorkspace'), translate('homePage.gettingStartedSection.createWorkspace')];
    const matchQuery = stripNavigationIntentPrefix(query);
    const shouldPrepareCreateReport =
        isNavigationIntentOnlyQuery(query) ||
        [createExpenseMatchTerms, createReportMatchTerms, trackDistanceMatchTerms, chatMatchTerms, invoiceMatchTerms, workspaceMatchTerms].some((matchTerms) =>
            matchesNavigationQuery(matchQuery, ...matchTerms),
        );

    const {createReport, isVisible: isCreateReportVisible} = useCreateReport({
        onCreateReport: (shouldDismissEmptyReportsConfirmation?: boolean) => {
            if (!defaultChatEnabledPolicy?.id) {
                return;
            }

            // Read this after Search Router closes so native resolves the underlying route instead of the router screen itself.
            const isReportInSearch = isOnSearchMoneyRequestReportPage();
            if (isReportInSearch) {
                clearLastSearchParams();
            }

            const {reportID: createdReportID} = createNewReport(
                currentUserPersonalDetails,
                false,
                isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
                defaultChatEnabledPolicy,
                allBetas,
                isTrackIntentUser,
                getCurrencyDecimals,
                false,
                shouldDismissEmptyReportsConfirmation,
            );
            // Navigate to the Reports page first so getCreateReportRoute() resolves against
            // the Search/Reports fullscreen context before opening the created report modal.
            Navigation.navigate(getReportsRootRoute(), {forceReplace: isReportInSearch});
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                Navigation.navigate(getCreateReportRoute({reportID: createdReportID}), {forceReplace: isReportInSearch});
            });
        },
        groupPoliciesWithChatEnabled,
        onNavigateToWorkspaceSelection: () => navigateToCreateReportWorkspaceSelection({forceReplace: isOnSearchMoneyRequestReportPage()}),
        shouldHandleNavigationBack: false,
        shouldSkipEmptyReportConfirmation: !shouldPrepareCreateReport,
    });

    const shouldShowNewWorkspaceButton =
        !isRestrictedPolicyCreation && !isLoading && Object.values(allPolicies ?? {}).every((policy) => !shouldShowPolicy(policy, !!isOffline, sessionEmail));

    return buildCreateNavigationItems([
        {
            visible: true,
            text: translate('iou.createExpense'),
            icon: getIconForAction(CONST.IOU.TYPE.CREATE, icons),
            matchTerms: createExpenseMatchTerms,
            action: () =>
                replaceTopmostModalWithAction(() => {
                    interceptAnonymousUser(() => {
                        startMoneyRequest(CONST.IOU.TYPE.CREATE, reportID, draftTransactionIDs, undefined, undefined, undefined, true);
                    });
                }),
            keyForList: 'create_expense',
        },
        {
            visible: isCreateReportVisible,
            text: translate('report.newReport.createReport'),
            icon: icons.Document,
            matchTerms: createReportMatchTerms,
            action: () => replaceTopmostModalWithAction(createReport),
            keyForList: 'create_report',
        },
        {
            visible: true,
            text: translate('iou.trackDistance'),
            icon: icons.Location,
            matchTerms: trackDistanceMatchTerms,
            action: () =>
                replaceTopmostModalWithAction(() => {
                    interceptAnonymousUser(() => {
                        startDistanceRequest(CONST.IOU.TYPE.CREATE, reportID, draftTransactionIDs, lastDistanceExpenseType, undefined, undefined, true);
                    });
                }),
            keyForList: 'create_trackDistance',
        },
        {
            visible: true,
            text: translate('sidebarScreen.fabNewChat'),
            icon: icons.ChatBubble,
            matchTerms: chatMatchTerms,
            action: () => replaceTopmostModalWithAction(() => interceptAnonymousUser(startNewChat)),
            keyForList: 'create_chat',
        },
        {
            visible: isInvoiceVisible,
            text: translate('workspace.invoices.sendInvoice'),
            icon: icons.InvoiceGeneric,
            matchTerms: invoiceMatchTerms,
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
            text: bookTravelLabel,
            icon: icons.Suitcase,
            matchTerms: travelMatchTerms,
            action: () =>
                replaceTopmostModalWithAction(() => {
                    interceptAnonymousUser(() => openBookTravel(activePolicy?.id, isTravelEnabled));
                }),
            keyForList: 'create_travel',
        },
        {
            visible: shouldShowNewWorkspaceButton,
            text: translate('workspace.new.newWorkspace'),
            icon: icons.NewWorkspace,
            matchTerms: workspaceMatchTerms,
            action: () =>
                replaceTopmostModalWithAction(() => {
                    interceptAnonymousUser(() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_CONFIRMATION.path)));
                }),
            keyForList: 'create_workspace',
        },
    ]);
}

export default useCreateNavigationSuggestions;
export {buildCreateNavigationItems, replaceTopmostModalWithAction};
export type {CreateNavigationItem};
