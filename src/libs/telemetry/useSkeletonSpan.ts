import type {SpanAttributes} from '@sentry/core';
import {useEffect, useId} from 'react';
import CONST from '@src/CONST';
import {endSpan, getSpan, startSpan} from './activeSpans';

/**
 * Reason attributes for skeleton spans - describes why the skeleton is being rendered.
 * These will be namespaced with a 'skeleton.' prefix in telemetry.
 */
type SkeletonSpanReasonAttributes = {
    /**
     * Describes where the component is rendered using component hierarchy.
     * Use dot notation to show parent-child relationships.
     *
     * Examples:
     * - 'ReportScreen' - Top-level screen
     * - 'ReportScreen.CommentsList' - Component within ReportScreen
     * - 'WorkspaceSettings.Members.MemberList' - Nested component hierarchy
     *
     * We don't always need full hierarchy of components. Focus on keeping this descriptive yet simple.
     */
    context: string;
} & SpanAttributes;

/**
 * Create a span for a skeleton component. This helps identify "infinite skeleton" issues where loading states don't resolve.
 * Pass the @reasonAttributes parameter to add additional context about why the skeleton is rendered.
 * All attributes will be namespaced with a 'skeleton.' prefix for easy querying in Sentry.
 */
function useSkeletonSpan(component: string, reasonAttributes?: SkeletonSpanReasonAttributes) {
    const reactId = useId();
    const spanId = `${CONST.TELEMETRY.SPAN_SKELETON}_${component}_${reactId}`;

    useEffect(() => {
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

    useEffect(() => {
        const span = getSpan(spanId);
        if (!span || !reasonAttributes) {
            return;
        }

        const namespacedAttributes = Object.fromEntries(Object.entries(reasonAttributes).map(([key, value]) => [`${CONST.TELEMETRY.ATTRIBUTE_SKELETON_PREFIX}${key}`, value]));
        span.setAttributes(namespacedAttributes);
        span.addEvent(CONST.TELEMETRY.EVENT_SKELETON_ATTRIBUTES_UPDATE, namespacedAttributes);
    }, [reasonAttributes, spanId]);
}

export default useSkeletonSpan;
export type {SkeletonSpanReasonAttributes};
