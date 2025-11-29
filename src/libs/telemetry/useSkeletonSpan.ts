/**
 * This file contains logic related to tracking skeleton across the application.
 */
import {useEffect, useId, useMemo} from 'react';
import {endSpan, startSpan} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';

function useSkeletonSpan(component: string) {
    const reactId = useId();

    useEffect(() => {
        const spanId = `${CONST.TELEMETRY.SPAN_SKELETON}_${component}_${reactId}`;
        startSpan(spanId, {
            op: CONST.TELEMETRY.SPAN_SKELETON,
            name: component,
        });

        return () => endSpan(spanId);
    }, []);
}

export {useSkeletonSpan};
