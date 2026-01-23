import { useEffect, useMemo, useRef, useState } from 'react';
import type { OnyxEntry } from 'react-native-onyx';
import type * as OnyxTypes from '@src/types/onyx';


type ReportWasDeletedResult = {
    /** Whether the report was deleted (was accessible, now is not) */
    wasDeleted: boolean;
    /** The parent report ID from when the report was still accessible */
    parentReportID: string | undefined;
};

/**
 * Returns true if the report was deleted. Resets when reportIDFromRoute changes or report becomes accessible again.
 * Works only when the component with the report was already rendered before deletion -
 * it tracks if reportID was ever equal to reportIDFromRoute, then detects when it becomes undefined.
 *
 * Also stores the parentReportID from when the report was accessible, so it can be used for navigation
 * after the report is deleted.
 */
function useReportWasDeleted(
    reportIDFromRoute: string | undefined,
    report: OnyxEntry<OnyxTypes.Report> | undefined,
    isOptimisticDelete: boolean,
    userLeavingStatus: boolean,
): ReportWasDeletedResult {
    const wasEverAccessibleRef = useRef(false);
    const prevReportIDFromRouteRef = useRef(reportIDFromRoute);
    const [parentReportID, setParentReportID] = useState<string | undefined>(undefined);
    const [wasDeleted, setWasDeleted] = useState(false);

    const currentReportID = report?.reportID;
    const currentParentReportID = report?.parentReportID;

    useEffect(() => {
        const isRouteChanged = prevReportIDFromRouteRef.current !== reportIDFromRoute;
        const isReportAccessible = !!currentReportID && currentReportID === reportIDFromRoute;

        if (isRouteChanged) {
            prevReportIDFromRouteRef.current = reportIDFromRoute;
            wasEverAccessibleRef.current = false;
            // state update is guarded by a route change check, preventing infinite re-render loops
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setWasDeleted(false);
            setParentReportID(undefined);
        }

        if (isReportAccessible) {
            wasEverAccessibleRef.current = true;
            // guarded by route checks to verify if the navigated report exists
            setWasDeleted(false);
            setParentReportID(currentParentReportID);
        }
    }, [currentReportID, currentParentReportID, reportIDFromRoute]);

    useEffect(() => {
        if (!wasEverAccessibleRef.current || currentReportID || isOptimisticDelete || userLeavingStatus) {
            return;
        }
        // guarded by if to prevent rerenders
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setWasDeleted(true);
    }, [currentReportID, isOptimisticDelete, userLeavingStatus]);

    return useMemo(() => ({wasDeleted, parentReportID}), [wasDeleted, parentReportID]);
}

export default useReportWasDeleted;
