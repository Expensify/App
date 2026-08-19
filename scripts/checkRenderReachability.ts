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
 * cannot follow. That can only make a render-reachable function look safe, never the reverse. A unit is
 * therefore only cleared when the walk out of it reaches a module body along every branch; a branch that
 * runs out of callers first is reported as UNPROVEN, because the callers it did not find are exactly the
 * ones that could have rendered.
 */
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import type {PathAliases} from './buildCallGraph';
import type {FileAnalysis} from './callGraphFromSource';

import {buildCallGraph} from './buildCallGraph';
import {analyzeSource, MODULE_UNIT_NAME, ONYX_MODULE_PREFIX} from './callGraphFromSource';
import {buildCallerIndex, findDeadEnds, findRenderPaths} from './renderReachability';

const projectRoot = path.resolve(__dirname, '..');
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

/** Dead ends printed per unproven unit before the rest are summarised. */
const MAX_DEAD_ENDS_SHOWN = 5;

/**
 * Every source file under `src/`, repo-relative with posix separators. Untracked files are included:
 * a file a developer has just written is not staged yet, and skipping it would silently clear the read
 * it introduces.
 */
function listSourceFiles(): string[] {
    const output = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '--', 'src'], {cwd: projectRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
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

/** A unit the backwards search could not leave, because the graph found nothing that calls it. */
type DeadEnd = {
    unitId: string;

    /** Where it is handed off as a value, which is the usual reason nothing appears to call it. */
    handoffs: string[];
};

type Verdict = {
    unitId: string;
    reads: number;
    renderPaths: string[][];

    /**
     * Where the search stopped without reaching a module body. Each one has callers the graph never saw,
     * and an unseen caller can only hide a render path, so a verdict with any of these clears nothing.
     */
    deadEnds: DeadEnd[];
};

/** A verdict that proves nothing: the search ran out of graph before it ran out of callers. */
function isUnproven(verdict: Verdict): boolean {
    return verdict.renderPaths.length === 0 && verdict.deadEnds.length > 0;
}

/** A module body runs at import time with nothing calling it, so a walk that arrives at one is complete. */
function isModuleBody(unitId: string): boolean {
    return unitId.endsWith(`#${MODULE_UNIT_NAME}`);
}

/** The lines that name where a search stopped, shared so the CLI and the lint gate report it identically. */
function describeDeadEnds(verdict: Verdict): string[] {
    const lines = [`could not trace ${verdict.deadEnds.length} unit(s) back to a module body:`];

    for (const deadEnd of verdict.deadEnds.slice(0, MAX_DEAD_ENDS_SHOWN)) {
        const handoff = deadEnd.handoffs.at(0);
        lines.push(`  ${deadEnd.unitId}${handoff ? ` (passed as a value at ${handoff})` : ''}`);
    }

    if (verdict.deadEnds.length > MAX_DEAD_ENDS_SHOWN) {
        lines.push(`  and ${verdict.deadEnds.length - MAX_DEAD_ENDS_SHOWN} more`);
    }

    return lines;
}

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

/**
 * Build the graph over the whole of `src/` and index everything a verdict needs. The graph is whole-repo
 * whatever the caller is interested in, because a caller of a read can live in any file.
 */
function analyzeRepo() {
    const files = listSourceFiles();
    const {analyses, failures} = analyzeFiles(files);
    const {graph, stats, references} = buildCallGraph(analyses, {aliases: readPathAliases(), knownFiles: new Set(files)});
    const callerIndex = buildCallerIndex(graph);

    const handoffsByTarget = new Map<string, string[]>();
    for (const reference of references) {
        const sites = handoffsByTarget.get(reference.targetId) ?? [];
        sites.push(`${reference.file}:${reference.line}${reference.via ? ` (${reference.via})` : ''}`);
        handoffsByTarget.set(reference.targetId, sites);
    }

    const readCountByUnit = new Map<string, number>();
    for (const analysis of analyses) {
        for (const read of analysis.reads) {
            readCountByUnit.set(read.unitId, (readCountByUnit.get(read.unitId) ?? 0) + 1);
        }
    }

    return {graph, stats, failures, callerIndex, handoffsByTarget, readCountByUnit};
}

type RepoAnalysis = ReturnType<typeof analyzeRepo>;

function verdictFor(unitId: string, repo: RepoAnalysis): Verdict {
    return {
        unitId,
        reads: repo.readCountByUnit.get(unitId) ?? 0,
        renderPaths: findRenderPaths(repo.graph, unitId),
        deadEnds: findDeadEnds(repo.graph, unitId, isModuleBody).map((deadEndId) => ({unitId: deadEndId, handoffs: repo.handoffsByTarget.get(deadEndId) ?? []})),
    };
}

/** The file a unit id names, which is the part before the `#`. */
function fileOf(unitId: string): string {
    return unitId.slice(0, unitId.indexOf('#'));
}

function run(): void {
    const args = process.argv.slice(2);
    const asJson = args.includes('--json');
    const quiet = args.includes('--quiet');
    const targets = args.filter((arg) => !arg.startsWith('--'));

    const repo = analyzeRepo();
    const {graph, stats, failures, callerIndex, readCountByUnit} = repo;

    if (args.includes('--callers')) {
        const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));

        for (const target of targets) {
            const callers = callerIndex.get(target) ?? [];
            console.log(`${target}: ${callers.length} direct caller(s)`);

            for (const caller of callers) {
                console.log(`  ${nodesById.get(caller)?.isRenderEntry ? 'renders' : '       '} ${caller}`);
            }
        }
        return;
    }

    const unitsToCheck = targets.length > 0 ? targets : [...readCountByUnit.keys()].sort();
    const verdicts: Verdict[] = unitsToCheck.map((unitId) => verdictFor(unitId, repo));

    const reachable = verdicts.filter((verdict) => verdict.renderPaths.length > 0);
    const unproven = verdicts.filter(isUnproven);

    if (asJson) {
        console.log(JSON.stringify({stats: {...stats, parseFailures: failures.length}, verdicts}, null, 2));
    } else {
        for (const verdict of verdicts) {
            if (verdict.renderPaths.length > 0) {
                console.log(`RENDER-REACHED  ${verdict.unitId}`);
                for (const renderPath of verdict.renderPaths) {
                    console.log(`                via ${renderPath.join(' -> ')}`);
                }
                continue;
            }

            // The search stopped short of every caller, so it never had the full set to reject.
            if (isUnproven(verdict)) {
                console.log(`UNPROVEN        ${verdict.unitId}`);
                for (const line of describeDeadEnds(verdict)) {
                    console.log(`                ${line}`);
                }
                continue;
            }

            if (!quiet) {
                console.log(`no render path  ${verdict.unitId}`);
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
        console.log(`Checked ${verdicts.length} unit(s): ${reachable.length} render-reachable, ${unproven.length} unproven.`);

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

/** Lint targets that could hold a synchronous Onyx read, so the graph is only built when one might. */
function findOnyxTargets(targets: readonly string[]): string[] {
    const pathSpecs = targets.length > 0 ? [...targets] : ['.'];

    try {
        const output = execFileSync('git', ['grep', '-lI', '-F', '--untracked', '--no-recurse-submodules', '-e', ONYX_MODULE_PREFIX, '--', ...pathSpecs], {
            cwd: projectRoot,
            encoding: 'utf8',
            maxBuffer: 64 * 1024 * 1024,
        });
        return output
            .split('\n')
            .filter(Boolean)
            .filter((file) => file.startsWith('src/'));
    } catch (error: unknown) {
        // git grep exits 1 when nothing matches; anything else is a real failure.
        if (typeof error === 'object' && error !== null && 'status' in error && error.status === 1) {
            return [];
        }
        throw error;
    }
}

/**
 * Checks the synchronous Onyx reads in `targets` for a caller that renders, reporting any to stderr.
 * Returns `true` if one was found (i.e. the caller should fail).
 *
 * The graph is whole-repo because callers live anywhere, so this is only worth building when a target
 * file imports Onyx at all. That check is a `git grep` and is a superset of what the graph can flag,
 * which keeps a lint run over unrelated files free.
 *
 * Only a render path fails. Reads the walk could not clear are summarised in one line and pointed at the
 * CLI, since they are the normal case and repeating the detail on every lint run would bury the failures.
 */
async function checkRenderReachability(targets: string[]): Promise<boolean> {
    const candidates = new Set(findOnyxTargets(targets));

    if (candidates.size === 0) {
        return false;
    }

    const repo = analyzeRepo();
    const unitIds = [...repo.readCountByUnit.keys()].filter((unitId) => candidates.has(fileOf(unitId))).sort();
    const verdicts = unitIds.map((unitId) => verdictFor(unitId, repo));
    const reachable = verdicts.filter((verdict) => verdict.renderPaths.length > 0);
    const unproven = verdicts.filter(isUnproven);

    if (unproven.length > 0) {
        console.error(
            `Note: ${unproven.length} synchronous Onyx read(s) in these files have callers the graph cannot resolve, so nothing here vouches for them. Run \`bun scripts/checkRenderReachability.ts\` for the detail.`,
        );
    }

    if (reachable.length === 0) {
        return false;
    }

    console.error(
        'A synchronous Onyx read must not run during render: it does not subscribe, so the rendered value never updates. Use useOnyx() instead, or move the read into code that runs on an event.',
    );
    for (const verdict of reachable) {
        console.error(`  ${verdict.unitId}`);
        for (const renderPath of verdict.renderPaths) {
            console.error(`    via ${renderPath.join(' -> ')}`);
        }
    }

    return true;
}

if (require.main === module) {
    run();
}

export default checkRenderReachability;
