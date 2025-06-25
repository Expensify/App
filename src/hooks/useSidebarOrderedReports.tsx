import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import {getPolicyEmployeeListByIdWithoutCurrentUser} from '@libs/PolicyUtils';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';
import useCurrentReportID from './useCurrentReportID';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import usePrevious from './usePrevious';
import useResponsiveLayout from './useResponsiveLayout';

type PartialPolicyForSidebar = Pick<OnyxTypes.Policy, 'type' | 'name' | 'avatarURL' | 'employeeList'>;

type SidebarOrderedReportsContextProviderProps = {
    children: React.ReactNode;
    currentReportIDForTests?: string;
};

type SidebarOrderedReportsContextValue = {
    orderedReports: OnyxTypes.Report[];
    currentReportID: string | undefined;
    policyMemberAccountIDs: number[];
};

type ReportsToDisplayInLHN = Record<string, OnyxTypes.Report & {hasErrorsOtherThanFailedReceipt?: boolean}>;

const SidebarOrderedReportsContext = createContext<SidebarOrderedReportsContextValue>({
    orderedReports: [],
    currentReportID: '',
    policyMemberAccountIDs: [],
});

const policySelector = (policy: OnyxEntry<OnyxTypes.Policy>): PartialPolicyForSidebar =>
    (policy && {
        type: policy.type,
        name: policy.name,
        avatarURL: policy.avatarURL,
        employeeList: policy.employeeList,
    }) as PartialPolicyForSidebar;

