import {useCallback} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getDefaultChatEnabledPolicy, isPaidGroupPolicy} from '@libs/PolicyUtils';
import {generateReportID} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import useCreateEmptyReportConfirmation from './useCreateEmptyReportConfirmation';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';
import useShouldShowEmptyReportConfirmation from './useShouldShowEmptyReportConfirmation';

type UseCreateReportParams = {
    /** Callback that creates the report and navigates after creation */
    onCreateReport: (shouldDismissEmptyReportsConfirmation?: boolean) => void;
    /** Group paid policies with expense chat enabled */
    groupPoliciesWithChatEnabled: readonly never[] | Array<OnyxEntry<OnyxTypes.Policy>>;
    /** Optional custom navigation to the workspace selector */
    onNavigateToWorkspaceSelection?: () => void;
    /** Whether the empty-report confirmation modal should push a history entry so browser-back dismisses it (default: true) */
    shouldHandleNavigationBack?: boolean;
};

type UseCreateReportResult = {
    /** The callback to trigger when the user clicks "Create report" */
    createReport: () => void;
    /** Whether the menu item/button should be visible */
    isVisible: boolean;
};

/**
 * Hook that encapsulates the shared "create report" branching logic used across
 * the FAB, the search Create dropdown, and the empty reports state.
 *
 * Decision flow:
 * 1. Navigate to upgrade path if user has no valid group policies at all
 * 2. Navigate to workspace selector if default is personal AND there are at least 2 non-personal workspaces, or if the chosen default is billing-restricted and alternatives exist
 * 3. Show empty report confirmation or create directly if workspace is valid
 * 4. Navigate to restricted action if billing restricts the workspace
 */
export default function useCreateReport({
    onCreateReport,
    groupPoliciesWithChatEnabled,
    onNavigateToWorkspaceSelection,
    shouldHandleNavigationBack = true,
}: UseCreateReportParams): UseCreateReportResult {
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`);
    const [, policiesLoadStatus] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const {accountID} = useCurrentUserPersonalDetails();

    // Gate visibility and routing on policy hydration. Without this, during Onyx cold-start
    // groupPoliciesWithChatEnabled.length === 0 would be true even for users who actually have
    // workspaces, sending them to MONEY_REQUEST_UPGRADE as if they had none.
    const arePoliciesLoaded = !isLoadingOnyxValue(policiesLoadStatus);
    const isVisible = arePoliciesLoaded;
    const shouldNavigateToUpgradePath = groupPoliciesWithChatEnabled.length === 0;

    const defaultChatEnabledPolicy = getDefaultChatEnabledPolicy(groupPoliciesWithChatEnabled as Array<OnyxEntry<OnyxTypes.Policy>>, activePolicy);
    const defaultChatEnabledPolicyID = defaultChatEnabledPolicy?.id;

    const shouldShowEmptyReportConfirmation = useShouldShowEmptyReportConfirmation(defaultChatEnabledPolicyID);

    const {openCreateReportConfirmation} = useCreateEmptyReportConfirmation({
        policyID: defaultChatEnabledPolicyID,
        policyName: defaultChatEnabledPolicy?.name ?? '',
        onConfirm: onCreateReport,
        shouldHandleNavigationBack,
    });

    const createReport = useCallback(() => {
        interceptAnonymousUser(() => {
            if (!arePoliciesLoaded) {
                return;
            }

            // No valid policy at all → upgrade + create workspace flow
            if (shouldNavigateToUpgradePath) {
                const freshReportID = generateReportID();
                const freshTransactionID = generateReportID();
                Navigation.navigate(
                    ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
                        action: CONST.IOU.ACTION.CREATE,
                        iouType: CONST.IOU.TYPE.CREATE,
                        transactionID: freshTransactionID,
                        reportID: freshReportID,
                        upgradePath: CONST.UPGRADE_PATHS.REPORTS,
                    }),
                );
                return;
            }

            const workspaceIDForReportCreation = defaultChatEnabledPolicyID;

            // Show the workspace selector only when the default workspace is personal and there are
            // at least 2 non-personal workspaces to choose between. Also fall back to the selector if
            // the default is billing-restricted and alternatives exist, so the user isn't dead-ended
            // on the restricted-action page.
            const isDefaultPersonal = !activePolicy || activePolicy.type === CONST.POLICY.TYPE.PERSONAL || !isPaidGroupPolicy(activePolicy);
            const hasMultipleNonPersonalWorkspaces = groupPoliciesWithChatEnabled.length > 1;
            const isDefaultBillingRestricted =
                !!workspaceIDForReportCreation && shouldRestrictUserBillableActions(defaultChatEnabledPolicy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, accountID);

            if (!workspaceIDForReportCreation || (isDefaultPersonal && hasMultipleNonPersonalWorkspaces) || (isDefaultBillingRestricted && hasMultipleNonPersonalWorkspaces)) {
                if (onNavigateToWorkspaceSelection) {
                    onNavigateToWorkspaceSelection();
                } else {
                    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.NEW_REPORT_WORKSPACE_SELECTION.path));
                }
                return;
            }

            // Default workspace is not restricted → create report directly (or show empty-report confirmation)
            if (!shouldRestrictUserBillableActions(defaultChatEnabledPolicy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, accountID)) {
                if (shouldShowEmptyReportConfirmation) {
                    openCreateReportConfirmation();
                } else {
                    onCreateReport(false);
                }
                return;
            }

            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(workspaceIDForReportCreation));
        });
    }, [
        arePoliciesLoaded,
        shouldNavigateToUpgradePath,
        activePolicy,
        defaultChatEnabledPolicy,
        defaultChatEnabledPolicyID,
        ownerBillingGracePeriodEnd,
        userBillingGracePeriodEnds,
        amountOwed,
        accountID,
        groupPoliciesWithChatEnabled.length,
        onNavigateToWorkspaceSelection,
        shouldShowEmptyReportConfirmation,
        openCreateReportConfirmation,
        onCreateReport,
    ]);

    return {createReport, isVisible};
}
