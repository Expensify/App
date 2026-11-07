/** Confirms locally available violations before approval, preserving offline behavior. */
import confirmApproveViolationsThenProceed from '@libs/Violations/confirmApproveViolationsThenProceed';
import getReportApproveViolationSummary from '@libs/Violations/getReportApproveViolationSummary';

import type {Policy, Report, Transaction, TransactionViolations} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import useConfirmModal from './useConfirmModal';
import {useCurrencyListActions} from './useCurrencyList';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';
import useTransactionsAndViolationsForReport from './useTransactionsAndViolationsForReport';

type UseConfirmApproveReportViolationsParams = {
    report: OnyxEntry<Report>;
    policy: OnyxEntry<Policy>;
    transactions?: Array<OnyxEntry<Transaction>>;
    violationsCollection?: OnyxCollection<TransactionViolations>;
};

function useConfirmApproveReportViolations({report, policy, transactions: transactionsOverride, violationsCollection: violationsOverride}: UseConfirmApproveReportViolationsParams) {
    const {showConfirmModal} = useConfirmModal();
    const {translate, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {accountID, email} = useCurrentUserPersonalDetails();
    const {transactions: ownedTransactions, violations: ownedViolations} = useTransactionsAndViolationsForReport(transactionsOverride ? undefined : report?.reportID);

    return (onProceed: () => void, full = true) => {
        const summary = getReportApproveViolationSummary(
            transactionsOverride ?? Object.values(ownedTransactions),
            violationsOverride ?? ownedViolations,
            report,
            policy,
            email ?? '',
            accountID,
            full,
        );
        confirmApproveViolationsThenProceed({summary, showConfirmModal, translate, dateFnsLocale, convertToDisplayString, onProceed});
    };
}

export default useConfirmApproveReportViolations;
