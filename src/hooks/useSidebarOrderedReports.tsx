import {setInboxTab} from '@libs/actions/User';
import Log from '@libs/Log';
import SidebarUtils from '@libs/SidebarUtils';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';
import {getChatTabBrickRoad} from '@libs/WorkspacesSettingsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {Str} from 'expensify-common';
import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';

import {useCurrentReportIDState} from './useCurrentReportID';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';
import useMappedPolicies from './useMappedPolicies';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePrevious from './usePrevious';
import useReportAttributes from './useReportAttributes';
import useResponsiveLayout from './useResponsiveLayout';

const componentsUsingHook = new Map<string, {renderDuration: number}>();

type PartialPolicyForSidebar = Pick<OnyxTypes.Policy, 'type' | 'name' | 'avatarURL' | 'employeeList'>;

type SidebarOrderedReportsContextProviderProps = {
    children: React.ReactNode;
    currentReportIDForTests?: string;
};

type SidebarOrderedReportsStateContextValue = {
    /** The reports rendered in the LHN for the active Inbox tab (a filtered subset of orderedReportIDs). */
    filteredReports: OnyxTypes.Report[];
    /** All ordered LHN report IDs, unfiltered by the active Inbox tab. Used for total counts (e.g. focus-mode switch) and brick road. */
    orderedReportIDs: string[];
    currentReportID: string | undefined;
    chatTabBrickRoad: BrickRoad;
    activeTab: ValueOf<typeof CONST.INBOX_TAB>;
    inboxTabCounts: Record<typeof CONST.INBOX_TAB.TODO | typeof CONST.INBOX_TAB.UNREAD, number>;
};

type SidebarOrderedReportsActionsContextValue = {
    clearLHNCache: () => void;
    setActiveTab: (tab: ValueOf<typeof CONST.INBOX_TAB>) => void;
    setStickyReportID: (reportID: string) => void;
};

type ReportsToDisplayInLHN = Record<
    string,
    OnyxTypes.Report & {
        hasErrorsOtherThanFailedReceipt?: boolean;
        requiresAttention?: boolean;
        isUnreadReport?: boolean;
    }
>;

const SidebarOrderedReportsStateContext = createContext<SidebarOrderedReportsStateContextValue>({
    filteredReports: [],
    orderedReportIDs: [],
    currentReportID: '',
    chatTabBrickRoad: undefined,
    activeTab: CONST.INBOX_TAB.ALL,
    inboxTabCounts: {
        [CONST.INBOX_TAB.TODO]: 0,
        [CONST.INBOX_TAB.UNREAD]: 0,
    },
});

const SidebarOrderedReportsActionsContext = createContext<SidebarOrderedReportsActionsContextValue>({
    clearLHNCache: () => {},
    setActiveTab: () => {},
    setStickyReportID: () => {},
});

