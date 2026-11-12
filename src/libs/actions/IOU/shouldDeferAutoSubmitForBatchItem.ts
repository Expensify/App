import {isInstantSubmitEnabled, isSubmitAndClose} from '@libs/PolicyUtils';
import {getChatReportFromMoneyRequestReport, isMoneyRequestReport, shouldCreateNewMoneyRequestReport} from '@libs/ReportUtils';
import {getReimbursable, isScanRequest} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type {IOUAction} from '@src/CONST';
import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import type Rule from '@src/types/onyx/Rule';
import type Transaction from '@src/types/onyx/Transaction';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

type ShouldDeferAutoSubmitForBatchItemParams = {
    index: number;
    transactions: Transaction[];
    report: OnyxEntry<Report>;
    existingIOUReport?: OnyxEntry<Report>;
    policy: OnyxEntry<Policy>;
    rules: OnyxCollection<Rule>;
    isASAPSubmitBetaEnabled: boolean;
    action: IOUAction;
};

function shouldDeferAutoSubmitForBatchItem({
    index,
    transactions,
    report,
    existingIOUReport,
    policy,
    rules,
    isASAPSubmitBetaEnabled,
    action,
}: ShouldDeferAutoSubmitForBatchItemParams): boolean {
    if (index >= transactions.length - 1) {
        return false;
    }

    if (!isASAPSubmitBetaEnabled || !isInstantSubmitEnabled(policy) || !isSubmitAndClose(policy)) {
        return false;
    }

    const transaction = transactions.at(index);
    const nextTransaction = transactions.at(index + 1);
    const isPinnedReport = isMoneyRequestReport(report);
    const chatReport = getChatReportFromMoneyRequestReport(report);

    const currentReport = existingIOUReport ?? (isPinnedReport ? report : undefined);

    if (!currentReport) {
        return joinsReportNotBuiltYet(nextTransaction, isPinnedReport, action);
    }

    const joinsCurrentReport = !shouldCreateNewMoneyRequestReport(currentReport, chatReport, isScanRequest(transaction), isASAPSubmitBetaEnabled, rules, action, isPinnedReport);
    if (!joinsCurrentReport) {
        return joinsReportNotBuiltYet(nextTransaction, isPinnedReport, action);
    }

    return !shouldCreateNewMoneyRequestReport(currentReport, chatReport, isScanRequest(nextTransaction), isASAPSubmitBetaEnabled, rules, action, isPinnedReport);
}

function joinsReportNotBuiltYet(nextTransaction: OnyxEntry<Transaction>, isPinnedReport: boolean, action: IOUAction): boolean {
    const splitsPerItem = !isPinnedReport && action !== CONST.IOU.ACTION.SUBMIT;
    return !(splitsPerItem && isScanRequest(nextTransaction));
}

export default shouldDeferAutoSubmitForBatchItem;
