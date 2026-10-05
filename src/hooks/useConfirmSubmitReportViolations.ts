import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import confirmSubmitViolationsThenProceed from '@libs/Violations/confirmSubmitViolationsThenProceed';
import {getReportSubmitViolationSummary} from '@libs/Violations/getReportSubmitViolationSummary';

import {markPendingRTERTransactionsAsCash} from '@userActions/Transaction';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, Transaction, TransactionViolations} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import useConfirmModal from './useConfirmModal';
import {useCurrencyListActions} from './useCurrencyList';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import useTransactionsAndViolationsForReport from './useTransactionsAndViolationsForReport';

/** Called once the submitter has either had nothing to confirm or explicitly confirmed the violations modal. */
type ConfirmSubmitReportViolationsOnProceed = (shouldResolveAcknowledgedViolations?: boolean) => void;

type UseConfirmSubmitReportViolationsParams = {
    reportID: string | undefined;
    report: OnyxEntry<Report>;
    policy: OnyxEntry<Policy>;
    shouldShowMarkAsDoneCopy?: boolean;
    /**
     * Already-fetched transactions/violations/report actions, for a caller (e.g. a Search report preview) that
     * already subscribes to this data via a shared context and would otherwise duplicate the Onyx subscriptions
     * below for every row on screen. When omitted, the hook fetches its own via `reportID`.
     */
    transactions?: Array<OnyxEntry<Transaction>>;
    violationsCollection?: OnyxCollection<TransactionViolations>;
    reportActions?: ReportAction[];
};

/**
 * Hook that returns a callback to confirm any report violations (rejected expenses, pending RTER
 * card-match, and other policy violations) before proceeding with a report submission.
 */
function useConfirmSubmitReportViolations({
    reportID,
    report,
    policy,
    shouldShowMarkAsDoneCopy = false,
    transactions: transactionsOverride,
    violationsCollection: violationsCollectionOverride,
    reportActions: reportActionsOverride,
}: UseConfirmSubmitReportViolationsParams) {
    const {showConfirmModal} = useConfirmModal();
    const {translate, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {accountID: currentUserAccountID, email: currentUserEmail} = useCurrentUserPersonalDetails();
    const {transactions: ownedTransactions, violations: ownedViolationsCollection} = useTransactionsAndViolationsForReport(transactionsOverride ? undefined : reportID);
    const [ownedReportActionsCollection] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(reportActionsOverride ? undefined : reportID)}`);

    const transactions = transactionsOverride ?? Object.values(ownedTransactions);
    const violationsCollection = violationsCollectionOverride ?? ownedViolationsCollection;
    const reportActions = reportActionsOverride ?? Object.values(ownedReportActionsCollection ?? {});

    return (onProceed: ConfirmSubmitReportViolationsOnProceed) => {
        const summary = getReportSubmitViolationSummary(transactions, violationsCollection, report, policy, currentUserEmail ?? '', currentUserAccountID);
        confirmSubmitViolationsThenProceed({
            summary,
            showConfirmModal,
            translate,
            dateFnsLocale,
            convertToDisplayString,
            shouldShowMarkAsDoneCopy,
            onMarkPendingCardMatchAsCash: () => markPendingRTERTransactionsAsCash(transactions, violationsCollection, reportActions),
            onProceed,
        });
    };
}

export default useConfirmSubmitReportViolations;
export type {ConfirmSubmitReportViolationsOnProceed};
