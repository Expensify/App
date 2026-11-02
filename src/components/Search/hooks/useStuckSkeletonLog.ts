import {useEffect, useRef} from 'react';
import Log from '@libs/Log';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

/** A Search loading skeleton visible longer than this is treated as stuck and worth a diagnostic log. */
const STUCK_SKELETON_THRESHOLD_MS = 10000;

/**
 * Diagnostic only, does not affect rendering.
 *
 * Call from SearchLoadingSkeleton, whose mount lifetime equals how long the Search loading skeleton is
 * visible. If the skeleton stays up past STUCK_SKELETON_THRESHOLD_MS, this logs a one-off snapshot of its
 * reason conditions (isDataLoaded, isSearchLoading, hasErrors, hasPendingResponse, and so on) so a
 * slow-load repro shows which condition is holding the skeleton, which the immediate skeleton span does
 * not surface on its own.
 */
function useStuckSkeletonLog(reasonAttributes: SkeletonSpanReasonAttributes) {
    // Read the conditions at the moment the timeout fires (which condition is still holding the skeleton),
    // not when it first appeared, without re-arming the timer when the conditions change.
    const reasonAttributesRef = useRef(reasonAttributes);
    useEffect(() => {
        reasonAttributesRef.current = reasonAttributes;
    });

    useEffect(() => {
        const timeoutID = setTimeout(() => {
            Log.info(`[Search] Loading skeleton still visible after ${STUCK_SKELETON_THRESHOLD_MS}ms`, false, reasonAttributesRef.current);
        }, STUCK_SKELETON_THRESHOLD_MS);
        return () => clearTimeout(timeoutID);
    }, []);
}

export default useStuckSkeletonLog;
