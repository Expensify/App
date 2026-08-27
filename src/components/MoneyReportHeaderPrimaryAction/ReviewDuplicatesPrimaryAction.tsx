import Button from '@components/ButtonComposed';
import {usePersonalDetails} from '@components/OnyxListItemProvider';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getIOUActionForReportID} from '@libs/ReportActionsUtils';
import {getOrCreateTransactionThreadReportID} from '@libs/TransactionThreadNavigationUtils';
import {isDuplicate} from '@libs/TransactionUtils';

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
    const personalDetails = usePersonalDetails();

    const {moneyRequestReport, transactionThreadReportID} = useTransactionThreadData(reportID, chatReportID);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [ownerLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(moneyRequestReport?.ownerAccountID)});

    const {transactions: reportTransactionsMap} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);
    const transactions = Object.values(reportTransactionsMap);

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
    const duplicateIOUAction = getIOUActionForReportID(moneyRequestReport?.reportID, duplicateTransaction?.transactionID);
    const duplicateThreadReportID = duplicateIOUAction?.childReportID;
    const [duplicateThreadReportExists] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(duplicateThreadReportID)}`, {selector: (report) => !!report?.reportID});

    return (
        <Button
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            onPress={() => {
                const threadID =
                    transactionThreadReportID ??
                    (duplicateTransaction
                        ? getOrCreateTransactionThreadReportID(
                              {
                                  threadReportID: duplicateThreadReportID,
                                  threadReportExists: !!duplicateThreadReportExists,
                                  iouReport: moneyRequestReport,
                                  iouReportAction: duplicateIOUAction,
                                  transaction: duplicateTransaction,
                              },
                              {introSelected, betas, conciergeChat, currentUserEmail: email, currentUserAccountID: accountID, personalDetails},
                          )
                        : undefined);
                if (threadID) {
                    // Navigate on the microtask queue so the optimistic transaction thread is committed to Onyx before we navigate.
                    Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW.getRoute(threadID))));
                }
            }}
        >
            <Button.Text>{translate('iou.reviewDuplicates')}</Button.Text>
        </Button>
    );
}

export default ReviewDuplicatesPrimaryAction;
