import confirmSubmitViolationsThenProceed from '@libs/Violations/confirmSubmitViolationsThenProceed';
import {getReportSubmitViolationSummary} from '@libs/Violations/getReportSubmitViolationSummary';

import type {Policy, Report, Transaction, TransactionViolations} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import useConfirmModal from './useConfirmModal';
import {useCurrencyListActions} from './useCurrencyList';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';
import useTransactionsAndViolationsForReport from './useTransactionsAndViolationsForReport';

/** Called once the submitter has either had nothing to confirm or explicitly confirmed the violations modal. */
type ConfirmSubmitReportViolationsOnProceed = (shouldResolveAcknowledgedViolations?: boolean) => void;

type UseConfirmSubmitReportViolationsParams = {
    reportID: string | undefined;
    report: OnyxEntry<Report>;
    policy: OnyxEntry<Policy>;
    shouldShowMarkAsDoneCopy?: boolean;
    transactions?: Array<OnyxEntry<Transaction>>;
    violationsCollection?: OnyxCollection<TransactionViolations>;
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
}: UseConfirmSubmitReportViolationsParams) {
    const {showConfirmModal} = useConfirmModal();
    const {translate, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {accountID: currentUserAccountID, email: currentUserEmail} = useCurrentUserPersonalDetails();
    const {transactions: ownedTransactions, violations: ownedViolationsCollection} = useTransactionsAndViolationsForReport(transactionsOverride ? undefined : reportID);

    const transactions = transactionsOverride ?? Object.values(ownedTransactions);
    const violationsCollection = violationsCollectionOverride ?? ownedViolationsCollection;

    return (onProceed: ConfirmSubmitReportViolationsOnProceed) => {
        const summary = getReportSubmitViolationSummary(transactions, violationsCollection, report, policy, currentUserEmail ?? '', currentUserAccountID);
        confirmSubmitViolationsThenProceed({
            summary,
            showConfirmModal,
            translate,
            dateFnsLocale,
            convertToDisplayString,
            shouldShowMarkAsDoneCopy,
            onProceed,
        });
    };
}

export default useConfirmSubmitReportViolations;
export type {ConfirmSubmitReportViolationsOnProceed};
