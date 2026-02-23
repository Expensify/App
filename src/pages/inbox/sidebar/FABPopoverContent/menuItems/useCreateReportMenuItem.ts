import type {ReactNode} from 'react';
import {useCallback, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import useCreateEmptyReportConfirmation from '@hooks/useCreateEmptyReportConfirmation';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHasEmptyReportsForPolicy from '@hooks/useHasEmptyReportsForPolicy';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import {createNewReport} from '@libs/actions/Report';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getDefaultChatEnabledPolicy} from '@libs/PolicyUtils';
import {hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {groupPaidPoliciesWithExpenseChatEnabledSelector} from '@selectors/Policy';
import isOnSearchMoneyRequestReportPage from '@navigation/helpers/isOnSearchMoneyRequestReportPage';
import {clearLastSearchParams} from '@userActions/ReportNavigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import useRedirectToExpensifyClassic from '@pages/inbox/sidebar/FABPopoverContent/useRedirectToExpensifyClassic';
import type {MenuItemIcons} from '@pages/inbox/sidebar/FABPopoverContent/types';

type UseCreateReportMenuItemParams = {
    shouldUseNarrowLayout: boolean;
    icons: MenuItemIcons;
    activePolicyID: string | undefined;
};

type UseCreateReportMenuItemResult = {
    menuItem: PopoverMenuItem[];
    confirmationModal: ReactNode;
};

const sessionSelector = (session: OnyxEntry<OnyxTypes.Session>) => ({email: session?.email, accountID: session?.accountID});

function useCreateReportMenuItem({shouldUseNarrowLayout, icons, activePolicyID}: UseCreateReportMenuItemParams): UseCreateReportMenuItemResult {
    const {translate} = useLocalize();
    const {shouldRedirectToExpensifyClassic, showRedirectToExpensifyClassicModal} = useRedirectToExpensifyClassic();
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false, selector: sessionSelector});
    const [allBetas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const [hasDismissedEmptyReportsConfirmation] = useOnyx(ONYXKEYS.NVP_EMPTY_REPORTS_CONFIRMATION_DISMISSED, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');

    const groupPaidPoliciesWithChatEnabled = useCallback(
        (policies: Parameters<typeof groupPaidPoliciesWithExpenseChatEnabledSelector>[0]) => groupPaidPoliciesWithExpenseChatEnabledSelector(policies, session?.email),
        [session?.email],
    );

    const [groupPoliciesWithChatEnabled = CONST.EMPTY_ARRAY] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: groupPaidPoliciesWithChatEnabled, canBeMissing: true}, [session?.email]);

    const shouldShowCreateReportOption = shouldRedirectToExpensifyClassic || groupPoliciesWithChatEnabled.length > 0;

    const defaultChatEnabledPolicy = useMemo(
        () => getDefaultChatEnabledPolicy(groupPoliciesWithChatEnabled as Array<OnyxEntry<OnyxTypes.Policy>>, activePolicy),
        [activePolicy, groupPoliciesWithChatEnabled],
    );

    const defaultChatEnabledPolicyID = defaultChatEnabledPolicy?.id;
    const hasEmptyReport = useHasEmptyReportsForPolicy(defaultChatEnabledPolicyID);
    const shouldShowEmptyReportConfirmation = hasEmptyReport && hasDismissedEmptyReportsConfirmation !== true;

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
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                Navigation.navigate(
                    isSearchTopmostFullScreenRoute()
                        ? ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: createdReportID, backTo: Navigation.getActiveRoute()})
                        : ROUTES.REPORT_WITH_ID.getRoute(createdReportID, undefined, undefined, Navigation.getActiveRoute()),
                    {forceReplace: isReportInSearch},
                );
            });
        },
        [currentUserPersonalDetails, hasViolations, defaultChatEnabledPolicy, isASAPSubmitBetaEnabled, isReportInSearch, allBetas],
    );

    const {openCreateReportConfirmation, CreateReportConfirmationModal} = useCreateEmptyReportConfirmation({
        policyID: defaultChatEnabledPolicyID,
        policyName: defaultChatEnabledPolicy?.name ?? '',
        onConfirm: handleCreateWorkspaceReport,
    });

    const menuItem = useMemo(() => {
        if (!shouldShowCreateReportOption) {
            return [];
        }
        return [
            {
                icon: icons.Document,
                text: translate('report.newReport.createReport'),
                shouldCallAfterModalHide: shouldUseNarrowLayout,
                onSelected: () => {
                    interceptAnonymousUser(() => {
                        if (shouldRedirectToExpensifyClassic) {
                            showRedirectToExpensifyClassicModal();
                            return;
                        }

                        const workspaceIDForReportCreation = defaultChatEnabledPolicyID;

                        if (!workspaceIDForReportCreation || (shouldRestrictUserBillableActions(workspaceIDForReportCreation) && groupPoliciesWithChatEnabled.length > 1)) {
                            Navigation.navigate(ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute());
                            return;
                        }

                        if (!shouldRestrictUserBillableActions(workspaceIDForReportCreation)) {
                            if (shouldShowEmptyReportConfirmation) {
                                openCreateReportConfirmation();
                            } else {
                                handleCreateWorkspaceReport(false);
                            }
                            return;
                        }

                        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(workspaceIDForReportCreation));
                    });
                },
                sentryLabel: CONST.SENTRY_LABEL.FAB_MENU.CREATE_REPORT,
            },
        ];
    }, [
        shouldShowCreateReportOption,
        icons.Document,
        translate,
        shouldUseNarrowLayout,
        shouldRedirectToExpensifyClassic,
        showRedirectToExpensifyClassicModal,
        defaultChatEnabledPolicyID,
        groupPoliciesWithChatEnabled.length,
        shouldShowEmptyReportConfirmation,
        openCreateReportConfirmation,
        handleCreateWorkspaceReport,
    ]);

    return {menuItem, confirmationModal: CreateReportConfirmationModal};
}

export default useCreateReportMenuItem;
