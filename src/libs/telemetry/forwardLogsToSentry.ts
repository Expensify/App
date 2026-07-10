import type {SeverityLevel} from '@sentry/react-native';
import type {TupleToUnion} from 'type-fest';

import * as Sentry from '@sentry/react-native';

type SentryLogLevel = 'debug' | 'info' | 'warn' | 'error';

/** Maps our log levels onto Sentry breadcrumb severity levels. */
const SENTRY_BREADCRUMB_LEVEL: Record<SentryLogLevel, SeverityLevel> = {
    debug: 'debug',
    info: 'info',
    warn: 'warning',
    error: 'error',
};

/**
 * Whitelist of parameter key patterns allowed to be forwarded to Sentry.
 * Exact strings match the key literally, regexes match against the flattened dot-notation key.
 * Example: /^mfa\./ matches all keys under the `mfa` namespace (mfa.scenario, mfa.isOffline, etc.).
 */
const PARAMETERS_WHITELIST: ReadonlyArray<string | RegExp> = [
    'timestamp',
    'error',
    'command',
    'isSupportAuthTokenUsed',
    'type',
    'lastUpdateID',
    'previousLastUpdateIDAppliedToClient',
    /^mfa\./,
];

/**
 * Only log lines whose message contains one of these prefixes are forwarded to Sentry.
 */
const FORWARDED_LOG_PREFIXES = ['[Reauthenticate]', '[MFA]', '[OnyxUpdateManagerError]', '[Receipt]'] as const;

type ForwardedLogPrefix = TupleToUnion<typeof FORWARDED_LOG_PREFIXES>;

/**
 * Extra parameter keys forwarded only for a given log prefix, on top of PARAMETERS_WHITELIST. A key here is not
 * allowed for any other prefix, so a generic key like event cannot leak from an unrelated line. This keeps the
 * receipt keys tied to the receipt logs instead of widening the global whitelist.
 */
const PREFIX_SCOPED_PARAMETERS_WHITELIST = new Map<ForwardedLogPrefix, ReadonlyArray<string | RegExp>>([['[Receipt]', ['receiptTraceId', 'transactionID', 'event']]]);

/**
 * Method deciding whether a log packet should be forwarded to Sentry.
 *
 * ATTENTION!
 * Currently, this always returns false because we want to deliberately decide what is being forwarded.
 * There is no redaction / filtering of sensitive data implemented yet. When you implement any log forwarding logic, make sure that you do not leak any sensitive data.
 */

function getMatchedForwardPrefix(message: string): TupleToUnion<typeof FORWARDED_LOG_PREFIXES> | undefined {
    return FORWARDED_LOG_PREFIXES.find((prefix) => message.includes(prefix));
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

function isKeyWhitelisted(key: string, prefix: ForwardedLogPrefix): boolean {
    const matchesPattern = (pattern: string | RegExp) => (typeof pattern === 'string' ? key === pattern : pattern.test(key));
    const prefixScopedPatterns = PREFIX_SCOPED_PARAMETERS_WHITELIST.get(prefix) ?? [];
    return PARAMETERS_WHITELIST.some(matchesPattern) || prefixScopedPatterns.some(matchesPattern);
}

function filterWhitelistedParameters(parameters: Record<string, unknown>, prefix: ForwardedLogPrefix): Record<string, unknown> {
    return Object.fromEntries(Object.entries(parameters).filter(([key]) => isKeyWhitelisted(key, prefix)));
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

function prepareParametersForSentry(parameters: Record<string, unknown> | undefined, prefix: ForwardedLogPrefix): Record<string, unknown> | undefined {
    if (!parameters) {
        return undefined;
    }

    return filterWhitelistedParameters(flattenNestedParameters(parameters), prefix);
}

function forwardLogsToSentry(logPacket: string | undefined) {
    if (!logPacket) {
        return;
    }

    let parsedPacket:
        | Array<{
              message?: string;
              parameters?: Record<string, unknown> | undefined;
          }>
        | undefined;
    try {
        parsedPacket = JSON.parse(logPacket) as typeof parsedPacket;
    } catch {
        Sentry.logger.warn('Failed to parse log packet for Sentry forwarding', {
            logPacket,
        });
        return;
    }

    if (!Array.isArray(parsedPacket)) {
        return;
    }

    for (const logLine of parsedPacket) {
        if (!logLine || typeof logLine.message !== 'string') {
            continue;
        }
        const prefix = getMatchedForwardPrefix(logLine.message);
        if (!prefix) {
            continue;
        }

        const params = prepareParametersForSentry(logLine.parameters, prefix);
        const level = mapLogMessageToSentryLevel(logLine.message);
        const logMethod = Sentry.logger[level];
        if (logMethod) {
            if (params) {
                logMethod(logLine.message, params);
            } else {
                logMethod(logLine.message);
            }
        }

        // Mirror the line as a breadcrumb so the trail shows up on any crash or error. The breadcrumb carries the same
        // whitelisted keys as the forwarded log, so only opaque ids, never the receipt source, filename, or bytes. You
        // can search the trace id by data.receiptTraceId. We avoid Sentry.setTag because tags are global, so the latest
        // receipt would overwrite earlier ones and tag unrelated crashes with the wrong id.
        Sentry.addBreadcrumb({
            category: prefix.replaceAll(/[[\]]/g, '').toLowerCase(),
            type: 'info',
            level: SENTRY_BREADCRUMB_LEVEL[level],
            message: logLine.message,
            data: params,
        });
    }
}

export default forwardLogsToSentry;
