#!/usr/bin/env bun

/**
 * Answers the one condition `rulesdir/no-unsafe-onyx-read` cannot see: whether anything that renders
 * can reach a function, transitively, across files.
 *
 * A synchronous Onyx read is only safe in code that does not run during render. Lint enforces the
 * position a read is written in; this enforces the position it ends up in once callers are taken into
 * account.
 *
 * Usage:
 *
 *   bun scripts/checkRenderReachability.ts
 *       Every unit that performs a synchronous Onyx read, with a verdict for each. Exits 1 when any of
 *       them is render-reachable.
 *
 *   bun scripts/checkRenderReachability.ts 'src/libs/actions/IOU/Duplicate.ts#bulkDuplicateReports'
 *       Named units, whether or not they read Onyx. Use this before adding a synchronous read to one.
 *
 *   --json     Machine-readable output.
 *   --quiet    Only print render-reachable results and the summary.
 *   --callers  List the direct callers of each named unit instead of a verdict, marking which of them
 *              render. Use it to check a verdict by hand: if a function has 25 call sites and this
 *              prints 3, the graph is missing edges and the verdict is not evidence.
 *
 * The graph is built from source with no type information, so a call it cannot resolve is a call it
 * cannot follow. That can only make a render-reachable function look safe, never the reverse, so the
 * summary always prints how many calls went unresolved. Treat a clean verdict on a function whose
 * callers are dynamic as unproven rather than proven.
 */
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import type {PathAliases} from './buildCallGraph';
import type {FileAnalysis} from './callGraphFromSource';

import {buildCallGraph} from './buildCallGraph';
import {analyzeSource} from './callGraphFromSource';
import {buildCallerIndex, findRenderPaths} from './renderReachability';

const projectRoot = path.resolve(__dirname, '..');
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

