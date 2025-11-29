/**
 * This file contains logic related to tracking skeleton across the application.
 */
import {useEffect, useId} from 'react';
import CONST from '@src/CONST';
import {endSpan, startSpan} from './activeSpans';

function useSkeletonSpan(component: string) {
    const reactId = useId();

    useEffect(() => {
        const spanId = `${CONST.TELEMETRY.SPAN_SKELETON}_${component}_${reactId}`;
        startSpan(spanId, {
            op: CONST.TELEMETRY.SPAN_SKELETON,
            name: component,
        });

        return () => endSpan(spanId);
    }, [component, reactId]);
}

export default useSkeletonSpan;
