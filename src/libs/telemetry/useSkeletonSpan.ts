import type {SpanAttributes} from '@sentry/core';
import {useEffect, useId} from 'react';
import CONST from '@src/CONST';
import {endSpan, startSpan} from './activeSpans';

/**
 * Reason attributes for skeleton spans - describes why the skeleton is being rendered.
 * These will be namespaced with a 'skeleton.' prefix in telemetry.
 */
type SkeletonSpanReasonAttributes = SpanAttributes;

/**
 * Create a span for a skeleton component. This helps identify "infinite skeleton" issues where loading states don't resolve.
 * Pass the @reasonAttributes parameter to add additional context about why the skeleton is rendered.
 * All attributes will be namespaced with a 'skeleton.' prefix for easy querying in Sentry.
 */
function useSkeletonSpan(component: string, reasonAttributes?: SkeletonSpanReasonAttributes) {
    const reactId = useId();

    useEffect(() => {
        const spanId = `${CONST.TELEMETRY.SPAN_SKELETON}_${component}_${reactId}`;

        // Add skeleton namespace to all reason attributes for easy querying in Sentry
        const namespacedAttributes = reasonAttributes
            ? Object.fromEntries(Object.entries(reasonAttributes).map(([key, value]) => [`${CONST.TELEMETRY.ATTRIBUTE_SKELETON_PREFIX}${key}`, value]))
            : undefined;

        startSpan(
            spanId,
            {
                op: CONST.TELEMETRY.SPAN_SKELETON,
                name: component,
                attributes: namespacedAttributes,
            },
            {
                minDuration: CONST.TELEMETRY.CONFIG.SKELETON_MIN_DURATION,
            },
        );

        return () => endSpan(spanId);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally removing reasonAttributes to prevent re-creating the span on every render if the parameters are unstable
    }, [component, reactId]);
}

export default useSkeletonSpan;
export type {SkeletonSpanReasonAttributes};
