import {deepEqual} from 'fast-equals';
import React, {createContext, useContext, useEffect, useRef} from 'react';
import Log from '@libs/Log';
import usePrevious from './usePrevious';
import useReportAttributes from './useReportAttributes';
import type {ReportsToDisplayInLHN} from './useReportsToDisplayInLHN';
import useReportsToDisplayInLHN from './useReportsToDisplayInLHN';
import useSidebarData from './useSidebarData';
import type {SidebarOrderedReportsStateContextValue} from './useSortedLHNReports';
import useSortedLHNReports from './useSortedLHNReports';

const componentsUsingHook = new Map<string, {renderDuration: number}>();

type SidebarOrderedReportsContextProviderProps = {
    children: React.ReactNode;
    currentReportIDForTests?: string;
};

type SidebarOrderedReportsActionsContextValue = {
    clearLHNCache: () => void;
};

const SidebarOrderedReportsStateContext = createContext<SidebarOrderedReportsStateContextValue>({
    orderedReports: [],
    orderedReportIDs: [],
    currentReportID: '',
    policyMemberAccountIDs: [],
});

const SidebarOrderedReportsActionsContext = createContext<SidebarOrderedReportsActionsContextValue>({
    clearLHNCache: () => {},
});

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
    const data = useSidebarData(currentReportIDForTests);
    const reportAttributes = useReportAttributes();
    const {reportsToDisplayInLHN, clearLHNCache} = useReportsToDisplayInLHN(data, reportAttributes);
    const stateValue = useSortedLHNReports(
        reportsToDisplayInLHN,
        data.priorityMode,
        data.reportsDrafts,
        data.reportNameValuePairs,
        data.conciergeReportID,
        data.derivedCurrentReportID,
        data.shouldUseNarrowLayout,
        data.chatReports,
        data.policies,
        data.accountID,
    );

    const actionsValue: SidebarOrderedReportsActionsContextValue = {clearLHNCache};

    const currentDeps = {
        priorityMode: data.priorityMode,
        chatReports: data.chatReports,
        policies: data.policies,
        transactions: data.transactions,
        transactionViolations: data.transactionViolations,
        reportNameValuePairs: data.reportNameValuePairs,
        betas: data.betas,
        reportAttributes,
        shouldUseNarrowLayout: data.shouldUseNarrowLayout,
        accountID: data.accountID,
        currentReportIDValue: data.derivedCurrentReportID,
        derivedCurrentReportID: data.derivedCurrentReportID,
        prevDerivedCurrentReportID: data.prevDerivedCurrentReportID,
        policyMemberAccountIDs: stateValue.policyMemberAccountIDs,
        prevBetas: data.prevBetas,
        prevPriorityMode: data.prevPriorityMode,
        reportsToDisplayInLHN,
        orderedReportIDs: stateValue.orderedReportIDs,
        orderedReports: stateValue.orderedReports,
    };
    const prevContextValue = usePrevious(stateValue);
    const previousDeps = usePrevious(currentDeps);
    const firstRender = useRef(true);

    const perfRef = useRef<{hookDuration: number}>({hookDuration: 0});
    // eslint-disable-next-line react-hooks/purity
    const hookStartTime = useRef<number>(performance.now());

    useEffect(() => {
        perfRef.current.hookDuration = performance.now() - hookStartTime.current;
    }, [stateValue]);

    useEffect(() => {
        // Cases below ensure we only log when the edge case (empty -> non-empty or non-empty -> empty) happens.
        // This is done to avoid excessive logging when the orderedReports array is updated, but does not impact LHN.

        // Case 1: orderedReports goes from empty to non-empty
        if (stateValue.orderedReports.length > 0 && prevContextValue?.orderedReports.length === 0) {
            logChangedDeps('[useSidebarOrderedReports] Ordered reports went from empty to non-empty', currentDeps, previousDeps, perfRef);
        }
        // Case 2: orderedReports goes from non-empty to empty
        if (stateValue.orderedReports.length === 0 && prevContextValue?.orderedReports.length > 0) {
            logChangedDeps('[useSidebarOrderedReports] Ordered reports went from non-empty to empty', currentDeps, previousDeps, perfRef);
        }

        // Case 3: orderedReports are empty from the beginning
        if (firstRender.current && stateValue.orderedReports.length === 0) {
            logChangedDeps('[useSidebarOrderedReports] Ordered reports initialized empty', currentDeps, previousDeps, perfRef);
        }

        firstRender.current = false;
    });

    return (
        <SidebarOrderedReportsStateContext.Provider value={stateValue}>
            <SidebarOrderedReportsActionsContext.Provider value={actionsValue}>{children}</SidebarOrderedReportsActionsContext.Provider>
        </SidebarOrderedReportsStateContext.Provider>
    );
}

function useSidebarOrderedReportsState(componentName?: string) {
    useSidebarOrderedReportsPerformance(componentName);
    return useContext(SidebarOrderedReportsStateContext);
}

function useSidebarOrderedReportsActions() {
    return useContext(SidebarOrderedReportsActionsContext);
}

function useSidebarOrderedReports(componentName?: string) {
    const state = useSidebarOrderedReportsState(componentName);
    const actions = useSidebarOrderedReportsActions();
    return {...state, ...actions};
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

export {SidebarOrderedReportsContextProvider, useSidebarOrderedReports, useSidebarOrderedReportsState, useSidebarOrderedReportsActions};
export type {ReportsToDisplayInLHN, SidebarOrderedReportsStateContextValue};

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
            componentsUsingHook: Array.from(componentsUsingHook.entries()).map(([name, hookData]) => ({
                component: name,
                renderDuration: `${hookData.renderDuration.toFixed(2)}ms`,
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
