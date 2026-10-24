import {setInboxTab} from '@libs/actions/User';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Log from '@libs/Log';
import SidebarUtils from '@libs/SidebarUtils';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import arraysEqual from '@src/utils/arraysEqual';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';

import {useCurrentReportIDState} from './useCurrentReportID';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLHNOrderedReports from './useLHNOrderedReports';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import useResponsiveLayout from './useResponsiveLayout';
import useStableArrayReference from './useStableArrayReference';

type SidebarOrderedReportsContextProviderProps = {
    children: React.ReactNode;
    currentReportIDForTests?: string;
};

type SidebarOrderedReportsStateContextValue = {
    /** The report IDs rendered in the LHN for the active Inbox tab (a filtered subset of orderedReportIDs). Keeps its reference while the list is unchanged. */
    filteredReportIDs: string[];
    /** All ordered LHN report IDs, unfiltered by the active Inbox tab. Used for total counts (e.g. focus-mode switch) and brick road. */
    orderedReportIDs: string[];
    currentReportID: string | undefined;
    chatTabBrickRoad: BrickRoad;
    activeTab: ValueOf<typeof CONST.INBOX_TAB>;
    inboxTabCounts: Record<typeof CONST.INBOX_TAB.TODO | typeof CONST.INBOX_TAB.UNREAD, number>;
    /** Whether the Unread tab holds a report whose newest message is older than CONST.INBOX_TAB_STALE_UNREAD_MONTHS. */
    hasStaleUnreadReport: boolean;
};

type SidebarOrderedReportsActionsContextValue = {
    clearLHNCache: () => void;
    setActiveTab: (tab: ValueOf<typeof CONST.INBOX_TAB>) => void;
    setStickyReportID: (reportID: string) => void;
    /** The report IDs listed under the given Inbox tab, read on demand by bulk tab actions (e.g. "Mark all as read"). */
    getReportIDsForTab: (tab: ValueOf<typeof CONST.INBOX_TAB>) => string[];
};

type ReportsToDisplayInLHN = Record<
    string,
    OnyxTypes.Report & {
        hasErrorsOtherThanFailedReceipt?: boolean;
        requiresAttention?: boolean;
        isUnreadReport?: boolean;
    }
>;

const hasReportSelector = (report: OnyxEntry<OnyxTypes.Report>) => !!report;

const SidebarOrderedReportsStateContext = createContext<SidebarOrderedReportsStateContextValue>({
    filteredReportIDs: [],
    orderedReportIDs: [],
    currentReportID: '',
    chatTabBrickRoad: undefined,
    activeTab: CONST.INBOX_TAB.ALL,
    inboxTabCounts: {
        [CONST.INBOX_TAB.TODO]: 0,
        [CONST.INBOX_TAB.UNREAD]: 0,
    },
    hasStaleUnreadReport: false,
});

/** The Inbox tab's status alone, so tab bars re-render only when it changes, not on every LHN update. */
const SidebarChatTabBrickRoadContext = createContext<BrickRoad>(undefined);

