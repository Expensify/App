/**
 * Builds the Create/FAB navigation suggestions shown in the Search Router.
 */
import type {SearchQueryItem} from '@components/Search/SearchList/ListItem/SearchQueryListItem';

import useCreateReport from '@hooks/useCreateReport';
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
import {canSendInvoice, getDefaultChatEnabledPolicy, getGroupPoliciesWhereReportCanBeCreated, shouldShowPolicy} from '@libs/PolicyUtils';
import {generateReportID} from '@libs/ReportUtils';

import isOnSearchMoneyRequestReportPage from '@navigation/helpers/isOnSearchMoneyRequestReportPage';

import {clearLastSearchParams} from '@userActions/ReportNavigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import {isTrackIntentUserSelector} from '@src/selectors/Onboarding';
import {emailSelector} from '@src/selectors/Session';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';
import type * as OnyxTypes from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import type IconAsset from '@src/types/utils/IconAsset';

import type {OnyxCollection} from 'react-native-onyx';

import {useState} from 'react';

import type {NavigationSuggestionSourceItem} from './SearchRouterHelpers';

type CreateNavigationItem = {
    visible: boolean;
    text: string;
    icon: IconAsset;
    action: () => void;
    keyForList: string;
};

function buildCreateNavigationItems(items: CreateNavigationItem[]): NavigationSuggestionSourceItem[] {
    return items
        .filter((item) => item.visible)
        .map(({text, icon, action, keyForList}) => ({
            text,
            singleIcon: icon,
            action,
            keyForList,
            matchTerms: [text],
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

function useCreateNavigationSuggestions(): SearchQueryItem[] {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Coins', 'Receipt', 'Cash', 'Transfer', 'MoneyCircle', 'Location', 'Document', 'ChatBubble', 'InvoiceGeneric', 'NewWorkspace']);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const isSubmit2026BetaEnabled = isBetaEnabled(CONST.BETAS.SUBMIT_2026);
    const {isOffline} = useNetwork();
    const {isRestrictedPolicyCreation} = usePreferredPolicy();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [reportID] = useState(() => generateReportID());
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE);
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const [allBetas] = useOnyx(ONYXKEYS.BETAS);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`);
    // Use the shared report eligibility rules so Submit workspaces are only included for beta users.
    const [groupPoliciesWithChatEnabled = getEmptyArray<OnyxTypes.Policy>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: (policies: OnyxCollection<OnyxTypes.Policy>) => getGroupPoliciesWhereReportCanBeCreated(policies, isSubmit2026BetaEnabled, sessionEmail),
    });
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [isLoading = false] = useOnyx(ONYXKEYS.IS_LOADING_APP);

    const defaultChatEnabledPolicy = getDefaultChatEnabledPolicy([...groupPoliciesWithChatEnabled], activePolicy);
    const isInvoiceVisible = canSendInvoice(allPolicies ?? null, sessionEmail);

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
    });

    const shouldShowNewWorkspaceButton =
        !isRestrictedPolicyCreation && !isLoading && Object.values(allPolicies ?? {}).every((policy) => !shouldShowPolicy(policy, !!isOffline, sessionEmail));

    return buildCreateNavigationItems([
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
            visible: isCreateReportVisible,
            text: translate('report.newReport.createReport'),
            icon: icons.Document,
            action: () => replaceTopmostModalWithAction(createReport),
            keyForList: 'create_report',
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
            visible: true,
            text: translate('sidebarScreen.fabNewChat'),
            icon: icons.ChatBubble,
            action: () => replaceTopmostModalWithAction(() => interceptAnonymousUser(startNewChat)),
            keyForList: 'create_chat',
        },
        {
            visible: isInvoiceVisible,
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
            visible: shouldShowNewWorkspaceButton,
            text: translate('workspace.new.newWorkspace'),
            icon: icons.NewWorkspace,
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
