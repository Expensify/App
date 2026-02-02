import * as Sentry from '@sentry/react-native';

type SentryLogLevel = 'debug' | 'info' | 'warn' | 'error';

const PARAMETERS_WHITELIST = new Set(['timestamp', 'spanExists', 'spanId', 'spanOptions', 'spanExtraOptions']);

/**
 * Method deciding whether a log packet should be forwarded to Sentry.
 *
 * ATTENTION!
 * Currently, this always returns false because we want to deliberately decide what is being forwarded.
 * There is no redaction / filtering of sensitive data implemented yet. When you implement any log forwarding logic, make sure that you do not leak any sensitive data.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function shouldForwardLog(log: {message?: string; parameters?: Record<string, unknown> | undefined}) {
    if (log.message?.search('[Sentry]') !== -1) {
        return true;
    }
    return false;
}

function mapLogMessageToSentryLevel(message: string): SentryLogLevel {
    if (message.startsWith('[alrt]')) {
        return 'error';
    }
    if (message.startsWith('[warn]') || message.startsWith('[hmmm]')) {
        return 'warn';
    }
    if (message.startsWith('[info]')) {
        return 'info';
    }
    return 'debug';
}

function filterParameters(parameters: Record<string, unknown> | undefined) {
    if (!parameters) {
        return undefined;
    }

    return Object.fromEntries(Object.entries(parameters).filter(([key]) => PARAMETERS_WHITELIST.has(key)));
}

function forwardLogsToSentry(logPacket: string | undefined) {
    if (!logPacket) {
        return;
    }

    let parsedPacket: Array<{message?: string; parameters?: Record<string, unknown> | undefined}> | undefined;
    try {
        parsedPacket = JSON.parse(logPacket) as typeof parsedPacket;
    } catch {
        Sentry.logger.warn('Failed to parse log packet for Sentry forwarding', {logPacket});
        return;
    }

    if (!Array.isArray(parsedPacket)) {
        return;
    }

    for (const logLine of parsedPacket) {
        if (!logLine || typeof logLine.message !== 'string') {
            continue;
        }
        if (!shouldForwardLog(logLine)) {
            continue;
        }

        const level = mapLogMessageToSentryLevel(logLine.message);
        const logMethod = Sentry.logger[level];
        if (!logMethod) {
            continue;
        }

        if (logLine.parameters) {
            logMethod(logLine.message, filterParameters(logLine.parameters));
        } else {
            logMethod(logLine.message);
        }
    }
}

export default forwardLogsToSentry;