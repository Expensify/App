import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';
import { OnyxCollection } from 'react-native-onyx';
import type {ReportNameValuePairs, Policy, Report, Transaction, TransactionViolation} from '@src/types/onyx';
import CONST from '@src/CONST';

export default function useTodos() {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false, selector: (reports: OnyxCollection<Report>) => {
        return Object.entries(reports ?? {}).reduce<Record<string, Report>>((acc, [key, report]) => {
            if (report?.type === CONST.REPORT.TYPE.EXPENSE) {
                acc[key] = report;
            }
            return acc;
        }, {});
    }});
    const reportIDs = new Set<string>();
    const policyIDs = new Set<string>();
    const transactionIDs = new Set<string>();

    if (allReports) {
        Object.values(allReports).forEach(report => {
            if (!report?.reportID || !report?.policyID) {
                return;
            }
            reportIDs.add(report.reportID);
            policyIDs.add(report.policyID);
        });
    }

    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {canBeMissing: false, selector: (reportNameValuePairs: OnyxCollection<ReportNameValuePairs>) => {
        return Object.entries(reportNameValuePairs ?? {}).reduce<Record<string, ReportNameValuePairs>>((acc, [key, nvp]) => {
            const reportID = key.replace(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, '');
            if (reportIDs.has(reportID) && nvp) {
                acc[key] = nvp;
            }
            return acc;
        }, {});
    }});

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false, selector: (policies: OnyxCollection<Policy>) => {
        return Object.entries(policies ?? {}).reduce<Record<string, Policy>>((acc, [key, policy]) => {
            if (policy?.id && policyIDs.has(policy.id)) {
                acc[key] = policy;
            }
            return acc;
        }, {});
    }});

    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: false, selector: (transactions: OnyxCollection<Transaction>) => {
        return Object.entries(transactions ?? {}).reduce<Record<string, Transaction>>((acc, [key, transaction]) => {
            if (transaction?.reportID && reportIDs.has(transaction.reportID)) {
                acc[key] = transaction;
            }
            return acc;
        }, {});
    }});

    if (transactions) {
        Object.values(transactions).forEach(transaction => {
            if (!transaction?.transactionID) {
                return;
            }
            transactionIDs.add(transaction.transactionID);
        });
    }

    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: false, selector: (transactionViolations: OnyxCollection<TransactionViolation[]>) => {
        return Object.entries(transactionViolations ?? {}).reduce<Record<string, TransactionViolation[]>>((acc, [key, violations]) => {
            const transactionID = key.replace(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, '');
            if (transactionIDs.has(transactionID) && violations) {
                acc[key] = violations;
            }
            return acc;
        }, {});
    }});

    const reportsToSubmit = [];
    const reportsToApprove = [];
    const reportsToPay = [];
    const reportsToExport = [];

    

    return {};
}
