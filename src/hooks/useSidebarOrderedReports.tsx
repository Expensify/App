import reportsSelector from '@selectors/Attributes';
import {createPoliciesSelector} from '@selectors/Policy';
import {deepEqual} from 'fast-equals';
import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Log from '@libs/Log';
import {getPolicyEmployeeListByIdWithoutCurrentUser} from '@libs/PolicyUtils';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import {useCurrentReportIDState} from './useCurrentReportID';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDeepCompareRef from './useDeepCompareRef';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePrevious from './usePrevious';
import useResponsiveLayout from './useResponsiveLayout';

const componentsUsingHook = new Map<string, {renderDuration: number}>();

type PartialPolicyForSidebar = Pick<OnyxTypes.Policy, 'type' | 'name' | 'avatarURL' | 'employeeList'>;

type SidebarOrderedReportsContextProviderProps = {
    children: React.ReactNode;
    currentReportIDForTests?: string;
};

type SidebarOrderedReportsContextValue = {
    orderedReports: OnyxTypes.Report[];
    orderedReportIDs: string[];
    currentReportID: string | undefined;
    policyMemberAccountIDs: number[];
    clearLHNCache: () => void;
};

type ReportsToDisplayInLHN = Record<string, OnyxTypes.Report & {hasErrorsOtherThanFailedReceipt?: boolean; requiresAttention?: boolean}>;

const SidebarOrderedReportsContext = createContext<SidebarOrderedReportsContextValue>({
    orderedReports: [],
    orderedReportIDs: [],
    currentReportID: '',
    policyMemberAccountIDs: [],
    clearLHNCache: () => {},
});

const policySelector = (policy: OnyxEntry<OnyxTypes.Policy>): PartialPolicyForSidebar =>
    (policy && {
        type: policy.type,
        name: policy.name,
        avatarURL: policy.avatarURL,
        employeeList: policy.employeeList,
    }) as PartialPolicyForSidebar;

