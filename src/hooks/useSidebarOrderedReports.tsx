import React, {createContext, useContext, useEffect, useMemo, useRef} from 'react';
import SidebarUtils from '@libs/SidebarUtils';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';
import {getChatTabBrickRoad} from '@libs/WorkspacesSettingsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import {useCurrentReportIDState} from './useCurrentReportID';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import useReportAttributes from './useReportAttributes';
import useResponsiveLayout from './useResponsiveLayout';

const componentsUsingHook = new Map<string, {renderDuration: number}>();

const EMPTY_ORDERED_REPORT_IDS: string[] = [];

type SidebarOrderedReportsContextProviderProps = {
    children: React.ReactNode;
    currentReportIDForTests?: string;
};

type SidebarOrderedReportsStateContextValue = {
    orderedReportIDs: string[];
    currentReportID: string | undefined;
    chatTabBrickRoad: BrickRoad;
};

type ReportsToDisplayInLHN = Record<string, OnyxTypes.Report & {hasErrorsOtherThanFailedReceipt?: boolean; requiresAttention?: boolean}>;

const SidebarOrderedReportsStateContext = createContext<SidebarOrderedReportsStateContextValue>({
    orderedReportIDs: [],
    currentReportID: '',
    chatTabBrickRoad: undefined,
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
    const [derived] = useOnyx(ONYXKEYS.DERIVED.RAM_ONLY_SIDEBAR_ORDERED_REPORTS);
    const [chatReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [reportsDrafts] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT);
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [priorityMode = CONST.PRIORITY_MODE.DEFAULT] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE);
    const reportAttributes = useReportAttributes();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isOffline} = useNetwork();
    const {accountID, login: currentUserLogin} = useCurrentUserPersonalDetails();
    const {currentReportID: currentReportIDValue} = useCurrentReportIDState();
    const derivedCurrentReportID = currentReportIDForTests ?? currentReportIDValue;

    const baseOrderedReportIDs = derived?.orderedReportIDs ?? EMPTY_ORDERED_REPORT_IDS;
    const baseReportsToDisplay = derived?.reportsToDisplay;

    // Web parity: when the active report would not normally pass `shouldDisplayReportInLHN` we still
    // need it to appear in the LHN. Recompute once with `currentReportID` set when that happens.
    // Mobile (narrow layout) only triggers the recompute when the list is otherwise empty.
    const orderedReportIDs = useMemo(() => {
        const needsCurrentReportInjected =
            (!shouldUseNarrowLayout || baseOrderedReportIDs.length === 0) &&
            !!derivedCurrentReportID &&
            derivedCurrentReportID !== '-1' &&
            baseOrderedReportIDs.indexOf(derivedCurrentReportID) === -1;

        if (!needsCurrentReportInjected) {
            return baseOrderedReportIDs;
        }

        const reportsToDisplay = SidebarUtils.updateReportsToDisplayInLHN({
            displayedReports: baseReportsToDisplay ?? {},
            reports: chatReports,
            updatedReportsKeys: [`${ONYXKEYS.COLLECTION.REPORT}${derivedCurrentReportID}`],
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
        });

        const hasDraftByReportID: Record<string, boolean> = {};
        if (reportsDrafts) {
            for (const [key, value] of Object.entries(reportsDrafts)) {
                if (value) {
                    hasDraftByReportID[key.replace(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, '')] = true;
                }
            }
        }

        return SidebarUtils.sortReportsToDisplayInLHN(reportsToDisplay, priorityMode, localeCompare, hasDraftByReportID, reportNameValuePairs, reportAttributes);
    }, [
        baseOrderedReportIDs,
        baseReportsToDisplay,
        shouldUseNarrowLayout,
        derivedCurrentReportID,
        chatReports,
        betas,
        priorityMode,
        reportsDrafts,
        transactionViolations,
        transactions,
        isOffline,
        currentUserLogin,
        accountID,
        reportNameValuePairs,
        reportAttributes,
        localeCompare,
    ]);

    const stateValue: SidebarOrderedReportsStateContextValue = useMemo(
        () => ({
            orderedReportIDs,
            currentReportID: derivedCurrentReportID,
            chatTabBrickRoad: getChatTabBrickRoad(orderedReportIDs, reportAttributes),
        }),
        [orderedReportIDs, derivedCurrentReportID, reportAttributes],
    );

    return <SidebarOrderedReportsStateContext.Provider value={stateValue}>{children}</SidebarOrderedReportsStateContext.Provider>;
}

function useSidebarOrderedReportsState(componentName?: string) {
    useSidebarOrderedReportsPerformance(componentName);
    return useContext(SidebarOrderedReportsStateContext);
}

function useSidebarOrderedReports(componentName?: string) {
    return useSidebarOrderedReportsState(componentName);
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

export {SidebarOrderedReportsContextProvider, useSidebarOrderedReports, useSidebarOrderedReportsState};
export type {ReportsToDisplayInLHN};
