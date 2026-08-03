import Button from '@components/ButtonComposed';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
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
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            onPress={() => {
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
                const iouAction = duplicateTransaction ? getIOUActionForTransactionID(reportActions, duplicateTransaction.transactionID) : undefined;
                let threadID = transactionThreadReportID ?? iouAction?.childReportID;

                if (threadID) {
                    if (iouAction) {
                        setOptimisticTransactionThread(threadID, moneyRequestReport?.reportID, iouAction.reportActionID, moneyRequestReport?.policyID);
                    }
                } else if (duplicateTransaction) {
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

                const reportIDToNavigate = threadID;
                if (reportIDToNavigate) {
                    requestAnimationFrame(() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW.getRoute(reportIDToNavigate))));
                }
            }}
        >
            <Button.Text>{translate('iou.reviewDuplicates')}</Button.Text>
        </Button>
    );
}

export default ReviewDuplicatesPrimaryAction;
