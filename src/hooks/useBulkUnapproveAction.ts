/**
 * Unapprove bulk action for Search. Decides which selected reports the user can unapprove and unapproves them,
 * one request per loaded report or one backend job for every report matching the search when "Select all" is checked.
 */
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import {useSearchSelectionActions} from '@components/Search/SearchContext';
import type {SearchQueryJSON, SelectedReports, SelectedTransactions} from '@components/Search/types';

import {unapproveExpenseReport} from '@libs/actions/IOU/ReportWorkflow';
import {getPolicyFromSearchSnapshot, getReportFromSearchSnapshot, getSearchUnapproveOnyxData, queueBulkUnapproveReports} from '@libs/actions/Search';
import Log from '@libs/Log';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {isUnapproveAction} from '@libs/ReportSecondaryActionUtils';
import {hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import type {SearchKey} from '@libs/SearchKeyUtils';
import {getAllMatchingReportQuery, serializeQueryJSONForBackend} from '@libs/SearchQueryUtils';
import showConfirmModalAfterMoreMenuDismiss from '@libs/showConfirmModalAfterMoreMenuDismiss';
import playSound, {SOUNDS} from '@libs/Sound';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';
import type {SearchResultDataType} from '@src/types/onyx/SearchResults';

import type {OnyxCollection} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';

import useConfirmModal from './useConfirmModal';
import {useCurrencyListActions} from './useCurrencyList';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePaymentContext from './usePaymentContext';
import usePermissions from './usePermissions';

type UseBulkUnapproveActionParams = {
    queryJSON: SearchQueryJSON | undefined;
    selectedReports: SelectedReports[];
    areAllMatchingItemsSelected: boolean;
    excludedTransactions: SelectedTransactions;
    searchData: SearchResultDataType | undefined;
    currentSearchKey: SearchKey | undefined;
    allReports: OnyxCollection<Report>;
    policies: OnyxCollection<Policy>;
};

function useBulkUnapproveAction({
    queryJSON,
    selectedReports,
    areAllMatchingItemsSelected,
    excludedTransactions,
    searchData,
    currentSearchKey,
    allReports,
    policies,
}: UseBulkUnapproveActionParams) {
    const {translate} = useLocalize();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {showConfirmModal} = useConfirmModal();
    const {accountID, email, login: currentUserLogin} = useCurrentUserPersonalDetails();
    const {delegateEmail} = usePaymentContext();
    const {isBetaEnabled} = usePermissions();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    // Search rows carry no unapprove action, so each selected report is checked with the rule the report's More menu uses.
    const canUnapproveSelectedReport = (selectedReport: SelectedReports) => {
        const report = getReportFromSearchSnapshot(selectedReport.reportID, searchData, allReports);
        if (!report) {
            return false;
        }
        const policy = getPolicyFromSearchSnapshot(report.policyID, searchData, policies);
        return isUnapproveAction(currentUserLogin ?? '', accountID, report, policy);
    };

    const unapproveSelectedReports = async () => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }

        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }

        if (!queryJSON?.hash) {
            return;
        }
        const {hash} = queryJSON;

        const uniqueReportIDs = [...new Set(selectedReports.map((report) => report.reportID).filter((reportID): reportID is string => !!reportID))];

        // Unapproving an exported report can leave it out of sync with the accounting integration, so ask first.
        // Only loaded reports can be checked, so "Select all" may still include exported reports that are not on screen.
        const exportedReportCount = uniqueReportIDs.filter((reportID) => !!getReportFromSearchSnapshot(reportID, searchData, allReports)?.isExportedToIntegration).length;
        if (exportedReportCount > 0) {
            const result = await showConfirmModalAfterMoreMenuDismiss(showConfirmModal, {
                title: translate('search.bulkActions.unapprove'),
                prompt: translate('search.bulkActions.unapproveExportedReportsWarning', {count: exportedReportCount}),
                confirmText: translate('search.bulkActions.unapprove'),
                cancelText: translate('common.cancel'),
                buttonVariant: CONST.BUTTON_VARIANT.DANGER,
            });
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
        }

        // "Select all" can cover more reports than are loaded, so hand the search query to the backend to unapprove every match.
        if (areAllMatchingItemsSelected) {
            const allMatchingQuery = getAllMatchingReportQuery(queryJSON, excludedTransactions);
            if (!allMatchingQuery) {
                Log.info('[BulkUnapprove] Dropping bulk unapprove: report exclusion has no reportID');
                return;
            }
            queueBulkUnapproveReports(serializeQueryJSONForBackend(allMatchingQuery));
            playSound(SOUNDS.SUCCESS);
            clearSelectedTransactions();
            return;
        }

        const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

        let unapprovedReportCount = 0;
        for (const reportID of uniqueReportIDs) {
            const expenseReport = getReportFromSearchSnapshot(reportID, searchData, allReports);
            if (!expenseReport) {
                Log.info('[BulkUnapprove] Skipping report: expense report not found in the search snapshot or Onyx', false, {reportID});
                continue;
            }

            const reportPolicy = getPolicyFromSearchSnapshot(expenseReport.policyID, searchData, policies);
            const hasViolations = hasViolationsReportUtils(reportID, allTransactionViolations, accountID, email ?? '');
            unapproveExpenseReport({
                expenseReport,
                policy: reportPolicy,
                currentUserAccountIDParam: accountID,
                currentUserEmailParam: email ?? '',
                hasViolations,
                isASAPSubmitBetaEnabled,
                delegateEmail,
                isTrackIntentUser,
                getCurrencyDecimals,
                rules,
                additionalOnyxData: getSearchUnapproveOnyxData(hash, reportID, currentSearchKey),
            });
            unapprovedReportCount += 1;
        }

        if (unapprovedReportCount > 0) {
            playSound(SOUNDS.SUCCESS);
            TransitionTracker.runAfterTransitions({
                callback: () => {
                    clearSelectedTransactions();
                },
            });
        }
    };

    return {canUnapproveSelectedReport, unapproveSelectedReports};
}

export default useBulkUnapproveAction;
