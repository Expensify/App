import {deepEqual} from 'fast-equals';
import React, {useEffect, useMemo, useRef} from 'react';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import type {OptionData} from '@src/libs/ReportUtils';
import LHNOptionsContext from './LHNOptionsContext';
import type {OptionRowLHNDataProps} from './types';

/*
 * This component gets the data from onyx for the actual
 * OptionRowLHN component.
 * The OptionRowLHN component is memoized, so it will only
 * re-render if the data really changed.
 */
function OptionRowLHNData({
    fullReport,
    reportActions,
    personalDetails = {},
    preferredLocale = CONST.LOCALES.DEFAULT,
    comment,
    policy,
    receiptTransactions,
    parentReportAction,
    transaction,
    transactionViolations,
    canUseViolations,
    reportID,
}: OptionRowLHNDataProps) {
    const {registerOption} = React.useContext(LHNOptionsContext);

    const optionItemRef = useRef<OptionData>();
    const linkedTransaction = useMemo(() => {
        const sortedReportActions = ReportActionsUtils.getSortedReportActionsForDisplay(reportActions);
        const lastReportAction = sortedReportActions[0];
        return TransactionUtils.getLinkedTransaction(lastReportAction);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fullReport?.reportID, receiptTransactions, reportActions]);

    const hasViolations = canUseViolations && ReportUtils.doesTransactionThreadHaveViolations(fullReport, transactionViolations, parentReportAction ?? null);

    const optionItem = useMemo(() => {
        // Note: ideally we'd have this as a dependent selector in onyx!
        const item = SidebarUtils.getOptionData({
            report: fullReport,
            reportActions,
            personalDetails,
            preferredLocale: preferredLocale ?? CONST.LOCALES.DEFAULT,
            policy,
            parentReportAction,
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
    }, [fullReport, linkedTransaction, reportActions, personalDetails, preferredLocale, policy, parentReportAction, transaction, transactionViolations, canUseViolations]);

    useEffect(() => {
        registerOption(optionItem);
    }, [optionItem, registerOption]);

    useEffect(() => {
        if (!optionItem || !!optionItem.hasDraftComment || !comment || comment.length <= 0) {
            return;
        }
        Report.setReportWithDraft(reportID, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
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