/** Every tracked source file under `src/`, repo-relative with posix separators. */
function listSourceFiles(): string[] {
    const output = execFileSync('git', ['ls-files', '--', 'src'], {cwd: projectRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
    return output
        .split('\n')
        .filter(Boolean)
        .filter((file) => SOURCE_EXTENSIONS.has(path.extname(file)))
        .filter((file) => !file.endsWith('.d.ts'));
}

function isPathAliases(value: unknown): value is PathAliases {
    return typeof value === 'object' && value !== null && Object.values(value).every((targets) => Array.isArray(targets) && targets.every((target) => typeof target === 'string'));
}

/**
 * Read through TypeScript rather than `JSON.parse`: `tsconfig.json` is JSONC, and it inherits from
 * `expo/tsconfig.base`, so `paths` can come from either file. Throws rather than returning `{}`, because
 * without aliases every cross-file import goes unresolved and every unit then looks safe.
 */
function readPathAliases(): PathAliases {
    const configPath = path.join(projectRoot, 'tsconfig.json');
    const configFile = ts.readConfigFile(configPath, (fileName) => ts.sys.readFile(fileName));

    if (configFile.error) {
        throw new Error(`Cannot read ${configPath}: ${ts.flattenDiagnosticMessageText(configFile.error.messageText, ' ')}`);
    }

    const config: unknown = configFile.config;

    // Only `compilerOptions` is wanted, so `readDirectory` is stubbed out instead of letting TypeScript glob
    // the include patterns over the whole repo. TS18003, "no inputs were found", is that stub's own artifact.
    const parsed = ts.parseJsonConfigFileContent(
        config,
        {
            useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
            readDirectory: () => [],
            fileExists: (fileName) => ts.sys.fileExists(fileName),
            readFile: (fileName) => ts.sys.readFile(fileName),
        },
        projectRoot,
        undefined,
        configPath,
    );
    const errors = parsed.errors.filter((diagnostic) => diagnostic.code !== 18003);

    if (errors.length > 0) {
        throw new Error(`Cannot parse ${configPath}: ${errors.map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')).join('; ')}`);
    }

    const paths: unknown = parsed.options.paths;

    if (!isPathAliases(paths) || Object.keys(paths).length === 0) {
        throw new Error(`No compilerOptions.paths found in ${configPath}`);
    }

    return paths;
}

type Verdict = {
    unitId: string;
    reads: number;
    renderPaths: string[][];
};

function analyzeFiles(files: readonly string[]): {analyses: FileAnalysis[]; failures: Array<{file: string; message: string}>} {
    const analyses: FileAnalysis[] = [];
    const failures: Array<{file: string; message: string}> = [];

    for (const file of files) {
        try {
            analyses.push(analyzeSource(file, fs.readFileSync(path.join(projectRoot, file), 'utf8')));
        } catch (error: unknown) {
            failures.push({file, message: error instanceof Error ? error.message : String(error)});
        }
    }

    return {analyses, failures};
}

function run(): void {
    const args = process.argv.slice(2);
    const asJson = args.includes('--json');
    const quiet = args.includes('--quiet');
    const targets = args.filter((arg) => !arg.startsWith('--'));

    const files = listSourceFiles();
    const {analyses, failures} = analyzeFiles(files);
    const {graph, stats} = buildCallGraph(analyses, {aliases: readPathAliases(), knownFiles: new Set(files)});

    const readCountByUnit = new Map<string, number>();
    for (const analysis of analyses) {
        for (const read of analysis.reads) {
            readCountByUnit.set(read.unitId, (readCountByUnit.get(read.unitId) ?? 0) + 1);
        }
    }

    if (args.includes('--callers')) {
        const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));

        for (const target of targets) {
            const callers = buildCallerIndex(graph).get(target) ?? [];
            console.log(`${target}: ${callers.length} direct caller(s)`);

            for (const caller of callers) {
                console.log(`  ${nodesById.get(caller)?.isRenderEntry ? 'renders' : '       '} ${caller}`);
            }
        }
        return;
    }

    const unitsToCheck = targets.length > 0 ? targets : [...readCountByUnit.keys()].sort();
    const verdicts: Verdict[] = unitsToCheck.map((unitId) => ({
        unitId,
        reads: readCountByUnit.get(unitId) ?? 0,
        renderPaths: findRenderPaths(graph, unitId),
    }));

    const reachable = verdicts.filter((verdict) => verdict.renderPaths.length > 0);

    if (asJson) {
        console.log(JSON.stringify({stats: {...stats, parseFailures: failures.length}, verdicts}, null, 2));
    } else {
        for (const verdict of verdicts) {
            if (verdict.renderPaths.length === 0) {
                if (!quiet) {
                    console.log(`ok              ${verdict.unitId}`);
                }
                continue;
            }

            console.log(`RENDER-REACHED  ${verdict.unitId}`);
            for (const renderPath of verdict.renderPaths) {
                console.log(`                via ${renderPath.join(' -> ')}`);
            }
        }

        const unknownTargets = verdicts.filter((verdict) => !graph.nodes.some((node) => node.id === verdict.unitId));
        for (const unknown of unknownTargets) {
            console.log(`not found       ${unknown.unitId}`);
        }

        console.log('');
        console.log(`Files ${stats.files}, units ${stats.units}, edges ${stats.edges}, parse failures ${failures.length}.`);
        console.log(
            `Unresolved calls ${stats.unresolvedCalls}: ${stats.unresolvedByReason.global} global, ${stats.unresolvedByReason.member} member, ${stats.unresolvedByReason.dynamic} through a binding, ${stats.unresolvedByReason.unknown} other.`,
        );
        console.log(`Unresolved import targets ${stats.unresolvedModuleTargets}: ${stats.externalModuleCalls} outside src, ${stats.missingExportCalls} name not found in the resolved file.`);
        console.log('A call the graph cannot follow can only make a function look safer than it is, so read a clean verdict against these numbers.');
        console.log(`Checked ${verdicts.length} unit(s): ${reachable.length} render-reachable.`);

        if (failures.length > 0 && !quiet) {
            for (const failure of failures.slice(0, 10)) {
                console.log(`parse failure   ${failure.file}: ${failure.message}`);
            }
        }
    }

    if (reachable.length > 0) {
        process.exitCode = 1;
    }
}

run();
