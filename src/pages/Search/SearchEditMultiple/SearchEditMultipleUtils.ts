import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {getTagArrayFromName} from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportActions, Transaction} from '@src/types/onyx';

/**
 * Returns the longest common dependent tag prefix for the provided transactions.
 * If there is no shared parent tag, returns undefined.
 */
function getCommonDependentTag(transactions: Array<OnyxEntry<Transaction> | undefined>): string | undefined {
    if (transactions.length === 0) {
        return;
    }

    const tagArrays = transactions.map((transaction) => getTagArrayFromName(transaction?.tag ?? ''));
    if (tagArrays.some((tagArray) => !tagArray.at(0))) {
        return;
    }

    const commonTags: string[] = [];
    const firstTagArray = tagArrays.at(0) ?? [];

    for (let index = 0; index < firstTagArray.length; index++) {
        const currentTag = firstTagArray.at(index);
        if (!currentTag) {
            break;
        }

        if (tagArrays.every((tagArray) => tagArray.at(index) === currentTag)) {
            commonTags.push(currentTag);
            continue;
        }

        break;
    }

    return commonTags.length > 0 ? commonTags.join(':') : undefined;
}

/**
 * Returns the transaction, report, reportAction, and policy for a given transaction ID.
 * Returns null if the transaction is not found.
 */
function getTransactionEditContext(
    transactionID: string,
    allTransactions: OnyxCollection<Transaction> | undefined,
    allReports: OnyxCollection<Report> | undefined,
    allReportActions: OnyxCollection<ReportActions> | undefined,
    policies: OnyxCollection<Policy> | undefined,
) {
    const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    if (!transaction) {
        return null;
    }
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`];
    const reportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transaction.reportID}`] ?? {};
    const reportAction = getIOUActionForTransactionID(Object.values(reportActions), transactionID);
    const transactionPolicy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];
    return {transaction, report, reportAction, transactionPolicy};
}

export {getCommonDependentTag, getTransactionEditContext};
