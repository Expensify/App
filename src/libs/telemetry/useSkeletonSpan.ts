import {useEffect, useId} from 'react';
import CONST from '@src/CONST';
import {endSpan, startSpan} from './activeSpans';

/**
 * Create a span for a skeleton component. This helps identify "infinite skeleton" issues where loading states don't resolve.
 */
function useSkeletonSpan(component: string) {
    const reactId = useId();

    useEffect(() => {
        const spanId = `${CONST.TELEMETRY.SPAN_SKELETON}_${component}_${reactId}`;
        startSpan(
            spanId,
            {
                op: CONST.TELEMETRY.SPAN_SKELETON,
                name: component,
            },
            {
                minDuration: CONST.TELEMETRY.CONFIG.SKELETON_MIN_DURATION,
            },
        );

        return () => endSpan(spanId);
    }, [component, reactId]);
}

export default useSkeletonSpan;
