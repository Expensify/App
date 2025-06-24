import {useMemo, useState, useCallback, useRef, useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import PaginationUtils from '@libs/PaginationUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Get the longest continuous chunk of reportActions including the linked reportAction. If not linking to a specific action, returns the continuous chunk of newest reportActions.
 */

const REPORT_ACTIONS_PER_PAGE = 50;

type FrontendPaginationState = {
    startIndex: number;
    endIndex: number;
    targetActionID?: string;
} | null;

function usePaginatedReportActions(reportID: string | undefined, reportActionID?: string) {
    const nonEmptyStringReportID = getNonEmptyStringOnyxID(reportID);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${nonEmptyStringReportID}`);
    const canUserPerformWriteAction = ReportUtils.canUserPerformWriteAction(report);

    const [sortedAllReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${nonEmptyStringReportID}`, {
        canEvict: false,
        selector: (allReportActions) => ReportActionsUtils.getSortedReportActionsForDisplay(allReportActions, canUserPerformWriteAction, true),
    });
    const [reportActionPages] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${nonEmptyStringReportID}`);

    const [frontendPaginationState, setFrontendPaginationState] = useState<FrontendPaginationState>(null);

    const desiredPaginationState = useMemo(() => {
        if (!nonEmptyStringReportID || !sortedAllReportActions) {
            return null;
        }

        const chainResult = PaginationUtils.getContinuousChain(sortedAllReportActions, reportActionPages ?? [], (reportAction) => reportAction.reportActionID, reportActionID);
        
        // If we only have ~50 items total, don't bother with pagination
        if (chainResult.data.length <= REPORT_ACTIONS_PER_PAGE * 2) {
            return null;
        }

        // Initialize pagination state if this is the first time or if user clicked a different message link
        if (!frontendPaginationState || frontendPaginationState.targetActionID !== reportActionID) {
            if (reportActionID) {
                // Deep linking: User clicked a link to a specific message
                const targetIndex = chainResult.data.findIndex(action => String(action.reportActionID) === String(reportActionID));

                // Find the target message and show 25 messages before + 25 after it (centered view)
                if (targetIndex !== -1) {
                    const startIndex = Math.max(0, targetIndex - Math.floor(REPORT_ACTIONS_PER_PAGE / 2));
                    const endIndex = Math.min(chainResult.data.length, startIndex + REPORT_ACTIONS_PER_PAGE);
                    const adjustedStartIndex = Math.max(0, endIndex - REPORT_ACTIONS_PER_PAGE);
                    
                    return {
                        startIndex: adjustedStartIndex,
                        endIndex,
                        targetActionID: reportActionID,
                    };
                }
                // Target message not found in loaded data, default to showing first page
                return {
                    startIndex: 0,
                    endIndex: REPORT_ACTIONS_PER_PAGE,
                    targetActionID: reportActionID,
                };
            }
            // Normal browsing: No specific message targeted
            // Start with most recent messages (first 50 items)
            return {
                startIndex: 0,
                endIndex: REPORT_ACTIONS_PER_PAGE,
                targetActionID: undefined,
            };
        }
        return frontendPaginationState;
    }, [reportActionID, reportActionPages, sortedAllReportActions, nonEmptyStringReportID, frontendPaginationState]);

    useEffect(() => {
        const areStatesEqual =
            (desiredPaginationState && 
             frontendPaginationState &&
             desiredPaginationState.startIndex === frontendPaginationState.startIndex &&
             desiredPaginationState.endIndex === frontendPaginationState.endIndex &&
             desiredPaginationState.targetActionID === frontendPaginationState.targetActionID);
        
        if (!areStatesEqual) {
            setFrontendPaginationState(desiredPaginationState);
        }
    }, [desiredPaginationState, frontendPaginationState]);

    const {
        data: reportActions,
        hasNextPage,
        hasPreviousPage,
    } = useMemo(() => {
        if (!nonEmptyStringReportID || !sortedAllReportActions) {
            return {data: [], hasNextPage: false, hasPreviousPage: false};
        }

        const chainResult = PaginationUtils.getContinuousChain(sortedAllReportActions, reportActionPages ?? [], (reportAction) => reportAction.reportActionID, reportActionID);
        
        // Use current pagination state to slice data
        if (frontendPaginationState) {
            const isAtEndOfFrontendData = frontendPaginationState.endIndex >= chainResult.data.length;
            const hasMoreDataOnBackend = chainResult.hasNextPage;
            
            return {
                // Apply the pagination window to slice the data
                data: chainResult.data.slice(frontendPaginationState.startIndex, frontendPaginationState.endIndex),
                hasNextPage: frontendPaginationState.endIndex < chainResult.data.length || (isAtEndOfFrontendData && hasMoreDataOnBackend),
                hasPreviousPage: frontendPaginationState.startIndex > 0,
            };
        }

        // No pagination needed, return all data
        return chainResult;
    }, [reportActionID, reportActionPages, sortedAllReportActions, nonEmptyStringReportID, frontendPaginationState]);

    const linkedAction = useMemo(
        () => (reportActionID ? sortedAllReportActions?.find((reportAction) => String(reportAction.reportActionID) === String(reportActionID)) : undefined),
        [reportActionID, sortedAllReportActions],
    );
    
    const prevDataLengthRef = useRef(sortedAllReportActions?.length ?? 0);

    // Automatically expand pagination window when new data arrives
    // This ensures users see newly loaded messages without manual action
    useEffect(() => {
        if (!frontendPaginationState || !sortedAllReportActions?.length) {
            prevDataLengthRef.current = sortedAllReportActions?.length ?? 0;
            return;
        }

        // Only auto-expand if new data was actually loaded from backend
        // This prevents expanding just because we have a lot of data already
        if (sortedAllReportActions.length > prevDataLengthRef.current) {
            const newEndIndex = Math.min(sortedAllReportActions.length, frontendPaginationState.endIndex + REPORT_ACTIONS_PER_PAGE);
            if (newEndIndex > frontendPaginationState.endIndex) {
                setFrontendPaginationState({
                    ...frontendPaginationState,
                    endIndex: newEndIndex,
                });
            }
        }

        //  Handle when Onyx cache was cleared or data disappeared
        // Reset pagination to show first 50 items when this happens
        if (sortedAllReportActions.length < prevDataLengthRef.current) {
            setFrontendPaginationState({
                startIndex: 0,
                endIndex: REPORT_ACTIONS_PER_PAGE,
                targetActionID: undefined,
            });
        }

        // Update reference for next comparison
        prevDataLengthRef.current = sortedAllReportActions.length;
    }, [sortedAllReportActions, frontendPaginationState, reportActionID]);
    
    
    // Show more older messages (scroll down / "Load More")
    // Returns true if successful, false if no more data (so caller can fallback to API)
    const expandOlderActions = useCallback((): boolean => {
        if (!nonEmptyStringReportID || !sortedAllReportActions?.length || !frontendPaginationState) {
            return false;
        }
        
        const chainResult = PaginationUtils.getContinuousChain(sortedAllReportActions, reportActionPages ?? [], (reportAction) => reportAction.reportActionID, reportActionID);
        const newEndIndex = Math.min(chainResult.data.length, frontendPaginationState.endIndex + REPORT_ACTIONS_PER_PAGE);
        
        // Try to expand the window by 50 more items
        if (newEndIndex > frontendPaginationState.endIndex) {
            setFrontendPaginationState({
                ...frontendPaginationState,
                endIndex: newEndIndex,
            });
            return true;
        } 
            // Return false so useLoadReportActions can fallback to API calls
            // when we've exhausted frontend pagination but there's more data on backend
            return false;
        
    }, [nonEmptyStringReportID, sortedAllReportActions, reportActionPages, reportActionID, frontendPaginationState]);

    // Show more newer messages (scroll up / "Load Newer")
    // Moves the pagination window backwards to include more recent messages
    const expandNewerActions = useCallback((): boolean => {
        if (!nonEmptyStringReportID || !sortedAllReportActions?.length || !frontendPaginationState) {
            return false;
        }
        
        // Try to move window start backwards by 50 items
        // Example: Window [50-100] becomes [0-100] to show 50 newer messages
        const newStartIndex = Math.max(0, frontendPaginationState.startIndex - REPORT_ACTIONS_PER_PAGE);
        
        // Only update if we can actually move backwards (not already at beginning)
        if (newStartIndex < frontendPaginationState.startIndex) {
            setFrontendPaginationState({
                ...frontendPaginationState,
                startIndex: newStartIndex,
            });
            return true;
        } 
            return false;
        
    }, [nonEmptyStringReportID, sortedAllReportActions?.length, frontendPaginationState]);
    
    return {
        reportActions,
        linkedAction,
        sortedAllReportActions,
        hasOlderActions: hasNextPage,
        hasNewerActions: hasPreviousPage,
        expandOlderActions,
        expandNewerActions,
    };
}

export default usePaginatedReportActions;
