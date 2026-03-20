import {useRef, useState} from 'react';
import Log from '@libs/Log';
import {getTransactionThreadReportID} from '@libs/MergeTransactionUtils';
import {isOneTransactionReport} from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAttributesDerivedValue} from '@src/types/onyx';
import type Report from '@src/types/onyx/Report';
import usePrevious from './usePrevious';
import type useSidebarData from './useSidebarData';

type SidebarData = ReturnType<typeof useSidebarData>;

type ReportsToDisplayInLHN = Record<string, Report & {hasErrorsOtherThanFailedReceipt?: boolean; requiresAttention?: boolean}>;

function useReportsToDisplayInLHN(data: SidebarData, reportAttributes: ReportAttributesDerivedValue['reports'] | undefined) {
    const {
        betas,
        prevBetas,
        priorityMode,
        prevPriorityMode,
        reportUpdates,
        reportNameValuePairsUpdates,
        transactionsUpdates,
        transactionViolationsUpdates,
        reportsDraftsUpdates,
        policiesUpdates,
        chatReports,
        transactions,
        derivedCurrentReportID,
        prevDerivedCurrentReportID,
        reportNameValuePairs,
        transactionViolations,
        reportsDrafts,
    } = data;

    // B5: useRef instead of useState — reading/writing a ref does not trigger extra renders
    const currentReportsToDisplayRef = useRef<ReportsToDisplayInLHN>({});
    // B3: track previous reportAttributes to diff on spurious calls
    const prevReportAttributes = usePrevious(reportAttributes);
    // Incrementing this triggers a re-render after cache is cleared (since ref writes don't)
    const [clearCacheDummyCounter, setClearCacheDummyCounter] = useState(0);

    const getUpdatedReports = () => {
        const reportsToUpdate = new Set<string>();

        if (betas !== prevBetas || priorityMode !== prevPriorityMode) {
            for (const key of Object.keys(chatReports ?? {})) {
                reportsToUpdate.add(key);
            }
        }
        if (reportUpdates) {
            for (const key of Object.keys(reportUpdates ?? {})) {
                reportsToUpdate.add(key);
            }
        }
        if (reportNameValuePairsUpdates) {
            for (const key of Object.keys(reportNameValuePairsUpdates ?? {}).map((reportKey) => reportKey.replace(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, ONYXKEYS.COLLECTION.REPORT))) {
                reportsToUpdate.add(key);
            }
        }
        if (transactionsUpdates) {
            // We need to select the report linked to a transaction, to properly recalculate getReceiptUploadErrorReason, which is the expense report if it is isOneTransactionReport
            // or the transaction thread report if it is otherwise.
            for (const key of Object.values(transactionsUpdates ?? {}).map((transaction) =>
                transaction?.reportID && isOneTransactionReport(chatReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`])
                    ? `${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`
                    : `${ONYXKEYS.COLLECTION.REPORT}${getTransactionThreadReportID(transaction)}`,
            )) {
                reportsToUpdate.add(key);
            }
        }
        if (transactionViolationsUpdates) {
            for (const key of Object.keys(transactionViolationsUpdates ?? {})
                .map((violationKey) => violationKey.replace(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, ONYXKEYS.COLLECTION.TRANSACTION))
                .map((transactionKey) => `${ONYXKEYS.COLLECTION.REPORT}${transactions?.[transactionKey]?.reportID}`)) {
                reportsToUpdate.add(key);
            }
        }
        if (reportsDraftsUpdates) {
            for (const key of Object.keys(reportsDraftsUpdates).map((draftKey) => draftKey.replace(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, ONYXKEYS.COLLECTION.REPORT))) {
                reportsToUpdate.add(key);
            }
        }
        if (policiesUpdates) {
            const updatedPolicies = new Set(Object.keys(policiesUpdates).map((policyKey) => policyKey.replace(ONYXKEYS.COLLECTION.POLICY, '')));
            for (const key of Object.entries(chatReports ?? {})
                .filter(([, value]) => {
                    if (!value?.policyID) {
                        return;
                    }
                    return updatedPolicies.has(value.policyID);
                })
                .map(([reportKey]) => reportKey)) {
                reportsToUpdate.add(key);
            }
        }

        // Make sure the previous and current reports are always included in the updates when we switch reports.
        if (prevDerivedCurrentReportID !== derivedCurrentReportID) {
            reportsToUpdate.add(`${ONYXKEYS.COLLECTION.REPORT}${prevDerivedCurrentReportID}`);
            reportsToUpdate.add(`${ONYXKEYS.COLLECTION.REPORT}${derivedCurrentReportID}`);
        }

        return Array.from(reportsToUpdate);
    };

    // B5: read ref during render intentionally — this ref acts as "previous display state" for the
    // incremental update logic. Using a ref (vs useState) eliminates the double render cycle that
    // was previously caused by useEffect → setCurrentReportsToDisplay → re-render. The ref is written
    // synchronously at the end of this render pass, making reads idempotent with React Strict Mode.
    // eslint-disable-next-line react-hooks/refs
    const currentReportsToDisplay = currentReportsToDisplayRef.current;
    // clearCacheDummyCounter is read here so React Compiler tracks it as a dependency,
    // ensuring a re-run of this computation after clearLHNCache() increments it.
    const hasCachedReports = clearCacheDummyCounter > -1 && Object.keys(currentReportsToDisplay).length > 0;
    const updatedReports = getUpdatedReports();

    let effectiveUpdatedReports: string[];
    if (updatedReports.length === 0 && hasCachedReports) {
        // B3: spurious call — reportAttributes changed but no specific report keys updated.
        // Only recheck reports whose attributes actually changed (not all displayed reports).
        effectiveUpdatedReports = Object.keys(currentReportsToDisplay).filter((prefixedKey) => {
            const reportID = prefixedKey.replace(ONYXKEYS.COLLECTION.REPORT, '');
            return reportAttributes?.[reportID] !== prevReportAttributes?.[reportID];
        });
    } else {
        effectiveUpdatedReports = updatedReports;
    }

    const shouldDoIncrementalUpdate = effectiveUpdatedReports.length > 0 && hasCachedReports;

    let reportsToDisplay: ReportsToDisplayInLHN;
    if (shouldDoIncrementalUpdate) {
        reportsToDisplay = SidebarUtils.updateReportsToDisplayInLHN({
            displayedReports: currentReportsToDisplay,
            reports: chatReports,
            updatedReportsKeys: effectiveUpdatedReports,
            currentReportId: derivedCurrentReportID,
            isInFocusMode: priorityMode === CONST.PRIORITY_MODE.GSD,
            betas,
            transactionViolations,
            reportNameValuePairs,
            reportAttributes,
            draftComments: reportsDrafts,
            transactions,
        });
    } else if (updatedReports.length === 0 && hasCachedReports) {
        // B3: spurious call AND no displayed reports had attribute changes — return cache as-is
        reportsToDisplay = currentReportsToDisplay;
    } else {
        Log.info('[useSidebarOrderedReports] building reportsToDisplay from scratch');
        reportsToDisplay = SidebarUtils.getReportsToDisplayInLHN(
            derivedCurrentReportID,
            chatReports,
            betas,
            priorityMode,
            reportsDrafts,
            transactionViolations,
            transactions,
            reportNameValuePairs,
            reportAttributes,
        );
    }

    // B5: write ref synchronously during render — see read comment above
    // eslint-disable-next-line react-hooks/refs
    currentReportsToDisplayRef.current = reportsToDisplay;

    const clearLHNCache = () => {
        Log.info('[useSidebarOrderedReports] Clearing sidebar cache manually via debug modal');
        // eslint-disable-next-line react-hooks/refs
        currentReportsToDisplayRef.current = {};
        setClearCacheDummyCounter((c) => c + 1);
    };

    // eslint-disable-next-line react-hooks/refs
    return {reportsToDisplayInLHN: reportsToDisplay, clearLHNCache};
}

export default useReportsToDisplayInLHN;
export type {ReportsToDisplayInLHN};
