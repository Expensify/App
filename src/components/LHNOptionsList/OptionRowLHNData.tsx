import {deepEqual} from 'fast-equals';
import React, {useMemo, useRef} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import useCurrentReportID from '@hooks/useCurrentReportID';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import type {OptionData} from '@src/libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import OptionRowLHN from './OptionRowLHN';
import type {OptionRowLHNDataProps} from './types';

let allReports: OnyxCollection<Report>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => (allReports = value),
});

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
    receiptTransactions,
    parentReportAction,
    transaction,
    lastReportActionTransaction = {},
    transactionViolations,
    canUseViolations,
    ...propsToForward
}: OptionRowLHNDataProps) {
    const reportID = propsToForward.reportID;
    const currentReportIDValue = useCurrentReportID();
    const isReportFocused = isFocused && currentReportIDValue?.currentReportID === reportID;

    const optionItemRef = useRef<OptionData>();

    let shouldDisplayViolations = canUseViolations && ReportUtils.shouldDisplayTransactionThreadViolations(fullReport, transactionViolations, parentReportAction);
    const oneTransactionThreadReportID = ReportActionsUtils.getOneTransactionThreadReportID(reportID, reportActions);
    const isOneTransactionReport = oneTransactionThreadReportID !== null;
    if (isOneTransactionReport && oneTransactionThreadReportID) {
        const transactionReport = allReports?.[oneTransactionThreadReportID];
        const parentTransactionAction = ReportActionsUtils.getParentReportAction(transactionReport);
        if (transactionReport && !isEmptyObject(parentTransactionAction)) {
            shouldDisplayViolations = canUseViolations && ReportUtils.shouldDisplayTransactionThreadViolations(transactionReport, transactionViolations, parentTransactionAction);
        }
    }
    const optionItem = useMemo(() => {
        // Note: ideally we'd have this as a dependent selector in onyx!
        const item = SidebarUtils.getOptionData({
            report: fullReport,
            reportActions,
            personalDetails,
            preferredLocale: preferredLocale ?? CONST.LOCALES.DEFAULT,
            policy,
            parentReportAction,
            hasViolations: !!shouldDisplayViolations,
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
