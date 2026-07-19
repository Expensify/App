import CONST from '@src/CONST';
import type {ReportNameValuePairs} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type AgentZeroProcessingIndicator = NonNullable<ReportNameValuePairs['agentZeroProcessingRequestIndicator']>;

function isAgentZeroProcessingIndicatorMap(indicator: AgentZeroProcessingIndicator): indicator is Record<string, string | null> {
    return typeof indicator === 'object' && indicator !== null && !Array.isArray(indicator);
}

/**
 * Reads the AgentZero processing-indicator label for a single agent, trimmed.
 *
 * Tolerates a legacy scalar value (a plain string written by an older backend during a deploy
 * overlap) by attributing it to Concierge — that matches the pre-per-agent behavior.
 */
function getAgentZeroProcessingLabel(reportNameValuePairs: OnyxEntry<ReportNameValuePairs>, agentAccountID: number): string {
    const indicator = reportNameValuePairs?.agentZeroProcessingRequestIndicator;
    if (!indicator) {
        return '';
    }
    if (typeof indicator === 'string') {
        return agentAccountID === CONST.ACCOUNT_ID.CONCIERGE ? indicator.trim() : '';
    }
    if (!isAgentZeroProcessingIndicatorMap(indicator)) {
        return '';
    }
    const label = indicator[String(agentAccountID)];
    return typeof label === 'string' ? label.trim() : '';
}

/**
 * Sorted list of agent accountIDs that currently have a non-empty processing label — the set of
 * agents the server is actively processing for in this report. Drives which thinking bubbles render.
 */
function agentZeroProcessingAgentIDsSelector(reportNameValuePairs: OnyxEntry<ReportNameValuePairs>): number[] {
    const indicator = reportNameValuePairs?.agentZeroProcessingRequestIndicator;
    if (!indicator) {
        return [];
    }
    if (typeof indicator === 'string') {
        return indicator.trim() ? [CONST.ACCOUNT_ID.CONCIERGE] : [];
    }
    if (!isAgentZeroProcessingIndicatorMap(indicator)) {
        return [];
    }
    return Object.entries(indicator)
        .filter(([, label]) => typeof label === 'string' && !!label.trim())
        .map(([key]) => Number(key))
        .filter((accountID) => !Number.isNaN(accountID))
        .sort((a, b) => a - b);
}

export {getAgentZeroProcessingLabel, agentZeroProcessingAgentIDsSelector};
