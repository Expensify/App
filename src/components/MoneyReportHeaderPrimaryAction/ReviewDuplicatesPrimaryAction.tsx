import Button from '@components/Button';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getThreadReportIDsForTransactions} from '@libs/MoneyRequestReportUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getIOUActionForReportID} from '@libs/ReportActionsUtils';
import {isDuplicate} from '@libs/TransactionUtils';

import {createTransactionThreadReport} from '@userActions/Report';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import {personalDetailsLoginSelector} from '@src/selectors/PersonalDetails';

import React from 'react';

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
    const [ownerLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(moneyRequestReport?.ownerAccountID)});

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
                            ownerLogin,
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
                            const createdTransactionThreadReport = createTransactionThreadReport({
                                introSelected,
                                currentUserLogin: email ?? '',
                                currentUserAccountID: accountID,
                                betas,
                                iouReport: moneyRequestReport,
                                iouReportAction: iouAction,
                            });
                            threadID = createdTransactionThreadReport?.reportID;
                        }
                    }
                }
                if (threadID) {
                    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW.path, ROUTES.REPORT_WITH_ID.getRoute(threadID)));
                }
            }}
        />
    );
}

export default ReviewDuplicatesPrimaryAction;
