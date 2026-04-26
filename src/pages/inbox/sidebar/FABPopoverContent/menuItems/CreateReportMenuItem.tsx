import React from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import useCreateEmptyReportConfirmation from '@hooks/useCreateEmptyReportConfirmation';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHasEmptyReportsForPolicy from '@hooks/useHasEmptyReportsForPolicy';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {createNewReport} from '@libs/actions/Report';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getDefaultChatEnabledPolicy, isPaidGroupPolicy, shouldShowPolicy} from '@libs/PolicyUtils';
import {hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import isOnSearchMoneyRequestReportPage from '@navigation/helpers/isOnSearchMoneyRequestReportPage';
import FABFocusableMenuItem from '@pages/inbox/sidebar/FABPopoverContent/FABFocusableMenuItem';
import useRedirectToExpensifyClassic from '@pages/inbox/sidebar/FABPopoverContent/useRedirectToExpensifyClassic';
import {clearLastSearchParams} from '@userActions/ReportNavigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {sessionEmailAndAccountIDSelector} from '@src/selectors/Session';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

const ITEM_ID = CONST.FAB_MENU_ITEM_IDS.CREATE_REPORT;

// Returns up to 2 matching policies — we only ever check length > 0, length === 1, and length > 1.
const chatEnabledPaidGroupPoliciesSelector = (policies: OnyxCollection<OnyxTypes.Policy>, currentUserLogin: string | undefined) => {
    if (isEmptyObject(policies)) {
        return CONST.EMPTY_ARRAY;
    }
    const result: OnyxTypes.Policy[] = [];
    for (const policy of Object.values(policies)) {
        if (!policy?.isPolicyExpenseChatEnabled || policy?.isJoinRequestPending || !isPaidGroupPolicy(policy) || !shouldShowPolicy(policy, false, currentUserLogin)) {
            continue;
        }

        result.push(policy);

        if (result.length === 2) {
            break;
        }
    }

    return result;
};

function CreateReportMenuItem() {
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Document']);
    const {shouldRedirectToExpensifyClassic, canRedirectToExpensifyClassic, showRedirectToExpensifyClassicModal} = useRedirectToExpensifyClassic();
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`);
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: sessionEmailAndAccountIDSelector});
    const [allBetas] = useOnyx(ONYXKEYS.BETAS);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [hasDismissedEmptyReportsConfirmation] = useOnyx(ONYXKEYS.NVP_EMPTY_REPORTS_CONFIRMATION_DISMISSED);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
    const chatEnabledPaidGroupPolicies = (policies: Parameters<typeof chatEnabledPaidGroupPoliciesSelector>[0]) => chatEnabledPaidGroupPoliciesSelector(policies, session?.email);

    const [groupPoliciesWithChatEnabled = CONST.EMPTY_ARRAY] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: chatEnabledPaidGroupPolicies}, [session?.email]);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);

    const isVisible = canRedirectToExpensifyClassic || groupPoliciesWithChatEnabled.length > 0;

    const defaultChatEnabledPolicy = getDefaultChatEnabledPolicy(groupPoliciesWithChatEnabled as Array<OnyxEntry<OnyxTypes.Policy>>, activePolicy);

    const defaultChatEnabledPolicyID = defaultChatEnabledPolicy?.id;
    const hasEmptyReport = useHasEmptyReportsForPolicy(defaultChatEnabledPolicyID);
    const shouldShowEmptyReportConfirmation = hasEmptyReport && hasDismissedEmptyReportsConfirmation !== true;

    const isReportInSearch = isOnSearchMoneyRequestReportPage();

    const handleCreateWorkspaceReport = (shouldDismissEmptyReportsConfirmation?: boolean) => {
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
        Navigation.setNavigationActionToMicrotaskQueue(() => {
            Navigation.navigate(
                isSearchTopmostFullScreenRoute()
                    ? ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: createdReportID, backTo: Navigation.getActiveRoute()})
                    : ROUTES.REPORT_WITH_ID.getRoute(createdReportID, undefined, undefined, Navigation.getActiveRoute()),
                {forceReplace: isReportInSearch},
            );
        });
    };

    const {openCreateReportConfirmation} = useCreateEmptyReportConfirmation({
        policyID: defaultChatEnabledPolicyID,
        policyName: defaultChatEnabledPolicy?.name ?? '',
        onConfirm: handleCreateWorkspaceReport,
        shouldHandleNavigationBack: false,
    });

    return (
        <FABFocusableMenuItem
            itemId={ITEM_ID}
            isVisible={isVisible}
            pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.CREATE_REPORT}
            icon={icons.Document}
            title={translate('report.newReport.createReport')}
            onPress={() => {
                interceptAnonymousUser(() => {
                    if (shouldRedirectToExpensifyClassic) {
                        if (canRedirectToExpensifyClassic) {
                            showRedirectToExpensifyClassicModal();
                        }
                        return;
                    }

                    const workspaceIDForReportCreation = defaultChatEnabledPolicyID;

                    // If we couldn't guess the workspace to create the report, or a guessed workspace is past its grace period and we have other workspaces to choose from
                    if (
                        !workspaceIDForReportCreation ||
                        (shouldRestrictUserBillableActions(workspaceIDForReportCreation, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed) &&
                            groupPoliciesWithChatEnabled.length > 1)
                    ) {
                        Navigation.navigate(ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute());
                        return;
                    }

                    if (!shouldRestrictUserBillableActions(workspaceIDForReportCreation, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed)) {
                        // Check if empty report confirmation should be shown
                        if (shouldShowEmptyReportConfirmation) {
                            openCreateReportConfirmation();
                        } else {
                            handleCreateWorkspaceReport(false);
                        }
                        return;
                    }

                    Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(workspaceIDForReportCreation));
                });
            }}
            shouldCallAfterModalHide={shouldUseNarrowLayout}
        />
    );
}

export default CreateReportMenuItem;
