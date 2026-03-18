import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useCreateReportAction from '@hooks/useCreateReportAction';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {createNewReport} from '@libs/actions/Report';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getDefaultChatEnabledPolicy} from '@libs/PolicyUtils';
import {hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import isOnSearchMoneyRequestReportPage from '@navigation/helpers/isOnSearchMoneyRequestReportPage';
import FABFocusableMenuItem from '@pages/inbox/sidebar/FABPopoverContent/FABFocusableMenuItem';
import {clearLastSearchParams} from '@userActions/ReportNavigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {groupPaidPoliciesWithExpenseChatEnabledSelector} from '@src/selectors/Policy';
import {sessionEmailAndAccountIDSelector} from '@src/selectors/Session';
import type * as OnyxTypes from '@src/types/onyx';

const ITEM_ID = CONST.FAB_MENU_ITEM_IDS.CREATE_REPORT;

function CreateReportMenuItem() {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Document'] as const);

    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: sessionEmailAndAccountIDSelector});
    const [allBetas] = useOnyx(ONYXKEYS.BETAS);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');

    const groupPaidPoliciesWithChatEnabledCb = (policies: Parameters<typeof groupPaidPoliciesWithExpenseChatEnabledSelector>[0]) =>
        groupPaidPoliciesWithExpenseChatEnabledSelector(policies, session?.email);
    const [groupPoliciesWithChatEnabled = CONST.EMPTY_ARRAY] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: groupPaidPoliciesWithChatEnabledCb}, [session?.email]);

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`);

    const defaultChatEnabledPolicy = getDefaultChatEnabledPolicy(groupPoliciesWithChatEnabled as Array<OnyxEntry<OnyxTypes.Policy>>, activePolicy);

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

    const {createReportAction} = useCreateReportAction({
        onCreateReport: handleCreateWorkspaceReport,
        groupPoliciesWithChatEnabled,
    });

    return (
        <FABFocusableMenuItem
            itemId={ITEM_ID}
            pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.CREATE_REPORT}
            icon={icons.Document}
            title={translate('report.newReport.createReport')}
            onPress={createReportAction}
            shouldCallAfterModalHide={shouldUseNarrowLayout}
        />
    );
}

export default CreateReportMenuItem;
