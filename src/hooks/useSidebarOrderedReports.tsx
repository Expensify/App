import {createPoliciesSelector} from '@selectors/Policy';
import {deepEqual} from 'fast-equals';
import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import {getPolicyEmployeeListByIdWithoutCurrentUser} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import useCurrentReportID from './useCurrentReportID';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
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
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: policiesSelector, canBeMissing: true});
    const [chatReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    // eslint-disable-next-line @typescript-eslint/prefer-destructuring, @typescript-eslint/no-unsafe-assignment
    const [orderedReportsData] = useOnyx(ONYXKEYS.DERIVED.ORDERED_REPORTS_FOR_LHN, {canBeMissing: true});
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {accountID} = useCurrentUserPersonalDetails();
    const currentReportIDValue = useCurrentReportID();
    const derivedCurrentReportID = currentReportIDForTests ?? currentReportIDValue?.currentReportID;

    const policyMemberAccountIDs = useMemo(() => getPolicyEmployeeListByIdWithoutCurrentUser(policies, undefined, accountID), [policies, accountID]);

    const perfRef = useRef<{hookDuration: number}>({
        hookDuration: 0,
    });
    // eslint-disable-next-line react-hooks/purity
    const hookStartTime = useRef<number>(performance.now());

    // Get ordered report IDs from the derived value, holding a stable reference when it's empty
    const orderedReportIDs = useMemo(() => orderedReportsData?.orderedReportIDs ?? [], [orderedReportsData?.orderedReportIDs]);

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
        // This is a debug function that clears the derived value cache
        // eslint-disable-next-line rulesdir/prefer-actions-set-data
        Onyx.set(ONYXKEYS.DERIVED.ORDERED_REPORTS_FOR_LHN, null);
    }, []);

    const contextValue: SidebarOrderedReportsContextValue = useMemo(() => {
        // We need to make sure the current report is in the list of reports, but we do not want
        // to have to re-generate the list every time the currentReportID changes. To handle this,
        // we add the current report to the list here in the hook if it's missing from the derived value.

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
            // Current report is missing from the list, so we add it here at render time
            const currentReport = chatReports?.[`${ONYXKEYS.COLLECTION.REPORT}${derivedCurrentReportID}`];
            if (currentReport) {
                return {
                    orderedReports: [currentReport, ...orderedReports],
                    orderedReportIDs: [derivedCurrentReportID, ...orderedReportIDs],
                    currentReportID: derivedCurrentReportID,
                    policyMemberAccountIDs,
                    clearLHNCache,
                };
            }
        }

        return {
            orderedReports,
            orderedReportIDs,
            currentReportID: derivedCurrentReportID,
            policyMemberAccountIDs,
            clearLHNCache,
        };
    }, [orderedReportIDs, derivedCurrentReportID, policyMemberAccountIDs, shouldUseNarrowLayout, orderedReports, clearLHNCache, chatReports]);

    const currentDeps = {
        orderedReportIDs,
        orderedReports,
        derivedCurrentReportID,
        policyMemberAccountIDs,
        shouldUseNarrowLayout,
        accountID,
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
