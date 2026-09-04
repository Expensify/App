import useCreateReport from '@hooks/useCreateReport';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {createNewReport} from '@libs/actions/Report';
import getCreateReportRoute, {getReportsRootRoute, navigateToCreateReportWorkspaceSelection} from '@libs/Navigation/helpers/getCreateReportRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getDefaultChatEnabledPolicy, getGroupPoliciesWhereReportCanBeCreated} from '@libs/PolicyUtils';
import {hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';

import isOnSearchMoneyRequestReportPage from '@navigation/helpers/isOnSearchMoneyRequestReportPage';

import FABFocusableMenuItem from '@pages/inbox/sidebar/FABPopoverContent/FABFocusableMenuItem';

import {clearLastSearchParams} from '@userActions/ReportNavigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {sessionEmailAndAccountIDSelector} from '@src/selectors/Session';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React from 'react';

const ITEM_ID = CONST.FAB_MENU_ITEM_IDS.CREATE_REPORT;

// Returns up to 2 matching policies
const chatEnabledPaidGroupPoliciesSelector = (policies: OnyxCollection<OnyxTypes.Policy>, currentUserLogin: string | undefined) =>
    getGroupPoliciesWhereReportCanBeCreated(policies, currentUserLogin).slice(0, 2);

function CreateReportMenuItem() {
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Document']);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`);
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: sessionEmailAndAccountIDSelector});
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
    const [groupPoliciesWithChatEnabled = CONST.EMPTY_ARRAY] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: (policies: Parameters<typeof chatEnabledPaidGroupPoliciesSelector>[0]) => chatEnabledPaidGroupPoliciesSelector(policies, session?.email),
    });
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

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
    };

    const {createReport, isVisible} = useCreateReport({
        onCreateReport: handleCreateWorkspaceReport,
        groupPoliciesWithChatEnabled,
        onNavigateToWorkspaceSelection: () => navigateToCreateReportWorkspaceSelection({forceReplace: isReportInSearch}),
        shouldHandleNavigationBack: false,
    });

    return (
        <FABFocusableMenuItem
            itemId={ITEM_ID}
            isVisible={isVisible}
            pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.CREATE_REPORT}
            icon={icons.Document}
            title={translate('report.newReport.createReport')}
            onPress={createReport}
            shouldCallAfterModalHide={shouldUseNarrowLayout}
        />
    );
}

export default CreateReportMenuItem;
