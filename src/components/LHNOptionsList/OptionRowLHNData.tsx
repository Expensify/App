import {deepEqual} from 'fast-equals';
import React, {useMemo, useRef} from 'react';
import useCurrentReportID from '@hooks/useCurrentReportID';
import * as ReportUtils from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import type {OptionData} from '@src/libs/ReportUtils';
import OptionRowLHN from './OptionRowLHN';
import type {OptionRowLHNDataProps} from './types';

/*
 * This component gets the data from onyx for the actual
 * OptionRowLHN component.
 * The OptionRowLHN component is memoized, so it will only
 * re-render if the data really changed.
 */
function OptionRowLHNData({
    isFocused = false,
    fullReport,
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
    ...propsToForward
}: OptionRowLHNDataProps) {
    const reportID = propsToForward.reportID;
    const currentReportIDValue = useCurrentReportID();
    const isReportFocused = isFocused && currentReportIDValue?.currentReportID === reportID;

    const optionItemRef = useRef<OptionData>();

    const shouldDisplayViolations = ReportUtils.shouldDisplayViolationsRBRInLHN(fullReport, transactionViolations);
    const isSettled = ReportUtils.isSettled(fullReport);
    const shouldDisplayReportViolations = !isSettled && ReportUtils.isReportOwner(fullReport) && ReportUtils.hasReportViolations(reportID);

    const optionItem = useMemo(() => {
        // Note: ideally we'd have this as a dependent selector in onyx!
        const item = SidebarUtils.getOptionData({
            report: fullReport,
            reportActions,
            personalDetails,
            preferredLocale: preferredLocale ?? CONST.LOCALES.DEFAULT,
            policy,
            parentReportAction,
            hasViolations: !!shouldDisplayViolations || shouldDisplayReportViolations,
            lastMessageTextFromReport,
            transactionViolations,
            invoiceReceiverPolicy,
        });
        // eslint-disable-next-line react-compiler/react-compiler
        if (deepEqual(item, optionItemRef.current)) {
            // eslint-disable-next-line react-compiler/react-compiler
            return optionItemRef.current;
        }

        // eslint-disable-next-line react-compiler/react-compiler
        optionItemRef.current = item;

        return item;
        // Listen parentReportAction to update title of thread report when parentReportAction changed
        // Listen to transaction to update title of transaction report when transaction changed
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [
        fullReport,
        lastReportActionTransaction,
        reportActions,
        personalDetails,
        preferredLocale,
        policy,
        parentReportAction,
        iouReportReportActions,
        transaction,
        transactionViolations,
        receiptTransactions,
        invoiceReceiverPolicy,
        shouldDisplayReportViolations,
        lastMessageTextFromReport,
    ]);

    return (
        <OptionRowLHN
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...propsToForward}
            isFocused={isReportFocused}
            optionItem={optionItem}
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