function SidebarOrderedReportsContextProvider({
    children,
    /**
     * Only required to make unit tests work, since we
     * explicitly pass the currentReportID in LHNTestUtils
     * to SidebarLinksData, so this context doesn't have
     * access to currentReportID in that case.
     *
     * This is a workaround to have currentReportID available in testing environment.
     */
    currentReportIDForTests,
}: SidebarOrderedReportsContextProviderProps) {
    const [priorityMode] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE, {initialValue: CONST.PRIORITY_MODE.DEFAULT, canBeMissing: true});
    const [chatReports, {sourceValue: reportUpdates}] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const [policies, {sourceValue: policiesUpdates}] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: (c) => mapOnyxCollectionItems(c, policySelector), canBeMissing: true});
    const [transactions, {sourceValue: transactionsUpdates}] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: true});
    const [transactionViolations, {sourceValue: transactionViolationsUpdates}] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const [reportNameValuePairs, {sourceValue: reportNameValuePairsUpdates}] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {canBeMissing: true});
    const [, {sourceValue: reportsDraftsUpdates}] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, {initialValue: {}, canBeMissing: true});
    const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {selector: (value) => value?.reports, canBeMissing: true});
    const [currentReportsToDisplay, setCurrentReportsToDisplay] = useState<ReportsToDisplayInLHN>({});

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {accountID} = useCurrentUserPersonalDetails();
    const currentReportIDValue = useCurrentReportID();
    const derivedCurrentReportID = currentReportIDForTests ?? currentReportIDValue?.currentReportIDFromPath ?? currentReportIDValue?.currentReportID;
    const prevDerivedCurrentReportID = usePrevious(derivedCurrentReportID);

    const policyMemberAccountIDs = useMemo(() => getPolicyEmployeeListByIdWithoutCurrentUser(policies, undefined, accountID), [policies, accountID]);
    const prevBetas = usePrevious(betas);
    const prevPriorityMode = usePrevious(priorityMode);

    /**
     * Find the reports that need to be updated in the LHN
     */
    const getUpdatedReports = useCallback(() => {
        let reportsToUpdate: string[] = [];

        if (betas !== prevBetas || priorityMode !== prevPriorityMode) {
            reportsToUpdate = Object.keys(chatReports ?? {});
        } else if (reportUpdates) {
            reportsToUpdate = Object.keys(reportUpdates ?? {});
        } else if (reportNameValuePairsUpdates) {
            reportsToUpdate = Object.keys(reportNameValuePairsUpdates ?? {}).map((key) => key.replace(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, ONYXKEYS.COLLECTION.REPORT));
        } else if (transactionsUpdates) {
            reportsToUpdate = Object.values(transactionsUpdates ?? {}).map((transaction) => `${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`);
        } else if (transactionViolationsUpdates) {
            reportsToUpdate = Object.keys(transactionViolationsUpdates ?? {})
                .map((key) => key.replace(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, ONYXKEYS.COLLECTION.TRANSACTION))
                .map((key) => `${ONYXKEYS.COLLECTION.REPORT}${transactions?.[key]?.reportID}`);
        } else if (reportsDraftsUpdates) {
            reportsToUpdate = Object.keys(reportsDraftsUpdates).map((key) => key.replace(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, ONYXKEYS.COLLECTION.REPORT));
        } else if (policiesUpdates) {
            const updatedPolicies = Object.keys(policiesUpdates).map((key) => key.replace(ONYXKEYS.COLLECTION.POLICY, ''));
            reportsToUpdate = Object.entries(chatReports ?? {})
                .filter(([, value]) => {
                    if (!value?.policyID) {
                        return;
                    }

                    return updatedPolicies.includes(value.policyID);
                })
                .map(([key]) => key);
        }

        // Make sure the previous and current reports are always included in the updates when we switch reports.
        if (prevDerivedCurrentReportID !== derivedCurrentReportID) {
            reportsToUpdate.push(`${ONYXKEYS.COLLECTION.REPORT}${prevDerivedCurrentReportID}`, `${ONYXKEYS.COLLECTION.REPORT}${derivedCurrentReportID}`);
        }

        return reportsToUpdate;
    }, [
        reportUpdates,
        reportNameValuePairsUpdates,
        transactionsUpdates,
        transactionViolationsUpdates,
        reportsDraftsUpdates,
        policiesUpdates,
        chatReports,
        transactions,
        betas,
        priorityMode,
        prevBetas,
        prevPriorityMode,
        prevDerivedCurrentReportID,
        derivedCurrentReportID,
    ]);

    const reportsToDisplayInLHN = useMemo(() => {
        const updatedReports = getUpdatedReports();
        const shouldDoIncrementalUpdate = updatedReports.length > 0 && Object.keys(currentReportsToDisplay).length > 0;

        let reportsToDisplay = {};

        if (shouldDoIncrementalUpdate) {
            reportsToDisplay = SidebarUtils.updateReportsToDisplayInLHN(
                currentReportsToDisplay,
                chatReports,
                updatedReports,
                derivedCurrentReportID,
                priorityMode === CONST.PRIORITY_MODE.GSD,
                betas,
                policies,
                transactionViolations,
                reportNameValuePairs,
                reportAttributes,
            );
        } else {
            reportsToDisplay = SidebarUtils.getReportsToDisplayInLHN(
                derivedCurrentReportID,
                chatReports,
                betas,
                policies,
                priorityMode,
                transactionViolations,
                reportNameValuePairs,
                reportAttributes,
            );
        }
        return reportsToDisplay;
        // Rule disabled intentionally — triggering a re-render on currentReportsToDisplay would cause an infinite loop
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [getUpdatedReports, chatReports, derivedCurrentReportID, priorityMode, betas, policies, transactionViolations, reportNameValuePairs, reportAttributes]);

    useEffect(() => {
        setCurrentReportsToDisplay(reportsToDisplayInLHN);
    }, [reportsToDisplayInLHN]);

    const getOrderedReportIDs = useCallback(
        () => SidebarUtils.sortReportsToDisplayInLHN(reportsToDisplayInLHN, priorityMode, reportNameValuePairs, reportAttributes),
        // Rule disabled intentionally - reports should be sorted only when the reportsToDisplayInLHN changes
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [reportsToDisplayInLHN],
    );

    const orderedReportIDs = useMemo(() => getOrderedReportIDs(), [getOrderedReportIDs]);
    // Get the actual reports based on the ordered IDs
    const getOrderedReports = useCallback(
        (reportIDs: string[]): OnyxTypes.Report[] => {
            if (!chatReports) {
                return [];
            }
            return reportIDs.map((reportID) => chatReports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]).filter(Boolean) as OnyxTypes.Report[];
        },
        [chatReports],
    );

    const orderedReports = useMemo(() => getOrderedReports(orderedReportIDs), [getOrderedReports, orderedReportIDs]);

    const contextValue: SidebarOrderedReportsContextValue = useMemo(() => {
        // We need to make sure the current report is in the list of reports, but we do not want
        // to have to re-generate the list every time the currentReportID changes. To do that
        // we first generate the list as if there was no current report, then we check if
        // the current report is missing from the list, which should very rarely happen. In this
        // case we re-generate the list a 2nd time with the current report included.

        // We also execute the following logic if `shouldUseNarrowLayout` is false because this is
        // requirement for web and desktop. Consider a case, where we have report with expenses and we click on
        // any expense, a new LHN item is added in the list and is visible on web and desktop. But on mobile, we
        // just navigate to the screen with expense details, so there seems no point to execute this logic on mobile.
        if (
            (!shouldUseNarrowLayout || orderedReportIDs.length === 0) &&
            derivedCurrentReportID &&
            derivedCurrentReportID !== '-1' &&
            orderedReportIDs.indexOf(derivedCurrentReportID) === -1
        ) {
            const updatedReportIDs = getOrderedReportIDs();
            const updatedReports = getOrderedReports(updatedReportIDs);
            return {
                orderedReports: updatedReports,
                currentReportID: derivedCurrentReportID,
                policyMemberAccountIDs,
            };
        }

        return {
            orderedReports,
            currentReportID: derivedCurrentReportID,
            policyMemberAccountIDs,
        };
    }, [getOrderedReportIDs, orderedReportIDs, derivedCurrentReportID, policyMemberAccountIDs, shouldUseNarrowLayout, getOrderedReports, orderedReports]);

    return <SidebarOrderedReportsContext.Provider value={contextValue}>{children}</SidebarOrderedReportsContext.Provider>;
}

function useSidebarOrderedReports() {
    return useContext(SidebarOrderedReportsContext);
}

export {SidebarOrderedReportsContext, SidebarOrderedReportsContextProvider, useSidebarOrderedReports};
export type {PartialPolicyForSidebar, ReportsToDisplayInLHN};
