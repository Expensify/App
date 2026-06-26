import {useEffect, useRef} from 'react';
import Log from '@libs/Log';

/** How long the Search skeleton may stay visible before we treat it as stuck and worth logging. */
const STUCK_SKELETON_THRESHOLD_MS = 5000;

/**
 * Diagnostic only, does not affect rendering.
 *
 * The Search skeleton is gated by many interdependent conditions (data loaded, search loading,
 * errors, card feeds, the heavy-work defer, and so on). The existing "[Search] Showing skeleton"
 * log fires the instant the skeleton appears, so it never tells us which condition is still
 * holding the skeleton on a slow load. This logs a single snapshot of all of those conditions
 * once the skeleton has stayed visible past STUCK_SKELETON_THRESHOLD_MS, so a slow-load repro
 * shows exactly which condition is stuck for that user instead of guessing.
 */
function useStuckSkeletonLog(isShowingSkeleton: boolean, conditions: Record<string, unknown>) {
    // Mirror the latest conditions into a ref so the timeout reports the state at the moment it fires
    // (which condition is still holding the skeleton), without re-arming the timer on every render.
    const conditionsRef = useRef(conditions);
    useEffect(() => {
        conditionsRef.current = conditions;
    });

    useEffect(() => {
        if (!isShowingSkeleton) {
            return;
        }
        const timeoutID = setTimeout(() => {
            Log.info(`[Search] Skeleton still visible after ${STUCK_SKELETON_THRESHOLD_MS}ms`, false, conditionsRef.current);
        }, STUCK_SKELETON_THRESHOLD_MS);
        return () => clearTimeout(timeoutID);
    }, [isShowingSkeleton]);
}

export default useStuckSkeletonLog;
