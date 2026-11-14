import CONST from '@src/CONST';
import type {ReportNameValuePairs} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

type AgentZeroProcessingIndicator = NonNullable<ReportNameValuePairs['agentZeroProcessingRequestIndicator']>;

/** The slice of a report's name-value pairs needed to determine whether the report is archived. */
type ReportNameValuePairsArchivedState = Pick<ReportNameValuePairs, 'private_isArchived'>;

/**
 * Extracts only `private_isArchived` from every report's name-value pairs. Consumers that just need the
 * archived state (e.g. to feed `markAllMessagesAsRead`) can subscribe through this selector so they don't
 * re-render whenever unrelated NVP fields (agent-zero indicators, calendly calls, etc.) change.
 */
function reportNameValuePairsArchivedSelector(reportNameValuePairs: OnyxCollection<ReportNameValuePairs>): OnyxCollection<ReportNameValuePairsArchivedState> {
    if (!reportNameValuePairs) {
        return reportNameValuePairs;
    }
    return Object.entries(reportNameValuePairs).reduce<NonNullable<OnyxCollection<ReportNameValuePairsArchivedState>>>((acc, [key, value]) => {
        acc[key] = value ? {private_isArchived: value.private_isArchived} : value;
        return acc;
    }, {});
}

function isAgentZeroProcessingIndicatorMap(indicator: AgentZeroProcessingIndicator): indicator is Record<string, string | null> {
    return typeof indicator === 'object' && indicator !== null && !Array.isArray(indicator);
}

function getAgentZeroProcessingLabels(reportNameValuePairs: OnyxEntry<ReportNameValuePairs>, parentReportActionID?: string): Record<string, string | null> {
    const indicator = reportNameValuePairs?.agentZeroProcessingRequestIndicator;
    let unscopedLabels: Record<string, string | null> = {};
    if (typeof indicator === 'string') {
        // Older servers can still send a single label for Concierge.
        unscopedLabels = {[CONST.ACCOUNT_ID.CONCIERGE]: indicator};
    } else if (indicator && isAgentZeroProcessingIndicatorMap(indicator)) {
        unscopedLabels = indicator;
    }

    const threadLabels = parentReportActionID ? reportNameValuePairs?.agentZeroProcessingRequestIndicatorByParentAction?.[parentReportActionID] : undefined;
    return threadLabels ? {...unscopedLabels, ...threadLabels} : unscopedLabels;
}

/** Reads the processing label for a single agent, trimmed. */
function getAgentZeroProcessingLabel(reportNameValuePairs: OnyxEntry<ReportNameValuePairs>, agentAccountID: number, parentReportActionID?: string): string {
    const label = getAgentZeroProcessingLabels(reportNameValuePairs, parentReportActionID)[String(agentAccountID)];
    return typeof label === 'string' ? label.trim() : '';
}

/**
 * Sorted list of agent accountIDs that currently have a non-empty processing label — the set of
 * agents the server is actively processing for in this report. Drives which thinking bubbles render.
 */
function agentZeroProcessingAgentIDsSelector(reportNameValuePairs: OnyxEntry<ReportNameValuePairs>, parentReportActionID?: string): number[] {
    return Object.entries(getAgentZeroProcessingLabels(reportNameValuePairs, parentReportActionID))
        .filter(([, label]) => typeof label === 'string' && !!label.trim())
        .map(([key]) => Number(key))
        .filter((accountID) => !Number.isNaN(accountID))
        .sort((a, b) => a - b);
}

function latestCalendlyCallSelector(reportNameValuePairs: OnyxEntry<ReportNameValuePairs>) {
    return reportNameValuePairs?.calendlyCalls?.at(-1);
}

function isLinkedToBillSelector(reportNameValuePairs: OnyxEntry<ReportNameValuePairs>): boolean {
    return !!reportNameValuePairs?.billID;
}

export {getAgentZeroProcessingLabel, agentZeroProcessingAgentIDsSelector, isLinkedToBillSelector, latestCalendlyCallSelector, reportNameValuePairsArchivedSelector};
export type {ReportNameValuePairsArchivedState};
