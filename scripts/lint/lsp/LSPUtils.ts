/**
 * Language server helpers for the oxlint seatbelt wrapper: type guards for JSON-RPC payloads, unsaved
 * document edits and the mapping between LSP diagnostics and lint messages.
 */
import {fileURLToPath} from 'node:url';

import type {LintMessage, LintSeverity} from '../types';

// The helper is ESM (.mjs). Bun resolves it without the extension.
// eslint-disable-next-line import/extensions
import {oxlintCodeToESLintRuleID} from '../../../config/oxlint/ruleNames.mjs';
import {LINT_SEVERITY} from '../types';

type JSONObject = Record<string, unknown>;

type LSPPosition = {line: number; character: number};

type LSPRange = {start: LSPPosition; end: LSPPosition};

type LSPDiagnostic = JSONObject & {
    range: LSPRange;
    message: string;
    severity?: number;
    code?: unknown;
    data?: unknown;
};

/**
 * A lint message that carries the LSP diagnostic it came from. The field survives the processors only
 * because each one copies messages with a spread, so a new processor must copy them the same way.
 */
type DiagnosticLintMessage = LintMessage & {diagnostic: LSPDiagnostic};

const LSP_SEVERITY = {ERROR: 1, WARNING: 2} as const;
const ORIGINAL_DIAGNOSTIC_KEY = 'oxlintSeatbeltOriginal';
const FILE_URI_SCHEME = 'file:';

function isRecord(value: unknown): value is JSONObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPosition(value: unknown): value is LSPPosition {
    return isRecord(value) && typeof value.line === 'number' && typeof value.character === 'number';
}

function isRange(value: unknown): value is LSPRange {
    return isRecord(value) && isPosition(value.start) && isPosition(value.end);
}

function isDiagnostic(value: unknown): value is LSPDiagnostic {
    return isRecord(value) && typeof value.message === 'string' && isRange(value.range);
}

function isDiagnosticList(value: unknown): value is LSPDiagnostic[] {
    return Array.isArray(value) && value.every(isDiagnostic);
}

function hasDiagnostic(message: LintMessage): message is DiagnosticLintMessage {
    return 'diagnostic' in message && isDiagnostic(message.diagnostic);
}

function getOffset(text: string, position: LSPPosition): number {
    let offset = 0;
    for (let line = 0; line < position.line; line++) {
        const nextNewline = text.indexOf('\n', offset);
        if (nextNewline < 0) {
            return text.length;
        }
        offset = nextNewline + 1;
    }
    return Math.min(offset + position.character, text.length);
}

/** Applies `textDocument/didChange` content changes, which are either ranged edits or the full text. */
function applyContentChanges(text: string, changes: unknown): string {
    if (!Array.isArray(changes)) {
        return text;
    }
    let next = text;
    for (const change of changes) {
        if (!isRecord(change) || typeof change.text !== 'string') {
            continue;
        }
        next = isRange(change.range) ? next.slice(0, getOffset(next, change.range.start)) + change.text + next.slice(getOffset(next, change.range.end)) : change.text;
    }
    return next;
}

/** Returns the file path for a `file:` URI, or undefined for other schemes such as unsaved `untitled:` buffers. */
function toFilePath(uri: string): string | undefined {
    return uri.startsWith(FILE_URI_SCHEME) ? fileURLToPath(uri) : undefined;
}

function toLintSeverity(diagnostic: LSPDiagnostic): LintSeverity {
    // LSP treats a missing severity as the client's default, which is an error in VS Code.
    return diagnostic.severity === undefined || diagnostic.severity === LSP_SEVERITY.ERROR ? LINT_SEVERITY.ERROR : LINT_SEVERITY.WARNING;
}

function toLintMessage(filePath: string, diagnostic: LSPDiagnostic): DiagnosticLintMessage {
    return {
        filePath,
        ruleID: typeof diagnostic.code === 'string' ? oxlintCodeToESLintRuleID(diagnostic.code) : null,
        severity: toLintSeverity(diagnostic),
        message: diagnostic.message,
        // LSP positions are 0-based, LintMessage follows ESLint's 1-based ones.
        line: diagnostic.range.start.line + 1,
        column: diagnostic.range.start.character + 1,
        diagnostic,
    };
}

function toDiagnostic(message: DiagnosticLintMessage): LSPDiagnostic {
    const {diagnostic} = message;
    if (message.message === diagnostic.message && message.severity === toLintSeverity(diagnostic)) {
        return diagnostic;
    }
    return {
        ...diagnostic,
        severity: message.severity === LINT_SEVERITY.ERROR ? LSP_SEVERITY.ERROR : LSP_SEVERITY.WARNING,
        message: message.message,
        // The editor sends `data` back with code action requests, where the server expects its own diagnostic.
        data: {[ORIGINAL_DIAGNOSTIC_KEY]: diagnostic},
    };
}

/** Swaps a diagnostic from `toDiagnostic` back to the one the server published. */
function restoreDiagnostic(diagnostic: unknown): unknown {
    return isRecord(diagnostic) && isRecord(diagnostic.data) && isDiagnostic(diagnostic.data[ORIGINAL_DIAGNOSTIC_KEY]) ? diagnostic.data[ORIGINAL_DIAGNOSTIC_KEY] : diagnostic;
}

const LSPUtils = {
    applyContentChanges,
    hasDiagnostic,
    isDiagnosticList,
    isRecord,
    restoreDiagnostic,
    toDiagnostic,
    toFilePath,
    toLintMessage,
};

export default LSPUtils;
export type {JSONObject, LSPDiagnostic};