const policiesSelector = (policies: OnyxCollection<OnyxTypes.Policy>) => createPoliciesSelector(policies, policySelector);

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
    const {localeCompare} = useLocalize();
    const [priorityMode = CONST.PRIORITY_MODE.DEFAULT] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE, {canBeMissing: true});
    const [chatReports, {sourceValue: reportUpdates}] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const [policies, {sourceValue: policiesUpdates}] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: policiesSelector, canBeMissing: true});
    const [transactions, {sourceValue: transactionsUpdates}] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: true});
    const [transactionViolations, {sourceValue: transactionViolationsUpdates}] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const [reportNameValuePairs, {sourceValue: reportNameValuePairsUpdates}] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {canBeMissing: true});
    const [reportsDrafts, {sourceValue: reportsDraftsUpdates}] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, {canBeMissing: true});
    const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {selector: reportsSelector, canBeMissing: true});
    const [conciergeReportID = ''] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {canBeMissing: true});
    const [currentReportsToDisplay, setCurrentReportsToDisplay] = useState<ReportsToDisplayInLHN>({});
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {accountID} = useCurrentUserPersonalDetails();
    const {currentReportID: currentReportIDValue} = useCurrentReportIDState();
    const derivedCurrentReportID = currentReportIDForTests ?? currentReportIDValue;
    const prevDerivedCurrentReportID = usePrevious(derivedCurrentReportID);

    // we need to force reportsToDisplayInLHN to re-compute when we clear currentReportsToDisplay, but the way it currently works relies on not having currentReportsToDisplay as a memo dependency, so we just need something we can change to trigger it
    // I don't like it either, but clearing the cache is only a hack for the debug modal and I will endeavor to make it better as I work to improve the cache correctness of the LHN more broadly
    const [clearCacheDummyCounter, setClearCacheDummyCounter] = useState(0);

    const policyMemberAccountIDs = useMemo(() => getPolicyEmployeeListByIdWithoutCurrentUser(policies, undefined, accountID), [policies, accountID]);
    const prevBetas = usePrevious(betas);
    const prevPriorityMode = usePrevious(priorityMode);

    const perfRef = useRef<{hookDuration: number}>({
        hookDuration: 0,
    });
    const hookStartTime = useRef<number>(performance.now());

    /**
     * Find the reports that need to be updated in the LHN
     */
    const getUpdatedReports = useCallback(() => {
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
            for (const key of Object.values(transactionsUpdates ?? {}).map((transaction) => `${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`)) {
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
            reportsToDisplay = SidebarUtils.updateReportsToDisplayInLHN({
                displayedReports: currentReportsToDisplay,
                reports: chatReports,
                updatedReportsKeys: updatedReports,
                currentReportId: derivedCurrentReportID,
                isInFocusMode: priorityMode === CONST.PRIORITY_MODE.GSD,
                betas,
                transactionViolations,
                reportNameValuePairs,
                reportAttributes,
                draftComments: reportsDrafts,
            });
        } else {
            Log.info('[useSidebarOrderedReports] building reportsToDisplay from scratch');
            reportsToDisplay = SidebarUtils.getReportsToDisplayInLHN(
                derivedCurrentReportID,
                chatReports,
                betas,
                policies,
                priorityMode,
                reportsDrafts,
                transactionViolations,
                reportNameValuePairs,
                reportAttributes,
            );
        }

        return reportsToDisplay;
        // Rule disabled intentionally — triggering a re-render on currentReportsToDisplay would cause an infinite loop
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        getUpdatedReports,
        chatReports,
        derivedCurrentReportID,
        priorityMode,
        betas,
        policies,
        transactionViolations,
        reportNameValuePairs,
        reportAttributes,
        reportsDrafts,
        clearCacheDummyCounter,
    ]);

    const deepComparedReportsToDisplayInLHN = useDeepCompareRef(reportsToDisplayInLHN);
    const deepComparedReportsDrafts = useDeepCompareRef(reportsDrafts);

    useEffect(() => {
        setCurrentReportsToDisplay(reportsToDisplayInLHN);
    }, [reportsToDisplayInLHN]);

    const getOrderedReportIDs = useCallback(
        () =>
            SidebarUtils.sortReportsToDisplayInLHN(deepComparedReportsToDisplayInLHN ?? {}, priorityMode, localeCompare, deepComparedReportsDrafts, reportNameValuePairs, conciergeReportID),
        // Rule disabled intentionally - reports should be sorted only when the reportsToDisplayInLHN changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [deepComparedReportsToDisplayInLHN, localeCompare, deepComparedReportsDrafts, conciergeReportID],
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

    const clearLHNCache = useCallback(() => {
        Log.info('[useSidebarOrderedReports] Clearing sidebar cache manually via debug modal');
        setCurrentReportsToDisplay({});
        setClearCacheDummyCounter((current) => current + 1);
    }, []);

    const contextValue: SidebarOrderedReportsContextValue = useMemo(() => {
        // We need to make sure the current report is in the list of reports, but we do not want
        // to have to re-generate the list every time the currentReportID changes. To do that
        // we first generate the list as if there was no current report, then we check if
        // the current report is missing from the list, which should very rarely happen. In this
        // case we re-generate the list a 2nd time with the current report included.

        // We also execute the following logic if `shouldUseNarrowLayout` is false because this is
        // requirement for web. Consider a case, where we have report with expenses and we click on
        // any expense, a new LHN item is added in the list and is visible on web. But on mobile, we
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
                orderedReportIDs: updatedReportIDs,
                currentReportID: derivedCurrentReportID,
                policyMemberAccountIDs,
                clearLHNCache,
            };
        }

        return {
            orderedReports,
            orderedReportIDs,
            currentReportID: derivedCurrentReportID,
            policyMemberAccountIDs,
            clearLHNCache,
        };
    }, [getOrderedReportIDs, orderedReportIDs, derivedCurrentReportID, policyMemberAccountIDs, shouldUseNarrowLayout, getOrderedReports, orderedReports, clearLHNCache]);

    const currentDeps = {
        priorityMode,
        chatReports,
        policies,
        transactions,
        transactionViolations,
        reportNameValuePairs,
        betas,
        reportAttributes,
        currentReportsToDisplay,
        shouldUseNarrowLayout,
        accountID,
        currentReportIDValue,
        derivedCurrentReportID,
        prevDerivedCurrentReportID,
        policyMemberAccountIDs,
        prevBetas,
        prevPriorityMode,
        reportsToDisplayInLHN,
        orderedReportIDs,
        orderedReports,
    };
    const prevContextValue = usePrevious(contextValue);
    const previousDeps = usePrevious(currentDeps);
    const firstRender = useRef(true);

    useEffect(() => {
        const hookExecutionDuration = performance.now() - hookStartTime.current;
        perfRef.current.hookDuration = hookExecutionDuration;
    }, [contextValue]);

    useEffect(() => {
        // Cases below ensure we only log when the edge case (empty -> non-empty or non-empty -> empty) happens.
        // This is done to avoid excessive logging when the orderedReports array is updated, but does not impact LHN.

        // Case 1: orderedReports goes from empty to non-empty
        if (contextValue.orderedReports.length > 0 && prevContextValue?.orderedReports.length === 0) {
            logChangedDeps('[useSidebarOrderedReports] Ordered reports went from empty to non-empty', currentDeps, previousDeps, perfRef);
        }
        // Case 2: orderedReports goes from non-empty to empty
        if (contextValue.orderedReports.length === 0 && prevContextValue?.orderedReports.length > 0) {
            logChangedDeps('[useSidebarOrderedReports] Ordered reports went from non-empty to empty', currentDeps, previousDeps, perfRef);
        }

        // Case 3: orderedReports are empty from the beginning
        if (firstRender.current && contextValue.orderedReports.length === 0) {
            logChangedDeps('[useSidebarOrderedReports] Ordered reports initialized empty', currentDeps, previousDeps, perfRef);
        }

        firstRender.current = false;
    });

    return <SidebarOrderedReportsContext.Provider value={contextValue}>{children}</SidebarOrderedReportsContext.Provider>;
}

