import React from 'react';
import Button from '@components/Button';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getThreadReportIDsForTransactions} from '@libs/MoneyRequestReportUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getIOUActionForReportID} from '@libs/ReportActionsUtils';
import {isDuplicate} from '@libs/TransactionUtils';
import {createTransactionThreadReport} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SimpleActionProps} from './types';
import useTransactionThreadData from './useTransactionThreadData';

function ReviewDuplicatesPrimaryAction({reportID, chatReportID}: SimpleActionProps) {
    const {translate} = useLocalize();
    const {accountID, email} = useCurrentUserPersonalDetails();

    const {moneyRequestReport, reportActions, transactionThreadReportID} = useTransactionThreadData(reportID, chatReportID);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);

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
                            const createdTransactionThreadReport = createTransactionThreadReport(introSelected, email ?? '', accountID, betas, moneyRequestReport, iouAction);
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
