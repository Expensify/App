import * as Sentry from '@sentry/react-native';

type SentryLogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Method deciding whether a log packet should be forwarded to Sentry.
 * Currently, this always returns false because we want to deliberately decide what is being forwarded.
 */
function shouldForwardLog(log: {message?: string; parameters?: Record<string, unknown> | undefined}) {
    // eslint-disable-line @typescript-eslint/no-unused-vars
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
            return;
        }

        const level = mapLogMessageToSentryLevel(logLine.message);
        const logMethod = Sentry.logger[level];
        if (!logMethod) {
            continue;
        }

        if (logLine.parameters) {
            logMethod(logLine.message, logLine.parameters);
        } else {
            logMethod(logLine.message);
        }
    }
}

export default forwardLogsToSentry;