const SidebarOrderedReportsActionsContext = createContext<SidebarOrderedReportsActionsContextValue>({
    clearLHNCache: () => {},
    setActiveTab: () => {},
    setStickyReportID: () => {},
    getReportIDsForTab: () => [],
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
    const {localeCompare} = useLocalize();
    const [inboxTab = CONST.INBOX_TAB.ALL] = useOnyx(ONYXKEYS.NVP_INBOX_TAB);
    const activeTab = inboxTab ?? CONST.INBOX_TAB.ALL;
    const {isBetaEnabled} = usePermissions();
    const isDefaultRoomsBetaEnabled = isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isOffline} = useNetwork();
    const {accountID, login: currentUserLogin} = useCurrentUserPersonalDetails();
    const {currentReportID: currentReportIDValue} = useCurrentReportIDState();
    const derivedCurrentReportID = currentReportIDForTests ?? currentReportIDValue;
    const [cacheVersion, setCacheVersion] = useState(0);

    const {
        reportsToDisplay: reportsToDisplayInLHN,
        orderedReportIDs,
        chatTabBrickRoad,
    } = useLHNOrderedReports({
        currentReportID: derivedCurrentReportID,
        isDefaultRoomsBetaEnabled,
        isOffline,
        currentUserLogin: currentUserLogin ?? '',
        currentUserAccountID: accountID,
        localeCompare,
        cacheVersion,
    });

    // When a report is opened from the To-do/Unread tab (see setStickyReportID), we remember it so it
    // stays visible after viewing it removes it from the tab (e.g. it gets read). It's only set on a
    // non-All tab, so opening a chat from the All tab never makes it appear under Unread/To-do.
    const [stickyReport, setStickyReport] = useState<{reportID: string; tab: ValueOf<typeof CONST.INBOX_TAB>} | undefined>(undefined);

    // The reports for the active tab, plus the sticky report opened from it (kept visible even after it's read).
    const stickyReportID = stickyReport?.reportID;
    const stickyReportTab = stickyReport?.tab;
    const [hasStickyReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(stickyReportID)}`, {selector: hasReportSelector});
    const computedFilteredReportIDs = useMemo(() => {
        const baseFilteredReportIDs = SidebarUtils.filterReportsForInboxTab(orderedReportIDs, reportsToDisplayInLHN, activeTab);
        if (activeTab === CONST.INBOX_TAB.ALL || !stickyReportID || stickyReportTab !== activeTab || baseFilteredReportIDs.includes(stickyReportID)) {
            return baseFilteredReportIDs;
        }
        if (!orderedReportIDs.includes(stickyReportID)) {
            // While opening the report, reading it can briefly drop it from the LHN set entirely (before
            // navigation marks it as the focused report). Keep it at the top so the list doesn't flash empty.
            if (!hasStickyReport) {
                return baseFilteredReportIDs;
            }
            return [stickyReportID, ...baseFilteredReportIDs];
        }
        const baseSet = new Set(baseFilteredReportIDs);
        return orderedReportIDs.filter((reportID) => baseSet.has(reportID) || reportID === stickyReportID);
    }, [orderedReportIDs, reportsToDisplayInLHN, activeTab, stickyReportTab, stickyReportID, hasStickyReport]);
    const filteredReportIDs = useStableArrayReference(computedFilteredReportIDs);

    // Derived from the full "All" set (not the currently filtered view).
    const {counts: inboxTabCounts, hasStaleUnreadReport} = useMemo(() => SidebarUtils.getInboxTabSummary(orderedReportIDs, reportsToDisplayInLHN), [orderedReportIDs, reportsToDisplayInLHN]);

    // Held in a ref so getReportIDsForTab stays referentially stable (keeping the actions context stable) and only
    // filters when a bulk tab action actually asks for a tab's reports, rather than on every LHN update.
    const inboxTabSourcesRef = useRef({orderedReportIDs, reportsToDisplayInLHN});
    useEffect(() => {
        inboxTabSourcesRef.current = {orderedReportIDs, reportsToDisplayInLHN};
    }, [orderedReportIDs, reportsToDisplayInLHN]);
    const getReportIDsForTab = useCallback(
        (tab: ValueOf<typeof CONST.INBOX_TAB>) => SidebarUtils.filterReportsForInboxTab(inboxTabSourcesRef.current.orderedReportIDs, inboxTabSourcesRef.current.reportsToDisplayInLHN, tab),
        [],
    );

    const clearLHNCache = useCallback(() => {
        Log.info('[useSidebarOrderedReports] Clearing sidebar cache manually via debug modal');
        setCacheVersion((current) => current + 1);
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
            const updatedFilteredIDs = SidebarUtils.filterReportsForInboxTab(orderedReportIDs, reportsToDisplayInLHN, activeTab);
            return {
                filteredReportIDs: arraysEqual(updatedFilteredIDs, filteredReportIDs) ? filteredReportIDs : updatedFilteredIDs,
                orderedReportIDs,
                currentReportID: derivedCurrentReportID,
                chatTabBrickRoad,
                activeTab,
                inboxTabCounts,
                hasStaleUnreadReport,
            };
        }

        return {
            filteredReportIDs,
            orderedReportIDs,
            currentReportID: derivedCurrentReportID,
            chatTabBrickRoad,
            activeTab,
            inboxTabCounts,
            hasStaleUnreadReport,
        };
    }, [orderedReportIDs, filteredReportIDs, derivedCurrentReportID, shouldUseNarrowLayout, chatTabBrickRoad, activeTab, inboxTabCounts, hasStaleUnreadReport, reportsToDisplayInLHN]);

    const actionsValue: SidebarOrderedReportsActionsContextValue = useMemo(
        () => ({clearLHNCache, setActiveTab, setStickyReportID, getReportIDsForTab}),
        [clearLHNCache, setActiveTab, setStickyReportID, getReportIDsForTab],
    );

    return (
        <SidebarOrderedReportsStateContext.Provider value={stateValue}>
            <SidebarChatTabBrickRoadContext.Provider value={stateValue.chatTabBrickRoad}>
                <SidebarOrderedReportsActionsContext.Provider value={actionsValue}>{children}</SidebarOrderedReportsActionsContext.Provider>
            </SidebarChatTabBrickRoadContext.Provider>
        </SidebarOrderedReportsStateContext.Provider>
    );
}

function useSidebarOrderedReportsState() {
    return useContext(SidebarOrderedReportsStateContext);
}

function useChatTabBrickRoad() {
    return useContext(SidebarChatTabBrickRoadContext);
}

function useSidebarOrderedReportsActions() {
    return useContext(SidebarOrderedReportsActionsContext);
}

function useSidebarOrderedReports() {
    const state = useSidebarOrderedReportsState();
    const actions = useSidebarOrderedReportsActions();
    // Memoize the merged result: OXC's React Compiler bails on this file, so without this the returned
    // object would be a fresh reference every render on web.
    return useMemo(() => ({...state, ...actions}), [state, actions]);
}

export {SidebarOrderedReportsContextProvider, useChatTabBrickRoad, useSidebarOrderedReports, useSidebarOrderedReportsState, useSidebarOrderedReportsActions};
export type {ReportsToDisplayInLHN};
