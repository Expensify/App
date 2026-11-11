#!/usr/bin/env bun

/**
 * Editor wrapper around `oxlint --lsp`. The oxlint language server only runs the rules, so grandfathered
 * seatbelt rows show as errors in the editor while `npm run lint` passes. This passes all language server
 * traffic through and runs the diagnostics through the same processors as `scripts/lint/index.ts`.
 *
 * VS Code: set `"oxc.path.oxlint": "scripts/lint/lsp/oxlintSeatbelt.ts"`. See contributingGuides/LINTING.md.
 */
import {readFileSync, statSync, watchFile} from 'node:fs';
import path from 'node:path';

import type {SeatbeltFileData} from '../processors/Seatbelt';
import type {LintMessage, ProcessorContext} from '../types';
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
const JSONRPC_VERSION = '2.0';
const SEATBELT_POLL_INTERVAL_MS = 1000;
const STREAM_FAILURE_EXIT_CODE = 1;
const REFRESH_REQUEST_ID_PREFIX = 'oxlint-seatbelt-refresh-';
const METHOD = {
    INITIALIZE: 'initialize',
    DID_OPEN: 'textDocument/didOpen',
    DID_CHANGE: 'textDocument/didChange',
    DID_CLOSE: 'textDocument/didClose',
    CODE_ACTION: 'textDocument/codeAction',
    PUBLISH_DIAGNOSTICS: 'textDocument/publishDiagnostics',
    DOCUMENT_DIAGNOSTIC: 'textDocument/diagnostic',
    WORKSPACE_DIAGNOSTIC: 'workspace/diagnostic',
    DIAGNOSTIC_REFRESH: 'workspace/diagnostic/refresh',
} as const;

type PendingPull = {method: typeof METHOD.DOCUMENT_DIAGNOSTIC | typeof METHOD.WORKSPACE_DIAGNOSTIC; uri?: string; generation: number};

const projectRoot = path.resolve(import.meta.dir, '../../..');
const oxlintBin = path.join(projectRoot, 'node_modules', '.bin', 'oxlint');
// An empty env so a shell's SEATBELT_* or CI values never change what the editor shows.
const seatbeltOptions = resolveSeatbeltOptions(projectRoot, {});
// Unsaved text changes on every keystroke, so the disk cache and worker pool of `ReactCompilerFilter` would miss every time.
const compilerVerdicts = new Map<string, {source: string; memoized: boolean}>();
// The filter only passes unsaved text to the check, so files that are not open are read here.
const reactCompilerFilter = new ReactCompilerFilter((source, filePath) => isMemoizedByCompiler(filePath, source || readFileSync(filePath, 'utf8')));
const stratifyNoDeprecated = new StratifyNoDeprecated();

const documents = new Map<string, string>();
const pushedDiagnostics = new Map<string, {params: JSONObject; diagnostics: LSPDiagnostic[]}>();
const pendingPulls = new Map<unknown, PendingPull>();
let seatbeltCache: {mtimeMs: number; data: Map<string, SeatbeltFileData>} | undefined;
// Bumped when the TSV changes, so the editor drops pull results computed against the old baseline.
let seatbeltGeneration = 0;
let clientSupportsRefresh = false;
let refreshRequestCount = 0;

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

function isMemoizedByCompiler(filePath: string, source: string): boolean {
    const cached = compilerVerdicts.get(filePath);
    if (cached?.source === source) {
        return cached.memoized;
    }
    const memoized = isFileMemoized(source, filePath);
    compilerVerdicts.set(filePath, {source, memoized});
    return memoized;
}

