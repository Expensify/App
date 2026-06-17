import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React from 'react';
import Button from '@components/Button';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getReportAction} from '@libs/ReportActionsUtils';
import {getAllExpensesToHoldIfApplicable} from '@libs/ReportPrimaryActionUtils';
import {changeMoneyRequestHoldStatus, getLinkedIOUTransaction} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SimpleActionProps} from './types';
import useTransactionThreadData from './useTransactionThreadData';

function RemoveHoldPrimaryAction({reportID, chatReportID}: SimpleActionProps) {
    const {translate} = useLocalize();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    const {login: currentUserLogin, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const {moneyRequestReport, isOffline, reportActions, transactionThreadReportID, requestParentReportAction} = useTransactionThreadData(reportID, chatReportID);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    const {transactions: reportTransactionsMap} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);
    const transactions = Object.values(reportTransactionsMap);

    return (
        <Button
            success
            text={translate('iou.unhold')}
            onPress={() => {
                if (isDelegateAccessRestricted) {
                    showDelegateNoAccessModal();
                    return;
                }

                const parentReportAction = getReportAction(moneyRequestReport?.parentReportID, moneyRequestReport?.parentReportActionID);
                const IOUActions = getAllExpensesToHoldIfApplicable(moneyRequestReport, reportActions, transactions, policy, currentUserAccountID);

                if (IOUActions.length) {
                    for (const action of IOUActions) {
                        const linkedTransaction = getLinkedIOUTransaction(action, transactions);
                        const transactionViolations = allTransactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${linkedTransaction?.transactionID}`];
                        changeMoneyRequestHoldStatus(action, linkedTransaction, isOffline, currentUserLogin ?? '', currentUserAccountID, transactionViolations, isTrackIntentUser);
                    }
                    return;
                }

                const moneyRequestAction = transactionThreadReportID ? requestParentReportAction : parentReportAction;
                if (!moneyRequestAction) {
                    return;
                }

                const linkedTransaction = getLinkedIOUTransaction(moneyRequestAction, transactions);
                const transactionViolations = allTransactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${linkedTransaction?.transactionID}`];
                changeMoneyRequestHoldStatus(moneyRequestAction, linkedTransaction, isOffline, currentUserLogin ?? '', currentUserAccountID, transactionViolations, isTrackIntentUser);
            }}
        />
    );
}

export default RemoveHoldPrimaryAction;
