import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';
import type {OnyxCollection} from 'react-native-onyx';
import type {ReportNameValuePairs, Policy, Report, Transaction, TransactionViolation} from '@src/types/onyx';
import CONST from '@src/CONST';
import {canSubmitReport, canApproveIOU} from '@src/libs/actions/IOU';

export default function useTodos() {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        canBeMissing: false,
        selector: (collection: OnyxCollection<Report>): Record<string, Report> => {
            return Object.entries(collection ?? {}).reduce<Record<string, Report>>((acc, [key, item]) => {
                if (item && item.reportID && item.type === CONST.REPORT.TYPE.EXPENSE) {
                    acc[item.reportID] = item;
                }
                return acc;
            }, {});
        },
    });
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

    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {
        canBeMissing: false,
        selector: (collection: OnyxCollection<ReportNameValuePairs>): Record<string, ReportNameValuePairs> => {
            return Object.entries(collection ?? {}).reduce<Record<string, ReportNameValuePairs>>((acc, [key, item]) => {
                const reportID = key.replace(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, '');
                if (item && reportIDs.has(reportID)) {
                    acc[reportID] = item;
                }
                return acc;
            }, {});
        },
    });

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        canBeMissing: false,
        selector: (collection: OnyxCollection<Policy>): Record<string, Policy> => {
            return Object.entries(collection ?? {}).reduce<Record<string, Policy>>((acc, [key, item]) => {
                if (item && item.id && policyIDs.has(item.id)) {
                    acc[item.id] = item;
                }
                return acc;
            }, {});
        },
    });

    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        canBeMissing: false,
        selector: (collection: OnyxCollection<Transaction>): Record<string, Transaction> => {
            return Object.entries(collection ?? {}).reduce<Record<string, Transaction>>((acc, [key, item]) => {
                if (item && item.reportID && reportIDs.has(item.reportID)) {
                    acc.hasOwnProperty(item.reportID) ? acc[item.reportID].push(item) : acc[item.reportID] = [item];
                }
                return acc;
            }, {});
        },
    });

    if (transactions) {
        Object.values(transactions).forEach(transaction => {
            if (!transaction?.transactionID) {
                return;
            }
            transactionIDs.add(transaction.transactionID);
        });
    }

    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {
        canBeMissing: false,
        selector: (collection: OnyxCollection<TransactionViolation[]>): Record<string, TransactionViolation[]> => {
            return Object.entries(collection ?? {}).reduce<Record<string, TransactionViolation[]>>((acc, [key, item]) => {
                const id = key.replace(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, '');
                if (item && transactionIDs.has(id)) {
                    acc[key] = item;
                }
                return acc;
            }, {});
        },
    });

    const reportsToSubmit: string[] = [];
    const reportsToApprove: string[] = [];
    const reportsToPay: string[] = [];
    const reportsToExport: string[] = [];

    if (!allReports) {
        return {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport};
    }

    Object.entries(allReports).forEach([key, value] => {
        const report = value;
        const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
        const transactions = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${report.reportID}`];
        const transactionViolations = transactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${report.reportID}`];
        const isReportArchived = false;

        if (canSubmitReport(value, policies?.[value.policyID], transactions, transactionViolations, false, '')) {
            reportsToSubmit.push(key);
            continue;
        }
        if (canApproveReport(value, transactions, transactionViolations, '')) {
            reportsToApprove.push(key);
            continue;
        }
    });

    return {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport};
}
