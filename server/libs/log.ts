/*
 * Rsyslog-backed logger for server-side CLI tools. Each tool constructs its own instance with
 * metadata (process name, caller tag, etc.). Writes lines in the same format as Web-Expensify's
 * Log.php for Victoria Logs correlation.
 *
 * Line shape: <6>{processName}: {REQUEST_ID} {scriptName} {email} !{sourceTag}! ?{callerTag}? [level] message ~~ key: 'value'
 */
import writeRsyslog from '@server/libs/rsyslogWriter';

type LogLevel = 'info' | 'hmmm' | 'warn' | 'alrt';

// Mirrors expensify-common's Logger#Parameters union (see Logger.d.ts) so callers can pass through
// whatever they'd otherwise pass to the real Log.
type LogParams = string | Record<string, unknown> | Array<Record<string, unknown>> | Error | undefined;

type LogConfig = {
    /** Syslog identifier in the LOG_DIRECT_PREFIX (e.g. php-fpm, victory-chart-renderer). */
    processName: string;

    /** Mirrors Log.php's SCRIPT_NAME field (typically the same as processName for CLIs). */
    scriptName: string;

    /** Mirrors Log.php's source tag (e.g. script, api). */
    sourceTag: string;

    /** Mirrors Log.php's caller tag stack entry (e.g. vcr, Search). */
    callerTag: string;

    /** Mirrors Log.php's email field; empty for headless subprocesses with no user session. */
    email?: string;
};

// rsyslog caps messages at 8kb; Log.php leaves headroom below that for the prefix.
const MESSAGE_LIMIT_BYTES = 7168;
const MIN_CHUNK_BYTES = 10;
const TRUNCATED_REQUEST_ID_LENGTH = 10;

const SENSITIVE_KEY_PATTERN = /token|password|secret|apikey|cookie/i;
const REDACTED = '<REDACTED>';

class Log {
    private readonly metadata: LogConfig;

    constructor(metadata: LogConfig) {
        this.metadata = metadata;
    }

    info(message: string, sendNow?: boolean, parameters?: LogParams): void {
        this.write('info', message, parameters);
    }

    alert(message: string, parameters?: LogParams): void {
        this.write('alrt', message, parameters);
    }

    warn(message: string, parameters?: LogParams): void {
        this.write('warn', message, parameters);
    }

    hmmm(message: string, parameters?: LogParams): void {
        this.write('hmmm', message, parameters);
    }

    private write(level: LogLevel, message: string, params?: LogParams): void {
        const envRequestId = process.env.REQUEST_ID;
        const requestId = envRequestId === undefined ? '' : envRequestId;
        const lines = this.formatRsyslogLines({level, message, params, requestId});

        for (const line of lines) {
            writeRsyslog(line);
        }
    }

    private formatRsyslogLines({level, message, params, requestId}: {level: LogLevel; message: string; params?: LogParams; requestId: string}): string[] {
        let prefix = this.buildPrefix(level, requestId);
        let chunkSizeBytes = MESSAGE_LIMIT_BYTES - Buffer.byteLength(prefix, 'utf8');

        if (chunkSizeBytes < MIN_CHUNK_BYTES) {
            // Hail-mary shortening, mirroring Log.php's own fallback for when REQUEST_ID makes the
            // prefix too long to leave any room for a message.
            prefix = this.buildPrefix(level, requestId.slice(0, TRUNCATED_REQUEST_ID_LENGTH));
            chunkSizeBytes = Math.max(MESSAGE_LIMIT_BYTES - Buffer.byteLength(prefix, 'utf8'), MIN_CHUNK_BYTES);
        }

        const body = `${message}${this.formatParamString(params)}`;
        return Log.chunkMessageBytes(body, chunkSizeBytes).map((chunk) => `${prefix}${chunk}`);
    }

    private buildPrefix(level: LogLevel, requestId: string): string {
        const {processName, scriptName, sourceTag, callerTag, email} = this.metadata;
        const logDirectPrefix = `<6>${processName}: `;
        const emailField = email ?? '';
        return `${logDirectPrefix}${requestId} ${scriptName} ${emailField} !${sourceTag}! ?${callerTag}? [${level}] `;
    }

    private formatParamString(params: LogParams | undefined): string {
        if (params === undefined) {
            return '';
        }
        if (typeof params === 'string') {
            return params.length > 0 ? ` ~~ ${params}` : '';
        }
        if (params instanceof Error) {
            return ` ~~ ${Log.stringifyParamValue(params)}`;
        }

        const entries = Array.isArray(params) ? params.flatMap((entry) => Object.entries(entry)) : Object.entries(params);
        return Log.formatParamEntries(entries);
    }

    private static formatParamEntries(entries: Array<[string, unknown]>): string {
        if (entries.length === 0) {
            return '';
        }

        const pretty = entries.map(([key, value]) => `${key}: '${SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : Log.stringifyParamValue(value)}'`).join(' ');
        return ` ~~ ${pretty}`;
    }

    private static stringifyParamValue(value: unknown): string {
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
        if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint' || typeof value === 'symbol') {
            return value.toString();
        }
        // Functions are the only remaining typeof case; Object.prototype.toString.call is the only
        // stringification here that's guaranteed not to trigger @typescript-eslint/no-base-to-string.
        return Object.prototype.toString.call(value);
    }

    private static chunkMessageBytes(message: string, chunkSizeBytes: number): string[] {
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
}

export default Log;
export type {LogConfig, LogLevel, LogParams};
