import confirmSubmitViolationsThenProceed from '@libs/Violations/confirmSubmitViolationsThenProceed';
import {getReportSubmitViolationSummary} from '@libs/Violations/getReportSubmitViolationSummary';

import type {Policy, Report, Transaction, TransactionViolations} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import useConfirmModal from './useConfirmModal';
import {useCurrencyListActions} from './useCurrencyList';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';

/** Called once the submitter has either had nothing to confirm or explicitly confirmed the violations modal. */
type ConfirmSubmitReportViolationsOnProceed = (shouldResolveAcknowledgedViolations?: boolean) => void;

type UseConfirmSubmitViolationsParams = {
    report: OnyxEntry<Report>;
    policy: OnyxEntry<Policy>;
    shouldShowMarkAsDoneCopy?: boolean;
    transactions: Array<OnyxEntry<Transaction>>;
    violationsCollection: OnyxCollection<TransactionViolations>;
};

/**
 * Hook that returns a callback to confirm the violations of the given transactions (rejected expenses, pending RTER
 * card-match, a missing merchant or amount, and other policy violations) before proceeding with a report submission.
 * It reads no report data itself, so a caller that already has the transactions does not re-render on every expense change.
 */
function useConfirmSubmitViolations({report, policy, shouldShowMarkAsDoneCopy = false, transactions, violationsCollection}: UseConfirmSubmitViolationsParams) {
    const {showConfirmModal} = useConfirmModal();
    const {translate, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {accountID: currentUserAccountID, email: currentUserEmail} = useCurrentUserPersonalDetails();

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

export default useConfirmSubmitViolations;
export type {ConfirmSubmitReportViolationsOnProceed};