function useSidebarOrderedReports(componentName?: string) {
    useSidebarOrderedReportsPerformance(componentName);
    return useContext(SidebarOrderedReportsContext);
}

function useSidebarOrderedReportsPerformance(componentName?: string) {
    const renderStartTime = useRef<number>(0);

    useEffect(() => {
        if (!componentName) {
            return;
        }

        componentsUsingHook.set(componentName, {renderDuration: 0});

        return () => {
            componentsUsingHook.delete(componentName);
        };
    }, [componentName]);

    useEffect(() => {
        if (!componentName) {
            return;
        }

        renderStartTime.current = performance.now();

        return () => {
            const renderDuration = performance.now() - renderStartTime.current;
            const currentData = componentsUsingHook.get(componentName);
            if (currentData) {
                componentsUsingHook.set(componentName, {
                    renderDuration,
                });
            }
        };
    }, [componentName]);
}

export {SidebarOrderedReportsContext, SidebarOrderedReportsContextProvider, useSidebarOrderedReports};
export type {PartialPolicyForSidebar, ReportsToDisplayInLHN};

function getChangedKeys<T extends Record<string, unknown>>(deps: T, prevDeps: T) {
    const depsKeys = Object.keys(deps);

    return depsKeys.filter((depKey) => !deepEqual(deps[depKey], prevDeps[depKey]));
}

function logChangedDeps<T extends Record<string, unknown>>(msg: string, deps: T, prevDeps: T, perfRef: React.RefObject<{hookDuration: number}>) {
    const startTime = performance.now();
    const changedDeps = getChangedKeys(deps, prevDeps);
    const parsedDeps = parseDepsForLogging(deps);
    const loggingDuration = performance.now() - startTime;
    const hookExecutionDuration = perfRef.current.hookDuration;

    const logData: Record<string, unknown> = {
        deps: parsedDeps,
        changedDeps,
        performance: {
            hookDuration: `${hookExecutionDuration.toFixed(2)}ms`,
            loggingDuration: `${loggingDuration.toFixed(2)}ms`,
            componentsUsingHook: Array.from(componentsUsingHook.entries()).map(([name, data]) => ({
                component: name,
                renderDuration: `${data.renderDuration.toFixed(2)}ms`,
            })),
        },

        timestamp: new Date().toISOString(),
    };

    Log.info(msg, false, logData);
}

/**
 * @param deps - The dependencies to parse.
 * @returns A simplified object with light-weight values.
 */
function parseDepsForLogging<T extends Record<string, unknown>>(deps: T) {
    // If object or array, return the keys' length
    // If primitive, return the value
    return Object.fromEntries(Object.entries(deps).map(([key, value]) => [key, typeof value === 'object' && value !== null ? Object.keys(value).length : value]));
}
