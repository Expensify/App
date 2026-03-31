import React from 'react';
import Button from '@components/Button';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions, getThreadReportIDsForTransactions} from '@libs/MoneyRequestReportUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getFilteredReportActionsForReportView, getIOUActionForReportID, getOneTransactionThreadReportID} from '@libs/ReportActionsUtils';
import {isDuplicate} from '@libs/TransactionUtils';
import {createTransactionThreadReport} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SimpleActionProps} from './types';

function ReviewDuplicatesPrimaryAction({reportID, chatReportID}: SimpleActionProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {accountID, email} = useCurrentUserPersonalDetails();

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);

    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(moneyRequestReport?.reportID);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);
    const allReportTransactions = useReportTransactionsCollection(reportID);
    const nonDeletedTransactions = getAllNonDeletedTransactions(allReportTransactions, reportActions, isOffline, true);
    const visibleTransactions = nonDeletedTransactions?.filter((t) => isOffline || t.pendingAction !== 'delete');
    const reportTransactionIDs = visibleTransactions?.map((t) => t.transactionID);
    const transactionThreadReportID = getOneTransactionThreadReportID(moneyRequestReport, chatReport, reportActions ?? [], isOffline, reportTransactionIDs);

    const {transactions: reportTransactionsMap} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);
    const transactions = Object.values(reportTransactionsMap);

    return (
        <Button
            success
            text={translate('iou.reviewDuplicates')}
            onPress={() => {
                let threadID: string | undefined | null = transactionThreadReportID;
                if (!threadID) {
                    const duplicateTransaction = transactions.find((reportTransaction) =>
                        isDuplicate(
                            reportTransaction,
                            email ?? '',
                            accountID,
                            moneyRequestReport,
                            policy,
                            allTransactionViolations?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + reportTransaction.transactionID],
                        ),
                    );
                    if (duplicateTransaction) {
                        const existingThreadID = getThreadReportIDsForTransactions(reportActions, [duplicateTransaction]).at(0);
                        if (existingThreadID) {
                            threadID = existingThreadID;
                        } else {
                            const transactionID = duplicateTransaction.transactionID;
                            const iouAction = getIOUActionForReportID(moneyRequestReport?.reportID, transactionID);
                            const createdTransactionThreadReport = createTransactionThreadReport(introSelected, email ?? '', accountID, moneyRequestReport, iouAction);
                            threadID = createdTransactionThreadReport?.reportID;
                        }
                    }
                }
                if (threadID) {
                    Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_PAGE.getRoute(threadID));
                }
            }}
        />
    );
}

export default ReviewDuplicatesPrimaryAction;
