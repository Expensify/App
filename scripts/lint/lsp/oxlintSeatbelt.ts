#!/usr/bin/env bun

/**
 * Editor wrapper around `oxlint --lsp`. The oxlint language server only runs the rules, so grandfathered
 * seatbelt rows show as errors in the editor while `npm run lint` passes. This passes all language server
 * traffic through and runs the diagnostics through the same processors as `scripts/lint/index.ts`.
 *
 * VS Code: set `"oxc.path.oxlint": "scripts/lint/lsp/oxlintSeatbelt.ts"`. See contributingGuides/LINTING.md.
 */
import {readFileSync, statSync} from 'node:fs';
import path from 'node:path';

import type {SeatbeltFileData} from '../processors/Seatbelt';
import type {LintMessage} from '../types';
import type {JSONObject, LSPDiagnostic} from './LSPUtils';

// The helper is ESM (.mjs). Bun resolves it without the extension.
// eslint-disable-next-line import/extensions
import {isFileMemoized} from '../../../config/reactCompiler/checkWithOxc.mjs';
import ReactCompilerFilter from '../processors/ReactCompilerFilter';
import {canonicalizeMessages, parseSeatbeltTSV, resolveSeatbeltOptions, transformMessages} from '../processors/Seatbelt';
import StratifyNoDeprecated from '../processors/StratifyNoDeprecated';
import LSPUtils from './LSPUtils';
import MessageReader, {encodeMessage} from './MessageReader';

const LOG_PREFIX = '[oxlint-seatbelt]';
const STREAM_FAILURE_EXIT_CODE = 1;
const LSP_FLAG = '--lsp';
const METHOD = {
    DID_OPEN: 'textDocument/didOpen',
    DID_CHANGE: 'textDocument/didChange',
    DID_CLOSE: 'textDocument/didClose',
    CODE_ACTION: 'textDocument/codeAction',
    PUBLISH_DIAGNOSTICS: 'textDocument/publishDiagnostics',
    DOCUMENT_DIAGNOSTIC: 'textDocument/diagnostic',
} as const;

const projectRoot = path.resolve(import.meta.dir, '../../..');
const oxlintBin = path.join(projectRoot, 'node_modules', '.bin', 'oxlint');
// An empty env so a shell's SEATBELT_* or CI values never change what the editor shows.
const seatbeltOptions = resolveSeatbeltOptions(projectRoot, {});
// Checked in process because unsaved text misses the disk cache of the default worker check. The filter only passes unsaved text, so closed files are read here.
const reactCompilerFilter = new ReactCompilerFilter((source, filePath) => isFileMemoized(source || readFileSync(filePath, 'utf8'), filePath));
const stratifyNoDeprecated = new StratifyNoDeprecated();

const documents = new Map<string, string>();
// VS Code pulls diagnostics, and the reply does not repeat which file it is for.
const pendingPullURIs = new Map<unknown, string>();
let seatbeltCache: {mtimeMs: number; data: Map<string, SeatbeltFileData>} | undefined;

// Not scripts/utils/Logger: its colors and emojis show up as raw escape codes in the editor's output panel.
function log(...args: unknown[]): void {
    console.error(LOG_PREFIX, ...args);
}

function loadSeatbeltData(): Map<string, SeatbeltFileData> {
    const {mtimeMs} = statSync(seatbeltOptions.seatbeltFile);
    if (seatbeltCache?.mtimeMs !== mtimeMs) {
        seatbeltCache = {mtimeMs, data: parseSeatbeltTSV(readFileSync(seatbeltOptions.seatbeltFile, 'utf8')).data};
    }
    return seatbeltCache.data;
}

async function applyLintProcessors(uri: string, diagnostics: LSPDiagnostic[]): Promise<LSPDiagnostic[]> {
    const filePath = LSPUtils.toFilePath(uri);
    if (!filePath || diagnostics.length === 0) {
        return diagnostics;
    }
    try {
        const source = documents.get(uri);
        const context = {projectRoot, lintedFiles: [filePath], sources: source === undefined ? undefined : new Map([[filePath, source]])};
        let messages: LintMessage[] = diagnostics.map((diagnostic) => LSPUtils.toLintMessage(filePath, diagnostic));
        // Same order as the processor list in scripts/lint/index.ts.
        messages = await reactCompilerFilter.process(messages, context);
        messages = await stratifyNoDeprecated.process(messages, context);
        // Seatbelt demotes the first N errors of a rule in a stable order, same as `applySeatbelt`.
        messages = transformMessages(seatbeltOptions, loadSeatbeltData(), filePath, canonicalizeMessages(messages));
        if (!messages.every(LSPUtils.hasDiagnostic)) {
            log(`a processor dropped the source diagnostic, showing raw oxlint diagnostics for ${uri}`);
            return diagnostics;
        }
        return messages.map(LSPUtils.toDiagnostic);
    } catch (error) {
        log(`showing raw oxlint diagnostics for ${uri}:`, error);
        return diagnostics;
    }
}

