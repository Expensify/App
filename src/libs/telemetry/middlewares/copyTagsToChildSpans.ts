import CONST from '@src/CONST';
import type {TelemetryBeforeSend} from './index';

/**
 * List of tags that should be copied from the transaction to all child spans
 */
const TAGS_TO_COPY = [CONST.TELEMETRY.TAG_POLICIES_COUNT, CONST.TELEMETRY.TAG_REPORTS_COUNT, CONST.TELEMETRY.TAG_ACTIVE_POLICY, CONST.TELEMETRY.TAG_NUDGE_MIGRATION_COHORT] as const;

/**
 * Middleware that copies specific tags from the transaction event to all child spans.
 * This ensures that child spans inherit important context from the parent transaction.
 */
const copyTagsToChildSpans: TelemetryBeforeSend = (event) => {
    if (!event.spans || event.spans.length === 0) {
        return event;
    }

    if (!event.tags) {
        return event;
    }

    const spans = event.spans.map((span) => {
        const updatedTags: Record<string, unknown> = {};

        for (const tagKey of TAGS_TO_COPY) {
            const tagValue = event.tags?.[tagKey];
            if (tagValue !== undefined) {
                updatedTags[tagKey] = tagValue;
            }
        }

        return {
            ...span,
            tags: updatedTags,
        };
    });

    return {...event, spans};
};

export default copyTagsToChildSpans;
