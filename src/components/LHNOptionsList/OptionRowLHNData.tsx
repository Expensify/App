import {deepEqual} from 'fast-equals';
import React, {useMemo, useRef} from 'react';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useGetExpensifyCardFromReportAction from '@hooks/useGetExpensifyCardFromReportAction';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import {getMovedReportID} from '@src/libs/ModifiedExpenseMessage';
import type {OptionData} from '@src/libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import OptionRowLHN from './OptionRowLHN';
import type {OptionRowLHNDataProps} from './types';

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

    const [movedFromReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(lastAction, CONST.REPORT.MOVE_TYPE.FROM)}`, {canBeMissing: true});
    const [movedToReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(lastAction, CONST.REPORT.MOVE_TYPE.TO)}`, {canBeMissing: true});

    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fullReport?.policyID}`, {canBeMissing: true});
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
            policyTags,
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
        policyTags,
        currentUserAccountID,
    ]);

    return (
        <OptionRowLHN
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...propsToForward}
            isOptionFocused={isReportFocused}
            optionItem={optionItem}
            report={fullReport}
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
