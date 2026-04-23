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

    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const {moneyRequestReport, isOffline, reportActions, transactionThreadReportID, requestParentReportAction} = useTransactionThreadData(reportID, chatReportID);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);

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
                        changeMoneyRequestHoldStatus(action, getLinkedIOUTransaction(action, transactions), isOffline);
                    }
                    return;
                }

                const moneyRequestAction = transactionThreadReportID ? requestParentReportAction : parentReportAction;
                if (!moneyRequestAction) {
                    return;
                }
                changeMoneyRequestHoldStatus(moneyRequestAction, getLinkedIOUTransaction(moneyRequestAction, transactions), isOffline);
            }}
        />
    );
}

export default RemoveHoldPrimaryAction;
