import type {Policy, Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useConfirmSubmitViolations from './useConfirmSubmitViolations';
import useTransactionsAndViolationsForReport from './useTransactionsAndViolationsForReport';

type UseConfirmSubmitReportViolationsParams = {
    reportID: string | undefined;
    report: OnyxEntry<Report>;
    policy: OnyxEntry<Policy>;
    shouldShowMarkAsDoneCopy?: boolean;
};

/**
 * Hook that returns a callback to confirm the violations of a report's transactions before proceeding with its submission.
 * It reads the report's transactions and violations; a caller that already has them uses useConfirmSubmitViolations instead.
 */
function useConfirmSubmitReportViolations({reportID, report, policy, shouldShowMarkAsDoneCopy}: UseConfirmSubmitReportViolationsParams) {
    const {transactions, violations} = useTransactionsAndViolationsForReport(reportID);

    return useConfirmSubmitViolations({report, policy, shouldShowMarkAsDoneCopy, transactions: Object.values(transactions), violationsCollection: violations});
}

export default useConfirmSubmitReportViolations;