// Editors other than VS Code may start the script without `--lsp`, and plain oxlint would lint the folder instead.
const oxlintArgs = process.argv.slice(2);
const server = Bun.spawn([oxlintBin, ...oxlintArgs, ...(oxlintArgs.includes(LSP_FLAG) ? [] : [LSP_FLAG])], {stdin: 'pipe', stdout: 'pipe', stderr: 'inherit'});

function sendToServer(message: JSONObject): void {
    server.stdin.write(encodeMessage(message));
    server.stdin.flush();
}

function sendToClient(message: JSONObject): void {
    process.stdout.write(encodeMessage(message));
}

/** Records the unsaved text the processors need, and gives the server back its own diagnostics in code action requests. */
function prepareClientMessage(message: JSONObject): JSONObject {
    const {method, params} = message;
    if (!LSPUtils.isRecord(params)) {
        return message;
    }
    const textDocument = LSPUtils.isRecord(params.textDocument) ? params.textDocument : undefined;
    const uri = typeof textDocument?.uri === 'string' ? textDocument.uri : undefined;
    if (!uri) {
        return message;
    }

    switch (method) {
        case METHOD.DID_OPEN:
            if (typeof textDocument?.text === 'string') {
                documents.set(uri, textDocument.text);
            }
            return message;
        case METHOD.DID_CHANGE:
            documents.set(uri, LSPUtils.applyContentChanges(documents.get(uri) ?? '', params.contentChanges));
            return message;
        case METHOD.DID_CLOSE:
            documents.delete(uri);
            return message;
        case METHOD.DOCUMENT_DIAGNOSTIC:
            pendingPullURIs.set(message.id, uri);
            return message;
        case METHOD.CODE_ACTION:
            if (!LSPUtils.isRecord(params.context) || !Array.isArray(params.context.diagnostics)) {
                return message;
            }
            return {...message, params: {...params, context: {...params.context, diagnostics: params.context.diagnostics.map(LSPUtils.restoreDiagnostic)}}};
        default:
            return message;
    }
}

async function handleServerMessage(message: JSONObject): Promise<void> {
    const {params, result} = message;
    const uri = LSPUtils.isRecord(params) ? params.uri : undefined;
    if (message.method === METHOD.PUBLISH_DIAGNOSTICS && LSPUtils.isRecord(params) && typeof uri === 'string' && LSPUtils.isDiagnosticList(params.diagnostics)) {
        sendToClient({...message, params: {...params, diagnostics: await applyLintProcessors(uri, params.diagnostics)}});
        return;
    }
    const pullURI = message.method === undefined ? pendingPullURIs.get(message.id) : undefined;
    if (pullURI !== undefined) {
        pendingPullURIs.delete(message.id);
        // An "unchanged" reply has no items, and the editor keeps the ones this wrapper already processed.
        if (LSPUtils.isRecord(result) && LSPUtils.isDiagnosticList(result.items)) {
            sendToClient({...message, result: {...result, items: await applyLintProcessors(pullURI, result.items)}});
            return;
        }
    }
    sendToClient(message);
}

// Diagnostics go out in the order the server sent them, even though processing is async.
let serverQueue = Promise.resolve();
const serverReader = new MessageReader((message) => {
    serverQueue = serverQueue.then(() => handleServerMessage(message)).catch((error: unknown) => log('failed to forward a server message:', error));
});
const clientReader = new MessageReader((message) => sendToServer(prepareClientMessage(message)));

// A live process that no longer forwards messages looks hung to the editor, which only restarts servers that exit.
function exitAfterStreamFailure(reason: string, error: unknown): never {
    log(reason, error);
    server.kill();
    process.exit(STREAM_FAILURE_EXIT_CODE);
}

(async () => {
    for await (const chunk of server.stdout) {
        serverReader.push(chunk);
    }
})().catch((error: unknown) => exitAfterStreamFailure('lost the oxlint language server output:', error));

(async () => {
    for await (const chunk of Bun.stdin.stream()) {
        clientReader.push(chunk);
    }
    server.stdin.end();
})().catch((error: unknown) => exitAfterStreamFailure('lost the editor input:', error));

const exitCode = await server.exited;
await serverQueue;
process.exit(exitCode);