const policyMapper = (policy: OnyxEntry<OnyxTypes.Policy>): PartialPolicyForSidebar =>
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
    const {localeCompare} = useLocalize();
    const [priorityMode = CONST.PRIORITY_MODE.DEFAULT] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE);
    const [inboxTab = CONST.INBOX_TAB.ALL] = useOnyx(ONYXKEYS.NVP_INBOX_TAB);
    const activeTab = inboxTab ?? CONST.INBOX_TAB.ALL;
    const [chatReports, {sourceValue: reportUpdates}] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [, {sourceValue: policiesUpdates}] = useMappedPolicies(policyMapper);
    const [transactions, {sourceValue: transactionsUpdates}] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [transactionViolations, {sourceValue: transactionViolationsUpdates}] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [reportNameValuePairs, {sourceValue: reportNameValuePairsUpdates}] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [reportsDrafts, {sourceValue: reportsDraftsUpdates}] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const guidesEmailsByReportSelector = useCallback(
        (personalDetailsList: OnyxEntry<OnyxTypes.PersonalDetailsList>) => {
            const map: Record<string, boolean> = {};
            for (const report of Object.values(chatReports ?? {})) {
                if (report) {
                    const participantIDs = Object.keys(report.participants ?? {}).map(Number);
                    map[report.reportID] = participantIDs.some((accountID) => Str.extractEmailDomain(personalDetailsList?.[accountID]?.login ?? '') === CONST.EMAIL.GUIDES_DOMAIN);
                }
            }
            return map;
        },
        [chatReports],
    );
    const [guidesEmailsByReport] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: guidesEmailsByReportSelector,
    });
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const reportAttributes = useReportAttributes();
    const [currentReportsToDisplay, setCurrentReportsToDisplay] = useState<ReportsToDisplayInLHN>({});
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isOffline} = useNetwork();
    const {accountID, login: currentUserLogin} = useCurrentUserPersonalDetails();
    const {currentReportID: currentReportIDValue} = useCurrentReportIDState();
    const derivedCurrentReportID = currentReportIDForTests ?? currentReportIDValue;
    const prevDerivedCurrentReportID = usePrevious(derivedCurrentReportID);

    // we need to force reportsToDisplayInLHN to re-compute when we clear currentReportsToDisplay, but the way it currently works relies on not having currentReportsToDisplay as a memo dependency, so we just need something we can change to trigger it
    // I don't like it either, but clearing the cache is only a hack for the debug modal and I will endeavor to make it better as I work to improve the cache correctness of the LHN more broadly
    const [clearCacheDummyCounter, setClearCacheDummyCounter] = useState(0);

    const prevBetas = usePrevious(betas);
    const prevPriorityMode = usePrevious(priorityMode);
    const prevIsOffline = usePrevious(isOffline);
    const prevConciergeReportID = usePrevious(conciergeReportID);

    const perfRef = useRef<{hookDuration: number}>({
        hookDuration: 0,
    });
    const hookStartTime = useRef<number>(performance.now());

    /**
     * Find the reports that need to be updated in the LHN
     */
    const getUpdatedReports = useCallback(() => {
        const reportsToUpdate = new Set<string>();

        if (betas !== prevBetas || priorityMode !== prevPriorityMode || isOffline !== prevIsOffline || conciergeReportID !== prevConciergeReportID) {
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
        isOffline,
        prevIsOffline,
        conciergeReportID,
        prevConciergeReportID,
        prevDerivedCurrentReportID,
        derivedCurrentReportID,
    ]);

    const reportsToDisplayInLHN = useMemo(() => {
        const updatedReports = getUpdatedReports();
        const hasCachedReports = Object.keys(currentReportsToDisplay).length > 0;

        // When reportAttributes changes (e.g. on startup hydration) but no report-specific keys were
        // updated, getUpdatedReports() returns []. Rather than falling through to a full scan of all
        // reports, recheck only the already-displayed reports with the new reportAttributes.
        const effectiveUpdatedReports = updatedReports.length === 0 && hasCachedReports ? Object.keys(currentReportsToDisplay) : updatedReports;
        const shouldDoIncrementalUpdate = effectiveUpdatedReports.length > 0 && hasCachedReports;
        let reportsToDisplay = {};
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
                isOffline,
                currentUserLogin: currentUserLogin ?? '',
                currentUserAccountID: accountID,
                conciergeReportID,
                guidesEmailsByReport: guidesEmailsByReport ?? {},
            });
        } else {
            Log.info('[useSidebarOrderedReports] building reportsToDisplay from scratch');
            reportsToDisplay = SidebarUtils.getReportsToDisplayInLHN({
                currentReportId: derivedCurrentReportID,
                reports: chatReports,
                betas,
                priorityMode,
                draftComments: reportsDrafts,
                transactionViolations,
                transactions,
                isOffline,
                currentUserLogin: currentUserLogin ?? '',
                currentUserAccountID: accountID,
                reportNameValuePairs,
                reportAttributes,
                conciergeReportID,
                guidesEmailsByReport: guidesEmailsByReport ?? {},
            });
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
        transactionViolations,
        reportNameValuePairs,
        reportAttributes,
        reportsDrafts,
        isOffline,
        clearCacheDummyCounter,
        currentUserLogin,
        accountID,
        conciergeReportID,
        guidesEmailsByReport,
    ]);

    // Derive a stable boolean map indicating which reports have drafts.
    const hasDraftByReportIDRef = useRef<Record<string, boolean>>({});
    const hasDraftByReportID = useMemo(() => {
        const result: Record<string, boolean> = {};
        if (reportsDrafts) {
            for (const [key, value] of Object.entries(reportsDrafts)) {
                if (value) {
                    result[key.replace(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, '')] = true;
                }
            }
        }
        const prev = hasDraftByReportIDRef.current;
        const prevKeys = Object.keys(prev);
        const newKeys = Object.keys(result);
        if (prevKeys.length === newKeys.length && newKeys.every((k) => k in prev)) {
            return prev;
        }
        hasDraftByReportIDRef.current = result;
        return result;
    }, [reportsDrafts]);

    useEffect(() => {
        setCurrentReportsToDisplay(reportsToDisplayInLHN);
    }, [reportsToDisplayInLHN]);

    const getOrderedReportIDs = useCallback(
        () => SidebarUtils.sortReportsToDisplayInLHN(reportsToDisplayInLHN, priorityMode, localeCompare, hasDraftByReportID, reportNameValuePairs, reportAttributes),
        // Rule disabled intentionally - reports should be sorted only when the reportsToDisplayInLHN changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [reportsToDisplayInLHN, localeCompare, hasDraftByReportID, reportAttributes],
    );

    const orderedReportIDs = useMemo(() => getOrderedReportIDs(), [getOrderedReportIDs]);

    // When a report is opened from the To-do/Unread tab (see setStickyReportID), we remember it so it
    // stays visible after viewing it removes it from the tab (e.g. it gets read). It's only set on a
    // non-All tab, so opening a chat from the All tab never makes it appear under Unread/To-do.
    const [stickyReport, setStickyReport] = useState<{reportID: string; tab: ValueOf<typeof CONST.INBOX_TAB>} | undefined>(undefined);

    // The reports for the active tab, plus the sticky report opened from it (kept visible even after it's read).
    const stickyReportID = stickyReport?.reportID;
    const stickyReportTab = stickyReport?.tab;
    const filteredReportIDs = useMemo(() => {
        const baseFilteredReportIDs = SidebarUtils.filterReportsForInboxTab(orderedReportIDs, reportsToDisplayInLHN, activeTab);
        if (activeTab === CONST.INBOX_TAB.ALL || !stickyReportID || stickyReportTab !== activeTab || baseFilteredReportIDs.includes(stickyReportID)) {
            return baseFilteredReportIDs;
        }
        if (!orderedReportIDs.includes(stickyReportID)) {
            // While opening the report, reading it can briefly drop it from the LHN set entirely (before
            // navigation marks it as the focused report). Keep it at the top so the list doesn't flash empty.
            return [stickyReportID, ...baseFilteredReportIDs];
        }
        const baseSet = new Set(baseFilteredReportIDs);
        return orderedReportIDs.filter((reportID) => baseSet.has(reportID) || reportID === stickyReportID);
    }, [orderedReportIDs, reportsToDisplayInLHN, activeTab, stickyReportTab, stickyReportID]);

    // The count shown in each tab's badge, derived from the full "All" set (not the currently filtered view).
    const inboxTabCounts = useMemo(() => SidebarUtils.getInboxTabCounts(orderedReportIDs, reportsToDisplayInLHN), [orderedReportIDs, reportsToDisplayInLHN]);

    // Get the actual reports based on the filtered IDs
    const getOrderedReports = useCallback(
        (reportIDs: string[]): OnyxTypes.Report[] => {
            if (!chatReports) {
                return [];
            }
            return reportIDs.map((reportID) => chatReports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]).filter(Boolean) as OnyxTypes.Report[];
        },
        [chatReports],
    );

    const filteredReports = useMemo(() => getOrderedReports(filteredReportIDs), [getOrderedReports, filteredReportIDs]);

    const clearLHNCache = useCallback(() => {
        Log.info('[useSidebarOrderedReports] Clearing sidebar cache manually via debug modal');
        setCurrentReportsToDisplay({});
        setClearCacheDummyCounter((current) => current + 1);
    }, []);

    const setActiveTab = useCallback((tab: ValueOf<typeof CONST.INBOX_TAB>) => {
        setInboxTab(tab);

        // The sticky report is scoped to the tab it was opened from, so reset it when switching tabs.
        setStickyReport(undefined);
    }, []);

    // Called when a report is opened from the LHN. On the To-do/Unread tabs we remember it so it stays
    // visible after viewing it removes it from the tab. On the All tab we keep nothing sticky.
    const setStickyReportID = useCallback(
        (reportID: string) => {
            if (activeTab === CONST.INBOX_TAB.ALL) {
                return;
            }
            setStickyReport({reportID, tab: activeTab});
        },
        [activeTab],
    );

    const stateValue: SidebarOrderedReportsStateContextValue = useMemo(() => {
        // We need to make sure the current report is in the list of reports, but we do not want
        // to have to re-generate the list every time the currentReportID changes. To do that
        // we first generate the list as if there was no current report, then we check if
        // the current report is missing from the list, which should very rarely happen. In this
        // case we re-generate the list a 2nd time with the current report included.

        // We also execute the following logic if `shouldUseNarrowLayout` is false because this is
        // requirement for web. Consider a case, where we have report with expenses and we click on
        // any expense, a new LHN item is added in the list and is visible on web. But on mobile, we
        // just navigate to the screen with expense details, so there seems no point to execute this logic on mobile.
        // Only the "All" tab force-regenerates to surface the current report. On the To-do/Unread tabs the
        // sticky-aware filteredReportIDs already keeps the opened report visible, and re-filtering here
        // (without the sticky report) would briefly empty the list while opening it.
        if (
            activeTab === CONST.INBOX_TAB.ALL &&
            (!shouldUseNarrowLayout || filteredReportIDs.length === 0) &&
            derivedCurrentReportID &&
            derivedCurrentReportID !== '-1' &&
            filteredReportIDs.indexOf(derivedCurrentReportID) === -1
        ) {
            const updatedReportIDs = getOrderedReportIDs();
            const updatedFilteredIDs = SidebarUtils.filterReportsForInboxTab(updatedReportIDs, reportsToDisplayInLHN, activeTab);
            const updatedReports = getOrderedReports(updatedFilteredIDs);
            return {
                filteredReports: updatedReports,
                orderedReportIDs: updatedReportIDs,
                currentReportID: derivedCurrentReportID,
                chatTabBrickRoad: getChatTabBrickRoad(updatedReportIDs, reportAttributes),
                activeTab,
                inboxTabCounts,
            };
        }

        return {
            filteredReports,
            orderedReportIDs,
            currentReportID: derivedCurrentReportID,
            chatTabBrickRoad: getChatTabBrickRoad(orderedReportIDs, reportAttributes),
            activeTab,
            inboxTabCounts,
        };
    }, [
        getOrderedReportIDs,
        orderedReportIDs,
        filteredReportIDs,
        derivedCurrentReportID,
        shouldUseNarrowLayout,
        getOrderedReports,
        filteredReports,
        reportAttributes,
        activeTab,
        inboxTabCounts,
        reportsToDisplayInLHN,
    ]);

    const actionsValue: SidebarOrderedReportsActionsContextValue = useMemo(() => ({clearLHNCache, setActiveTab, setStickyReportID}), [clearLHNCache, setActiveTab, setStickyReportID]);

    useEffect(() => {
        const hookExecutionDuration = performance.now() - hookStartTime.current;
        perfRef.current.hookDuration = hookExecutionDuration;
    }, [stateValue]);

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
export type {ReportsToDisplayInLHN};
