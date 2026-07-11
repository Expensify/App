/*
 * Formats log lines to match Web-Expensify's Log.php rsyslog output (see
 * Web-Expensify/lib/Log.php::_writeRsyslog and ::paramString) so existing Victoria Logs parsing
 * keeps working for lines emitted by the victory-chart-renderer CLI.
 *
 * Line shape: <6>victory-chart-renderer: {REQUEST_ID} victory-chart-renderer  !script! ?vcr? [level] message ~~ key: 'value'
 */

export type LogLevel = 'info' | 'hmmm' | 'warn' | 'alrt';

// Mirrors expensify-common's Logger#Parameters union (see Logger.d.ts) so callers can pass through
// whatever they'd otherwise pass to the real Log.
export type LogParams = string | Record<string, unknown> | Array<Record<string, unknown>> | Error | undefined;

type FormatExpensifyRsyslogLineOptions = {
    level: LogLevel;
    message: string;
    params?: LogParams;
    requestId: string;
};

// Log.php's LOG_DIRECT_PREFIX is "<6>php-fpm: "; rsyslog uses the process name after the priority
// to identify the log source, so ours identifies this CLI instead.
const LOG_DIRECT_PREFIX = '<6>victory-chart-renderer: ';
const SCRIPT_NAME = 'victory-chart-renderer';
const SOURCE_TAG = 'script';
const CALLER_TAG = 'vcr';

// rsyslog caps messages at 8kb; Log.php leaves headroom below that for the prefix.
const MESSAGE_LIMIT_BYTES = 7168;
const MIN_CHUNK_BYTES = 10;
const TRUNCATED_REQUEST_ID_LENGTH = 10;

const SENSITIVE_KEY_PATTERN = /token|password|secret|apikey|cookie/i;
const REDACTED = '<REDACTED>';

function buildPrefix(requestId: string, level: LogLevel): string {
    // Email is always empty for this subprocess (no user session), which is why there are two
    // spaces before "!script!" below: one trailing the empty email field, one leading the source tag.
    return `${LOG_DIRECT_PREFIX}${requestId} ${SCRIPT_NAME}  !${SOURCE_TAG}! ?${CALLER_TAG}? [${level}] `;
}

function stringifyParamValue(value: unknown): string {
    if (value === undefined || value === null) {
        return '';
    }
    if (typeof value === 'string') {
        return value;
    }
    if (value instanceof Error) {
        return value.stack ?? value.message;
    }
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    return String(value);
}

function formatParamEntries(entries: Array<[string, unknown]>): string {
    if (entries.length === 0) {
        return '';
    }

    const pretty = entries.map(([key, value]) => `${key}: '${SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : stringifyParamValue(value)}'`).join(' ');
    return ` ~~ ${pretty}`;
}

function formatParamString(params: LogParams): string {
    if (params === undefined) {
        return '';
    }
    if (typeof params === 'string') {
        return params.length > 0 ? ` ~~ ${params}` : '';
    }
    if (params instanceof Error) {
        return ` ~~ ${stringifyParamValue(params)}`;
    }

    const entries = Array.isArray(params) ? params.flatMap((entry) => Object.entries(entry)) : Object.entries(params);
    return formatParamEntries(entries);
}

function chunkMessageBytes(message: string, chunkSizeBytes: number): string[] {
    const bytes = Buffer.from(message, 'utf8');

    if (bytes.length === 0) {
        return [''];
    }

    const chunks: string[] = [];
    for (let offset = 0; offset < bytes.length; offset += chunkSizeBytes) {
        chunks.push(bytes.subarray(offset, offset + chunkSizeBytes).toString('utf8'));
    }
    return chunks;
}

/**
 * Formats a log line (or lines, if the message is long enough to need chunking) in the same
 * layout Web-Expensify writes to rsyslog, so it can be sent as-is via rsyslogWriter.
 */
function formatExpensifyRsyslogLine({level, message, params, requestId}: FormatExpensifyRsyslogLineOptions): string[] {
    let prefix = buildPrefix(requestId, level);
    let chunkSizeBytes = MESSAGE_LIMIT_BYTES - Buffer.byteLength(prefix, 'utf8');

    if (chunkSizeBytes < MIN_CHUNK_BYTES) {
        // Hail-mary shortening, mirroring Log.php's own fallback for when REQUEST_ID makes the
        // prefix too long to leave any room for a message.
        prefix = buildPrefix(requestId.slice(0, TRUNCATED_REQUEST_ID_LENGTH), level);
        chunkSizeBytes = Math.max(MESSAGE_LIMIT_BYTES - Buffer.byteLength(prefix, 'utf8'), MIN_CHUNK_BYTES);
    }

    const body = `${message}${formatParamString(params)}`;
    return chunkMessageBytes(body, chunkSizeBytes).map((chunk) => `${prefix}${chunk}`);
}

export default formatExpensifyRsyslogLine;
