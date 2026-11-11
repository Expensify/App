import {describe, expect, it} from 'bun:test';

import type {JSONObject, LSPDiagnostic} from '../../scripts/lint/lsp/LSPUtils';

import LSPUtils from '../../scripts/lint/lsp/LSPUtils';
import MessageReader, {encodeMessage} from '../../scripts/lint/lsp/MessageReader';
import {LINT_SEVERITY} from '../../scripts/lint/types';

const FILE_PATH = '/repo/src/file.ts';

function makeDiagnostic(overrides: Partial<LSPDiagnostic> = {}): LSPDiagnostic {
    return {
        range: {start: {line: 2, character: 4}, end: {line: 2, character: 9}},
        message: 'Unexpected any.',
        severity: 1,
        code: 'typescript(no-explicit-any)',
        source: 'oxc',
        ...overrides,
    };
}

function rangeOf(startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    return {start: {line: startLine, character: startCharacter}, end: {line: endLine, character: endCharacter}};
}

function readAll(chunks: Uint8Array[]): JSONObject[] {
    const messages: JSONObject[] = [];
    const reader = new MessageReader((message) => messages.push(message));
    for (const chunk of chunks) {
        reader.push(chunk);
    }
    return messages;
}

describe('applyContentChanges', () => {
    it('applies a ranged edit at its line and character', () => {
        // Given a two-line document
        const text = 'const a = 1;\nconst b = 2;\n';

        // When the editor replaces `b` on the second line
        const result = LSPUtils.applyContentChanges(text, [{range: rangeOf(1, 6, 1, 7), text: 'c'}]);

        // Then only that character changes, so the processors see what the editor shows
        expect(result).toBe('const a = 1;\nconst c = 2;\n');
    });

    it('replaces the whole text when a change has no range', () => {
        // Given a document
        const text = 'old\n';

        // When the editor sends a full-text change, which LSP allows instead of ranged edits
        const result = LSPUtils.applyContentChanges(text, [{text: 'new\n'}]);

        // Then the tracked text is the new text
        expect(result).toBe('new\n');
    });

    it('keeps positions right in CRLF documents', () => {
        // Given a document with Windows line endings, where the line break is two characters
        const text = 'a\r\nbc\r\n';

        // When the editor replaces `c` on the second line
        const result = LSPUtils.applyContentChanges(text, [{range: rangeOf(1, 1, 1, 2), text: 'X'}]);

        // Then the edit lands on `c` and both line endings survive
        expect(result).toBe('a\r\nbX\r\n');
    });

    it('counts characters in UTF-16 units like LSP, so text after an emoji edits correctly', () => {
        // Given a line where an emoji takes two UTF-16 units, as LSP positions count it
        const text = 'const s = "😀";\n';

        // When the editor inserts right after the emoji, at UTF-16 character 13
        const result = LSPUtils.applyContentChanges(text, [{range: rangeOf(0, 13, 0, 13), text: '!'}]);

        // Then the insert lands after the emoji instead of splitting it
        expect(result).toBe('const s = "😀!";\n');
    });

    it('applies several changes in order, each against the previous result', () => {
        // Given a document
        const text = 'abc\n';

        // When one didChange carries two edits, the second relative to the first
        const result = LSPUtils.applyContentChanges(text, [
            {range: rangeOf(0, 0, 0, 1), text: 'XY'},
            {range: rangeOf(0, 2, 0, 3), text: 'Z'},
        ]);

        // Then the second edit sees the text the first produced
        expect(result).toBe('XYZc\n');
    });
});

describe('wrapResultID and unwrapResultID', () => {
    it('returns the server result ID for the same seatbelt generation', () => {
        // Given a server result ID stamped with generation 3
        const wrapped = LSPUtils.wrapResultID('server-7', 3);

        // When the editor sends it back while the generation is still 3
        const unwrapped = LSPUtils.unwrapResultID(wrapped, 3);

        // Then the server gets its own ID back and can answer "unchanged"
        expect(unwrapped).toBe('server-7');
    });

    it('drops a result ID from an older seatbelt generation', () => {
        // Given a result ID stamped before the TSV changed
        const wrapped = LSPUtils.wrapResultID('server-7', 3);

        // When the editor sends it back after the generation moved to 4
        const unwrapped = LSPUtils.unwrapResultID(wrapped, 4);

        // Then it is dropped, so the server sends full diagnostics checked against the new baseline
        expect(unwrapped).toBeUndefined();
    });

    it('keeps a server result ID that contains the separator', () => {
        // Given a server ID that happens to contain the separator character
        const wrapped = LSPUtils.wrapResultID('a|b', 1);

        // When it is unwrapped for the same generation
        const unwrapped = LSPUtils.unwrapResultID(wrapped, 1);

        // Then only the generation prefix is removed
        expect(unwrapped).toBe('a|b');
    });

    it('passes through a missing result ID', () => {
        // Given a report without a result ID, which LSP allows

        // When it is wrapped and the editor later omits it
        const wrapped = LSPUtils.wrapResultID(undefined, 1);
        const unwrapped = LSPUtils.unwrapResultID(undefined, 1);

        // Then nothing is invented on either side
        expect(wrapped).toBeUndefined();
        expect(unwrapped).toBeUndefined();
    });
});

