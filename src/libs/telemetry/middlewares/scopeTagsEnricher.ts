import type {TransactionEvent} from '@sentry/core';
import * as Sentry from '@sentry/react-native';
import CONST from '@src/CONST';
import type {TelemetryBeforeSend} from './index';

/**
 * Enriches transaction with tags and contexts from the current Sentry scope.
 * This ensures that tags set asynchronously (e.g. nudge_migration_cohort)
 * are included in transactions that were created before the tags were set.
 * This middleware applies the tag at send-time, ensuring early spans get the tags.
 */
const scopeTagsEnricher: TelemetryBeforeSend = (event: TransactionEvent): TransactionEvent => {
    const scope = Sentry.getCurrentScope();
    const scopeData = scope.getScopeData();

    const enrichedEvent = {
        ...event,
        tags: {
            ...event.tags,
            ...(scopeData.tags?.[CONST.TELEMETRY.TAG_NUDGE_MIGRATION_COHORT] && {
                [CONST.TELEMETRY.TAG_NUDGE_MIGRATION_COHORT]: scopeData.tags[CONST.TELEMETRY.TAG_NUDGE_MIGRATION_COHORT],
            }),
            ...(scopeData.tags?.[CONST.TELEMETRY.TAG_ACTIVE_POLICY] && {
                [CONST.TELEMETRY.TAG_ACTIVE_POLICY]: scopeData.tags[CONST.TELEMETRY.TAG_ACTIVE_POLICY],
            }),
        },
        contexts: {
            ...event.contexts,
            ...(scopeData.contexts?.[CONST.TELEMETRY.CONTEXT_POLICIES] && {
                [CONST.TELEMETRY.CONTEXT_POLICIES]: scopeData.contexts[CONST.TELEMETRY.CONTEXT_POLICIES],
            }),
            ...(scopeData.contexts?.[CONST.TELEMETRY.CONTEXT_MEMORY] && {
                [CONST.TELEMETRY.CONTEXT_MEMORY]: scopeData.contexts[CONST.TELEMETRY.CONTEXT_MEMORY],
            }),
        },
    };

    return enrichedEvent;
};

export default scopeTagsEnricher;
