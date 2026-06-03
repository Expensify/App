import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {ReportNameValuePairs} from '@src/types/onyx';

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
    return indicator[String(agentAccountID)]?.trim() ?? '';
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
    return Object.keys(indicator)
        .filter((key) => !!indicator[key]?.trim())
        .map(Number)
        .filter((accountID) => !Number.isNaN(accountID))
        .sort((a, b) => a - b);
}

export {getAgentZeroProcessingLabel, agentZeroProcessingAgentIDsSelector};