describe('toLintMessage', () => {
    it('maps the oxlint code to the ESLint rule ID and LSP positions to 1-based ones', () => {
        // Given an oxlint diagnostic at 0-based line 2, character 4
        const diagnostic = makeDiagnostic();

        // When it becomes a lint message
        const message = LSPUtils.toLintMessage(FILE_PATH, diagnostic);

        // Then it matches what the CLI pipeline produces, so seatbelt rows and stratification line up
        expect(message.ruleID).toBe('@typescript-eslint/no-explicit-any');
        expect(message.line).toBe(3);
        expect(message.column).toBe(5);
        expect(message.severity).toBe(LINT_SEVERITY.ERROR);
    });

    it('treats a missing severity as an error and other severities as warnings', () => {
        // Given diagnostics without a severity and with LSP's warning, information and hint severities
        const missing = makeDiagnostic({severity: undefined});
        const others = [2, 3, 4].map((severity) => makeDiagnostic({severity}));

        // When they become lint messages
        const missingMessage = LSPUtils.toLintMessage(FILE_PATH, missing);
        const otherMessages = others.map((diagnostic) => LSPUtils.toLintMessage(FILE_PATH, diagnostic));

        // Then only real errors count toward the seatbelt
        expect(missingMessage.severity).toBe(LINT_SEVERITY.ERROR);
        expect(otherMessages.map((message) => message.severity)).toEqual([LINT_SEVERITY.WARNING, LINT_SEVERITY.WARNING, LINT_SEVERITY.WARNING]);
    });
});

describe('toDiagnostic and restoreDiagnostic', () => {
    it('returns the original diagnostic when the processors changed nothing', () => {
        // Given a diagnostic that no processor touched
        const diagnostic = makeDiagnostic();
        const message = LSPUtils.toLintMessage(FILE_PATH, diagnostic);

        // When it goes back to the editor
        const result = LSPUtils.toDiagnostic(message);

        // Then it is the same object, with the server's own `data` intact
        expect(result).toBe(diagnostic);
    });

    it('restores the server diagnostic from a demoted one after the editor echoes it back', () => {
        // Given a diagnostic the seatbelt demoted to a warning with a note
        const diagnostic = makeDiagnostic({data: {fixKind: 'safe'}});
        const message = LSPUtils.toLintMessage(FILE_PATH, diagnostic);
        const demoted = LSPUtils.toDiagnostic({...message, severity: LINT_SEVERITY.WARNING, message: `${message.message}\n[seatbelt]: note`});

        // When the editor serializes it and sends it back in a code action request
        const echoed: unknown = JSON.parse(JSON.stringify(demoted));
        const restored = LSPUtils.restoreDiagnostic(echoed);

        // Then the editor saw the warning, and the server gets back exactly what it published
        expect(demoted.severity).toBe(2);
        expect(demoted.message).toContain('[seatbelt]: note');
        expect(restored).toEqual(diagnostic);
    });

    it('leaves a diagnostic the wrapper did not change as it is', () => {
        // Given a diagnostic with the server's own data
        const diagnostic = makeDiagnostic({data: {fixKind: 'safe'}});

        // When it comes back in a code action request
        const restored = LSPUtils.restoreDiagnostic(diagnostic);

        // Then it is passed through untouched
        expect(restored).toBe(diagnostic);
    });
});

describe('MessageReader', () => {
    it('reassembles a message split across chunks, even inside the header', () => {
        // Given one framed message cut at arbitrary points, as pipes deliver data
        const bytes = encodeMessage({jsonrpc: '2.0', method: 'initialized', params: {}});
        const chunks = [bytes.subarray(0, 5), bytes.subarray(5, 22), bytes.subarray(22)];

        // When the chunks arrive one by one
        const messages = readAll(chunks);

        // Then exactly one complete message comes out
        expect(messages).toEqual([{jsonrpc: '2.0', method: 'initialized', params: {}}]);
    });

    it('counts Content-Length in bytes, so a multibyte body does not swallow the next message', () => {
        // Given a message with multibyte text followed by another message in the same chunk
        const first = {jsonrpc: '2.0', method: 'textDocument/didOpen', params: {text: 'const s = "😀 ü";'}};
        const second = {jsonrpc: '2.0', method: 'initialized', params: {}};
        const chunk = Buffer.concat([encodeMessage(first), encodeMessage(second)]);

        // When the chunk is read
        const messages = readAll([chunk]);

        // Then both messages are parsed intact
        expect(messages).toEqual([first, second]);
    });

    it('throws on a frame without Content-Length', () => {
        // Given output that is not a language server message, such as a plain CLI run
        const chunk = Buffer.from('Content-Type: text/plain\r\n\r\n{}');

        // When it is read
        const read = () => readAll([chunk]);

        // Then the reader fails loudly, so the wrapper exits and the editor restarts it
        expect(read).toThrow('Content-Length');
    });
});
