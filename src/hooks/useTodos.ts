import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';
import type {OnyxCollection} from 'react-native-onyx';
import type {ReportNameValuePairs, Policy, Report, Transaction, TransactionViolation} from '@src/types/onyx';
import CONST from '@src/CONST';
import {canSubmitReport, canApproveIOU} from '@src/libs/actions/IOU';
import {canPay, canExport} from '@src/libs/ReportPreviewActionUtils';

/**
 * Creates a selector that filters an Onyx collection based on a predicate.
 * The predicate receives the item and the ID extracted from the collection key.
 */
function createCollectionSelector<T>(collectionPrefix: string, predicate: (item: T, id: string) => boolean) {
    return (collection: OnyxCollection<T>): Record<string, T> => {
        return Object.entries(collection ?? {}).reduce<Record<string, T>>((acc, [key, item]) => {
            const id = key.replace(collectionPrefix, '');
            if (item && predicate(item, id)) {
                acc[key] = item;
            }
            return acc;
        }, {});
    };
}

export default function useTodos() {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        canBeMissing: false,
        selector: createCollectionSelector<Report>(ONYXKEYS.COLLECTION.REPORT, (report) => report.type === CONST.REPORT.TYPE.EXPENSE),
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
        selector: createCollectionSelector<ReportNameValuePairs>(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, (_, id) => reportIDs.has(id)),
    });

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        canBeMissing: false,
        selector: createCollectionSelector<Policy>(ONYXKEYS.COLLECTION.POLICY, (policy) => !!policy.id && policyIDs.has(policy.id)),
    });

    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        canBeMissing: false,
        selector: createCollectionSelector<Transaction>(ONYXKEYS.COLLECTION.TRANSACTION, (transaction) => !!transaction.reportID && reportIDs.has(transaction.reportID)),
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
        selector: createCollectionSelector<TransactionViolation[]>(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, (_, id) => transactionIDs.has(id)),
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
        if (canPay(value, transactions, transactionViolations, '')) {
            reportsToPay.push(key);
            continue;
        }
        if (canExport(value, transactions, transactionViolations, '')) {
            reportsToExport.push(key);
            continue;
        }
    });

    return {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport};
}
