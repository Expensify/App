import Button from '@components/ButtonComposed';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getIOUActionForReportID} from '@libs/ReportActionsUtils';
import {getReportOrDraftReport} from '@libs/ReportUtils';
import {isDuplicate} from '@libs/TransactionUtils';

import {createTransactionThreadReport, setOptimisticTransactionThread} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import {personalDetailsLoginSelector} from '@src/selectors/PersonalDetails';

import React from 'react';

import type {SimpleActionProps} from './types';

import useTransactionThreadData from './useTransactionThreadData';

function ReviewDuplicatesPrimaryAction({reportID, chatReportID}: SimpleActionProps) {
    const {translate} = useLocalize();
    const {accountID, email} = useCurrentUserPersonalDetails();

    const {moneyRequestReport, transactionThreadReportID} = useTransactionThreadData(reportID, chatReportID);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [ownerLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(moneyRequestReport?.ownerAccountID)});

    const {transactions: reportTransactionsMap} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);
    const transactions = Object.values(reportTransactionsMap);

    return (
        <Button
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            onPress={async () => {
                if (transactionThreadReportID) {
                    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW.getRoute(transactionThreadReportID)));
                    return;
                }

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
                if (!duplicateTransaction) {
                    return;
                }

                const iouAction = getIOUActionForReportID(moneyRequestReport?.reportID, duplicateTransaction.transactionID);
                let threadID = iouAction?.childReportID;

                if (threadID) {
                    if (!getReportOrDraftReport(threadID)?.reportID) {
                        await setOptimisticTransactionThread(threadID, moneyRequestReport?.reportID, iouAction?.reportActionID, moneyRequestReport?.policyID);
                    }
                } else {
                    const createdTransactionThreadReport = createTransactionThreadReport({
                        introSelected,
                        currentUserLogin: email ?? '',
                        currentUserAccountID: accountID,
                        betas,
                        iouReport: moneyRequestReport,
                        iouReportAction: iouAction,
                        transaction: duplicateTransaction,
                    });
                    threadID = createdTransactionThreadReport?.reportID;
                }

                if (threadID) {
                    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW.getRoute(threadID)));
                }
            }}
        >
            <Button.Text>{translate('iou.reviewDuplicates')}</Button.Text>
        </Button>
    );
}

export default ReviewDuplicatesPrimaryAction;
