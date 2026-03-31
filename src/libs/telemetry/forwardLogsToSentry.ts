import * as Sentry from '@sentry/react-native';

type SentryLogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Whitelist of parameter key patterns allowed to be forwarded to Sentry.
 * Exact strings match the key literally, regexes match against the flattened dot-notation key.
 * Example: /^mfa\./ matches all keys under the `mfa` namespace (mfa.scenario, mfa.isOffline, etc.).
 */
const PARAMETERS_WHITELIST: ReadonlyArray<string | RegExp> = ['timestamp', 'error', 'command', 'isSupportAuthTokenUsed', /^mfa\./];

/**
 * Only log lines whose message contains one of these prefixes are forwarded to Sentry.
 */
const FORWARDED_LOG_PREFIXES = ['[Reauthenticate]', '[MFA]'] as const;

/**
 * Method deciding whether a log packet should be forwarded to Sentry.
 *
 * ATTENTION!
 * Currently, this always returns false because we want to deliberately decide what is being forwarded.
 * There is no redaction / filtering of sensitive data implemented yet. When you implement any log forwarding logic, make sure that you do not leak any sensitive data.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function shouldForwardLog(log: {message?: string; parameters?: Record<string, unknown> | undefined}) {
    return FORWARDED_LOG_PREFIXES.some((prefix) => log.message?.includes(prefix));
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isKeyWhitelisted(key: string): boolean {
    return PARAMETERS_WHITELIST.some((pattern) => (typeof pattern === 'string' ? key === pattern : pattern.test(key)));
}

function filterWhitelistedParameters(parameters: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(Object.entries(parameters).filter(([key]) => isKeyWhitelisted(key)));
}

function flattenNestedParameters(parameters: Record<string, unknown>, prefix = ''): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(parameters)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (isPlainObject(value)) {
            Object.assign(result, flattenNestedParameters(value, fullKey));
        } else {
            result[fullKey] = value;
        }
    }

    return result;
}

function prepareParametersForSentry(parameters: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
    if (!parameters) {
        return undefined;
    }

    return filterWhitelistedParameters(flattenNestedParameters(parameters));
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
            logMethod(logLine.message, prepareParametersForSentry(logLine.parameters));
        } else {
            logMethod(logLine.message);
        }
    }
}

export default forwardLogsToSentry;
