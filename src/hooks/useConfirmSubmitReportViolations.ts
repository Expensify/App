import type {Policy, Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useConfirmSubmitViolations from './useConfirmSubmitViolations';
import useTransactionsAndViolationsForReport from './useTransactionsAndViolationsForReport';

type UseConfirmSubmitReportViolationsParams = {
    reportID: string | undefined;
    report: OnyxEntry<Report>;
    policy: OnyxEntry<Policy>;
    shouldShowMarkAsDoneCopy?: boolean;
    shouldDeferForPopoverDismiss?: boolean;
};

/** Reads the report's transactions and violations by reportID, then works like useConfirmSubmitViolations. */
function useConfirmSubmitReportViolations({reportID, report, policy, shouldShowMarkAsDoneCopy, shouldDeferForPopoverDismiss}: UseConfirmSubmitReportViolationsParams) {
    const {transactions, violations} = useTransactionsAndViolationsForReport(reportID);

    return useConfirmSubmitViolations({
        report,
        policy,
        shouldShowMarkAsDoneCopy,
        shouldDeferForPopoverDismiss,
        transactions: Object.values(transactions),
        violationsCollection: violations,
    });
}

export default useConfirmSubmitReportViolations;
