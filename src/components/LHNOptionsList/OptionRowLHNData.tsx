import {deepEqual} from 'fast-equals';
import React, {useEffect, useMemo, useRef} from 'react';
import * as ReportUtils from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import * as Report from '@userActions/Report';
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
    comment,
    policy,
    receiptTransactions,
    parentReportAction,
    transaction,
    lastReportActionTransaction = {},
    transactionViolations,
    canUseViolations,
    reportErrors,
    ...propsToForward
}: OptionRowLHNDataProps) {
    const reportID = propsToForward.reportID;

    const optionItemRef = useRef<OptionData>();

    const hasViolations = canUseViolations && ReportUtils.doesTransactionThreadHaveViolations(fullReport, transactionViolations, parentReportAction ?? null);

    const optionItem = useMemo(() => {
        // Note: ideally we'd have this as a dependent selector in onyx!
        const item = SidebarUtils.getOptionData({
            report: fullReport,
            personalDetails,
            preferredLocale: preferredLocale ?? CONST.LOCALES.DEFAULT,
            policy,
            parentReportAction,
            reportErrors,
            hasViolations: !!hasViolations,
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
        lastReportActionTransaction,
        reportActions,
        personalDetails,
        preferredLocale,
        policy,
        parentReportAction,
        transaction,
        transactionViolations,
        canUseViolations,
        receiptTransactions,
        reportErrors,
    ]);

    useEffect(() => {
        if (!optionItem || !!optionItem.hasDraftComment || !comment || comment.length <= 0 || isFocused) {
            return;
        }
        Report.setReportWithDraft(reportID, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <OptionRowLHN
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...propsToForward}
            isFocused={isFocused}
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
