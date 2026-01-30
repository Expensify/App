import {deepEqual} from 'fast-equals';
import React, {useMemo, useRef} from 'react';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useGetExpensifyCardFromReportAction from '@hooks/useGetExpensifyCardFromReportAction';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import {getReportActionBadge} from '@libs/ReportPrimaryActionUtils';
import {isExpenseReport as isExpenseReportUtils} from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import {getMovedReportID} from '@src/libs/ModifiedExpenseMessage';
import type {OptionData} from '@src/libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList} from '@src/types/onyx';
import OptionRowLHN from './OptionRowLHN';
import type {OptionRowLHNDataProps} from './types';

const getEmptyObject = <T,>() => ({}) as T;

/*
 * This component gets the data from onyx for the actual
 * OptionRowLHN component.
 * The OptionRowLHN component is memoized, so it will only
 * re-render if the data really changed.
 */
function OptionRowLHNData({
    isOptionFocused = false,
    fullReport,
    reportAttributes,
    oneTransactionThreadReport,
    reportNameValuePairs,
    reportActions,
    personalDetails = {},
    preferredLocale = CONST.LOCALES.DEFAULT,
    policy,
    invoiceReceiverPolicy,
    receiptTransactions,
    parentReportAction,
    iouReportReportActions,
    transaction,
    lastReportActionTransaction,
    transactionViolations,
    lastMessageTextFromReport,
    localeCompare,
    translate,
    isReportArchived = false,
    lastAction,
    lastActionReport,
    currentUserAccountID,
    ...propsToForward
}: OptionRowLHNDataProps) {
    const reportID = propsToForward.reportID;
    const {currentReportID: currentReportIDValue} = useCurrentReportIDState();
    const isReportFocused = isOptionFocused && currentReportIDValue === reportID;
    const optionItemRef = useRef<OptionData | undefined>(undefined);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserLogin = currentUserPersonalDetails.login ?? '';

    const [movedFromReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(lastAction, CONST.REPORT.MOVE_TYPE.FROM)}`, {canBeMissing: true});
    const [movedToReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(lastAction, CONST.REPORT.MOVE_TYPE.TO)}`, {canBeMissing: true});

    // Only fetch bankAccountList for expense reports to avoid unnecessary data fetching and re-renders
    const isExpenseReport = isExpenseReportUtils(fullReport);
    const [bankAccountList = getEmptyObject<BankAccountList>()] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {
        canBeMissing: true,
        // Return empty object for non-expense reports to prevent unnecessary subscriptions
        selector: isExpenseReport ? undefined : () => getEmptyObject<BankAccountList>(),
    });
    // Check the report errors equality to avoid re-rendering when there are no changes
    const prevReportErrors = usePrevious(reportAttributes?.reportErrors);
    const areReportErrorsEqual = useMemo(() => deepEqual(prevReportErrors, reportAttributes?.reportErrors), [prevReportErrors, reportAttributes?.reportErrors]);

    const card = useGetExpensifyCardFromReportAction({reportAction: lastAction, policyID: fullReport?.policyID});

    const optionItem = useMemo(() => {
        // Note: ideally we'd have this as a dependent selector in onyx!
        const item = SidebarUtils.getOptionData({
            report: fullReport,
            reportAttributes,
            oneTransactionThreadReport,
            reportNameValuePairs,
            personalDetails,
            policy,
            parentReportAction,
            lastMessageTextFromReport,
            invoiceReceiverPolicy,
            card,
            lastAction,
            translate,
            localeCompare,
            isReportArchived,
            lastActionReport,
            movedFromReport,
            movedToReport,
            currentUserAccountID,
        });
        if (deepEqual(item, optionItemRef.current)) {
            return optionItemRef.current;
        }

        optionItemRef.current = item;

        return item;
        // Listen parentReportAction to update title of thread report when parentReportAction changed
        // Listen to transaction to update title of transaction report when transaction changed
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        fullReport,
        reportAttributes?.brickRoadStatus,
        reportAttributes?.reportName,
        areReportErrorsEqual,
        oneTransactionThreadReport,
        reportNameValuePairs,
        lastReportActionTransaction,
        reportActions,
        personalDetails,
        preferredLocale,
        policy,
        parentReportAction,
        iouReportReportActions,
        transaction,
        receiptTransactions,
        invoiceReceiverPolicy,
        lastMessageTextFromReport,
        card,
        translate,
        localeCompare,
        isReportArchived,
        movedFromReport,
        movedToReport,
        currentUserAccountID,
    ]);

    // Compute action badge for expense reports
    const actionBadge = useMemo(() => {
        if (!isExpenseReport || !fullReport) {
            return null;
        }

        // Convert receiptTransactions collection to array
        const reportTransactions = receiptTransactions ? Object.values(receiptTransactions).filter((t): t is NonNullable<typeof t> => t !== null && t !== undefined) : [];

        // Convert reportActions object to array
        const reportActionsList = reportActions ? Object.values(reportActions).filter((a): a is NonNullable<typeof a> => a !== null && a !== undefined) : [];

        return getReportActionBadge({
            report: fullReport,
            currentUserAccountID,
            currentUserLogin,
            bankAccountList,
            policy,
            reportNameValuePairs,
            reportTransactions,
            reportActions: reportActionsList,
        });
    }, [isExpenseReport, fullReport, receiptTransactions, reportActions, currentUserAccountID, currentUserLogin, bankAccountList, policy, reportNameValuePairs]);

    return (
        <OptionRowLHN
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...propsToForward}
            isOptionFocused={isReportFocused}
            optionItem={optionItem}
            report={fullReport}
            actionBadge={actionBadge}
        />
    );
}

OptionRowLHNData.displayName = 'OptionRowLHNData';

/**
 * This component is rendered in a list.
 * On scroll we want to avoid that a item re-renders
 * just because the list has to re-render when adding more items.
 * Thats also why the React.memo is used on the outer component here, as we just
 * use it to prevent re-renders from parent re-renders.
 */
export default React.memo(OptionRowLHNData);
