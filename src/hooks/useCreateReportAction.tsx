import type {ReactNode} from 'react';
import {useCallback, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import {closeReactNativeApp} from '@libs/actions/HybridApp';
import {openOldDotLink} from '@libs/actions/Link';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {getDefaultChatEnabledPolicy} from '@libs/PolicyUtils';
import {generateReportID} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isTrackingSelector} from '@src/selectors/GPSDraftDetails';
import {shouldRedirectToExpensifyClassicSelector} from '@src/selectors/Policy';
import type * as OnyxTypes from '@src/types/onyx';
import useConfirmModal from './useConfirmModal';
import useCreateEmptyReportConfirmation from './useCreateEmptyReportConfirmation';
import useHasEmptyReportsForPolicy from './useHasEmptyReportsForPolicy';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

type UseCreateReportActionParams = {
    /** Callback to create the report and navigate after creation */
    onCreateReport: (shouldDismissEmptyReportsConfirmation?: boolean) => void;

    /** Group policies with expense chat enabled */
    groupPoliciesWithChatEnabled: readonly never[] | Array<OnyxEntry<OnyxTypes.Policy>>;
};

type UseCreateReportActionResult = {
    /** The action to trigger when the user clicks "Create report" */
    createReportAction: () => void;

    /** The confirmation modal React component to render */
    CreateReportConfirmationModal: ReactNode;
};

/**
 * Hook that encapsulates the shared "create report" branching logic used across
 * the FAB, the search Create dropdown, and the empty reports state.
 *
 * Decision flow:
 * 1. Redirect to Expensify Classic if all group policies have expense chat disabled
 * 2. Navigate to upgrade path if user has no valid group policies at all
 * 3. Navigate to workspace selector if no default workspace or restricted with multiple options
 * 4. Show empty report confirmation or create directly if workspace is valid
 * 5. Navigate to restricted action if billing restricts the workspace
 */
export default function useCreateReportAction({onCreateReport, groupPoliciesWithChatEnabled}: UseCreateReportActionParams): UseCreateReportActionResult {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();

    const [shouldRedirectToExpensifyClassic] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: shouldRedirectToExpensifyClassicSelector});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`);
    const [ownerBillingGraceEndPeriod] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [userBillingGraceEndPeriods] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [isTrackingGPS = false] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {selector: isTrackingSelector});

    // User has no group policies at all (neither with chat enabled nor disabled) → needs upgrade/workspace creation
    const shouldNavigateToUpgradePath = !shouldRedirectToExpensifyClassic && groupPoliciesWithChatEnabled.length === 0;

    const defaultChatEnabledPolicy = useMemo(
        () => getDefaultChatEnabledPolicy(groupPoliciesWithChatEnabled as Array<OnyxEntry<OnyxTypes.Policy>>, activePolicy),
        [activePolicy, groupPoliciesWithChatEnabled],
    );
    const defaultChatEnabledPolicyID = defaultChatEnabledPolicy?.id;

    const hasEmptyReport = useHasEmptyReportsForPolicy(defaultChatEnabledPolicyID);
    const [hasDismissedEmptyReportsConfirmation] = useOnyx(ONYXKEYS.NVP_EMPTY_REPORTS_CONFIRMATION_DISMISSED);
    const shouldShowEmptyReportConfirmation = hasEmptyReport && hasDismissedEmptyReportsConfirmation !== true;

    const {openCreateReportConfirmation, CreateReportConfirmationModal} = useCreateEmptyReportConfirmation({
        policyID: defaultChatEnabledPolicyID,
        policyName: defaultChatEnabledPolicy?.name ?? '',
        onConfirm: onCreateReport,
    });

    const showRedirectToExpensifyClassicModal = useCallback(async () => {
        const {action} = await showConfirmModal({
            title: translate('sidebarScreen.redirectToExpensifyClassicModal.title'),
            prompt: translate('sidebarScreen.redirectToExpensifyClassicModal.description'),
            confirmText: translate('exitSurvey.goToExpensifyClassic'),
            cancelText: translate('common.cancel'),
        });
        if (action !== ModalActions.CONFIRM) {
            return;
        }
        if (CONFIG.IS_HYBRID_APP) {
            closeReactNativeApp({shouldSetNVP: true, isTrackingGPS});
            return;
        }
        openOldDotLink(CONST.OLDDOT_URLS.INBOX);
    }, [showConfirmModal, translate, isTrackingGPS]);

    const createReportAction = useCallback(() => {
        interceptAnonymousUser(() => {
            if (shouldRedirectToExpensifyClassic) {
                showRedirectToExpensifyClassicModal();
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

            if (
                !workspaceIDForReportCreation ||
                (shouldRestrictUserBillableActions(workspaceIDForReportCreation, userBillingGraceEndPeriods, undefined, ownerBillingGraceEndPeriod) &&
                    groupPoliciesWithChatEnabled.length > 1)
            ) {
                Navigation.navigate(ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute());
                return;
            }

            if (!shouldRestrictUserBillableActions(workspaceIDForReportCreation, userBillingGraceEndPeriods, undefined, ownerBillingGraceEndPeriod)) {
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
        shouldRedirectToExpensifyClassic,
        showRedirectToExpensifyClassicModal,
        shouldNavigateToUpgradePath,
        defaultChatEnabledPolicyID,
        userBillingGraceEndPeriods,
        ownerBillingGraceEndPeriod,
        groupPoliciesWithChatEnabled.length,
        shouldShowEmptyReportConfirmation,
        openCreateReportConfirmation,
        onCreateReport,
    ]);

    return {createReportAction, CreateReportConfirmationModal};
}