async function applyLintProcessors(uri: string, diagnostics: LSPDiagnostic[]): Promise<LSPDiagnostic[]> {
    const filePath = LSPUtils.toFilePath(uri);
    if (!filePath || diagnostics.length === 0) {
        return diagnostics;
    }
    try {
        const source = documents.get(uri);
        const context: ProcessorContext = {projectRoot, lintedFiles: [filePath], sources: source === undefined ? undefined : new Map([[filePath, source]])};
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

/** Stamps the result with the generation the request was made under, since an unchanged reply keeps the editor's older diagnostics. */
async function transformReport(uri: string, report: unknown, generation: number): Promise<unknown> {
    if (!LSPUtils.isRecord(report)) {
        return report;
    }
    const next: JSONObject = {...report, resultId: LSPUtils.wrapResultID(report.resultId, generation)};
    if (LSPUtils.isDiagnosticList(report.items)) {
        next.items = await applyLintProcessors(uri, report.items);
    }
    if (LSPUtils.isRecord(report.relatedDocuments)) {
        const related = await Promise.all(
            Object.entries(report.relatedDocuments).map(async ([relatedURI, relatedReport]) => [relatedURI, await transformReport(relatedURI, relatedReport, generation)]),
        );
        next.relatedDocuments = Object.fromEntries(related);
    }
    return next;
}

async function transformPullResult(request: PendingPull, result: unknown): Promise<unknown> {
    if (request.method === METHOD.DOCUMENT_DIAGNOSTIC && request.uri) {
        return transformReport(request.uri, result, request.generation);
    }
    if (request.method === METHOD.WORKSPACE_DIAGNOSTIC && LSPUtils.isRecord(result) && Array.isArray(result.items)) {
        const items = await Promise.all(
            result.items.map((item: unknown) => (LSPUtils.isRecord(item) && typeof item.uri === 'string' ? transformReport(item.uri, item, request.generation) : item)),
        );
        return {...result, items};
    }
    return result;
}

const server = Bun.spawn([oxlintBin, ...process.argv.slice(2)], {stdin: 'pipe', stdout: 'pipe', stderr: 'inherit'});

function sendToServer(message: JSONObject): void {
    server.stdin.write(encodeMessage(message));
    server.stdin.flush();
}

function sendToClient(message: JSONObject): void {
    process.stdout.write(encodeMessage(message));
}

/** Records editor state the processors need and rewrites the requests that carry values this wrapper changed. */
function prepareClientMessage(message: JSONObject): JSONObject {
    const {method, params} = message;
    if (!LSPUtils.isRecord(params)) {
        return message;
    }
    const textDocument = LSPUtils.isRecord(params.textDocument) ? params.textDocument : undefined;
    const uri = typeof textDocument?.uri === 'string' ? textDocument.uri : undefined;

    switch (method) {
        case METHOD.INITIALIZE: {
            const {capabilities} = params;
            clientSupportsRefresh =
                LSPUtils.isRecord(capabilities) &&
                LSPUtils.isRecord(capabilities.workspace) &&
                LSPUtils.isRecord(capabilities.workspace.diagnostics) &&
                capabilities.workspace.diagnostics.refreshSupport === true;
            return message;
        }
        case METHOD.DID_OPEN:
            if (uri && typeof textDocument?.text === 'string') {
                documents.set(uri, textDocument.text);
            }
            return message;
        case METHOD.DID_CHANGE:
            if (uri) {
                documents.set(uri, LSPUtils.applyContentChanges(documents.get(uri) ?? '', params.contentChanges));
            }
            return message;
        case METHOD.DID_CLOSE: {
            if (!uri) {
                return message;
            }
            documents.delete(uri);
            pushedDiagnostics.delete(uri);
            const filePath = LSPUtils.toFilePath(uri);
            if (filePath) {
                compilerVerdicts.delete(filePath);
            }
            return message;
        }
        case METHOD.CODE_ACTION:
            if (!LSPUtils.isRecord(params.context) || !Array.isArray(params.context.diagnostics)) {
                return message;
            }
            return {...message, params: {...params, context: {...params.context, diagnostics: params.context.diagnostics.map(LSPUtils.restoreDiagnostic)}}};
        case METHOD.DOCUMENT_DIAGNOSTIC:
            pendingPulls.set(message.id, {method, uri, generation: seatbeltGeneration});
            return {...message, params: {...params, previousResultId: LSPUtils.unwrapResultID(params.previousResultId, seatbeltGeneration)}};
        case METHOD.WORKSPACE_DIAGNOSTIC: {
            if (!Array.isArray(params.previousResultIds)) {
                return message;
            }
            pendingPulls.set(message.id, {method, generation: seatbeltGeneration});
            const previousResultIds = params.previousResultIds.flatMap((previous: unknown) => {
                if (!LSPUtils.isRecord(previous)) {
                    return [];
                }
                const value = LSPUtils.unwrapResultID(previous.value, seatbeltGeneration);
                return value === undefined ? [] : [{...previous, value}];
            });
            return {...message, params: {...params, previousResultIds}};
        }
        default:
            return message;
    }
}

async function handleServerMessage(message: JSONObject): Promise<void> {
    const {params} = message;
    const uri = LSPUtils.isRecord(params) ? params.uri : undefined;
    if (message.method === METHOD.PUBLISH_DIAGNOSTICS && LSPUtils.isRecord(params) && typeof uri === 'string' && LSPUtils.isDiagnosticList(params.diagnostics)) {
        pushedDiagnostics.set(uri, {params, diagnostics: params.diagnostics});
        sendToClient({...message, params: {...params, diagnostics: await applyLintProcessors(uri, params.diagnostics)}});
        return;
    }
    const pull = message.method === undefined ? pendingPulls.get(message.id) : undefined;
    if (pull) {
        pendingPulls.delete(message.id);
        if ('result' in message) {
            sendToClient({...message, result: await transformPullResult(pull, message.result)});
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

const clientReader = new MessageReader((message) => {
    // Responses to the refresh requests this wrapper sends belong to no server request.
    if (typeof message.id === 'string' && message.id.startsWith(REFRESH_REQUEST_ID_PREFIX) && message.method === undefined) {
        return;
    }
    sendToServer(prepareClientMessage(message));
});

watchFile(seatbeltOptions.seatbeltFile, {interval: SEATBELT_POLL_INTERVAL_MS}, () => {
    seatbeltGeneration++;
    serverQueue = serverQueue
        .then(async () => {
            for (const [uri, {params, diagnostics}] of pushedDiagnostics) {
                sendToClient({jsonrpc: JSONRPC_VERSION, method: METHOD.PUBLISH_DIAGNOSTICS, params: {...params, diagnostics: await applyLintProcessors(uri, diagnostics)}});
            }
            if (clientSupportsRefresh) {
                refreshRequestCount++;
                sendToClient({jsonrpc: JSONRPC_VERSION, id: `${REFRESH_REQUEST_ID_PREFIX}${refreshRequestCount}`, method: METHOD.DIAGNOSTIC_REFRESH});
            }
        })
        .catch((error: unknown) => log('failed to refresh diagnostics after a seatbelt change:', error));
});

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
