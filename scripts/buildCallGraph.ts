/**
 * Stitches per-file analyses into one call graph.
 *
 * Two things happen here, and both are the reason this is a separate module with its own tests: import
 * specifiers become repo-relative file paths (tsconfig aliases, imports with no file extension, index files,
 * platform variants), and a `{source, name}` reference becomes the unit id of the function it names,
 * following re-exports when the file it lands in only forwards the name.
 *
 * Recall matters more than precision here. A call this module cannot resolve is a call the reachability
 * search cannot follow, which can only turn a render-reachable function into an apparently safe one, so
 * `buildCallGraph` counts what it dropped and the CLI prints it. When an import resolves to several
 * platform variants of one module, every variant gets an edge, because any of them can be the one that
 * ships.
 */
import path from 'node:path/posix';

import type {FileAnalysis, UnresolvedReason} from './callGraphFromSource';
import type {CallEdge, CallGraph, FunctionNode} from './renderReachability';

/** tsconfig `compilerOptions.paths`: an alias pattern mapped to one or more target patterns. */
type PathAliases = Record<string, string[]>;

type BuildOptions = {
    aliases: PathAliases;

    /** Every repo-relative source path that exists, used instead of touching the filesystem. */
    knownFiles: ReadonlySet<string>;
};

type BuildStats = {
    files: number;
    units: number;
    edges: number;

    /** Calls whose callee could not be identified at all, for example a call through a parameter. */
    unresolvedCalls: number;

    /**
     * The same total, split by why. `global` and `member` are built-ins and instance methods, which
     * carry no app-code edge; `dynamic` is a call through a binding and is the share that can hide one.
     */
    unresolvedByReason: Record<UnresolvedReason, number>;

    /** Calls that named a module and an export, but whose target unit was not found. */
    unresolvedModuleTargets: number;

    /** Of those, the ones whose module is outside `src/`: a package, or a file the graph does not cover. */
    externalModuleCalls: number;

    /** Of those, the ones whose module resolved to a file in the graph that does not export the name. */
    missingExportCalls: number;
};

/** Where a function was handed off as a value, resolved to the unit it names. */
type ResolvedReference = {
    /** Unit the reference names. */
    targetId: string;

    /** Unit the reference is written in. */
    from: string;

    file: string;
    line: number;

    /** What receives the value: the prop it fills, or the function it is passed to. */
    via: string | null;
};

type BuildResult = {
    graph: CallGraph;
    stats: BuildStats;

    /**
     * Value handoffs, kept out of `graph` on purpose: passing a function is not calling it, so an edge
     * here would invent render paths that do not exist. They explain a unit the search could not trace.
     */
    references: ResolvedReference[];
};

/**
 * Suffixes tried when an import omits the extension. The platform-neutral forms come first, and the
 * platform variants stay in the list because plenty of modules only exist as `.native`/`.web` pairs.
 */
const MODULE_SUFFIXES = [
    '',
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '/index.ts',
    '/index.tsx',
    '/index.js',
    '/index.jsx',
    '.native.ts',
    '.native.tsx',
    '.web.ts',
    '.web.tsx',
    '.ios.ts',
    '.ios.tsx',
    '.android.ts',
    '.android.tsx',
    '/index.native.ts',
    '/index.native.tsx',
    '/index.web.ts',
    '/index.web.tsx',
    '/index.ios.tsx',
    '/index.android.tsx',
];

/** How many re-export hops to follow before giving up. */
const MAX_REEXPORT_DEPTH = 4;

function normalize(candidatePath: string): string {
    return path.normalize(candidatePath).replace(/^\.\//, '');
}

/** Expand an import specifier into the base paths it could refer to, before extensions are tried. */
function expandToBasePaths(source: string, fromFile: string, aliases: PathAliases): string[] {
    if (source.startsWith('.')) {
        return [normalize(path.join(path.dirname(fromFile), source))];
    }

    const basePaths: string[] = [];

    for (const [pattern, targets] of Object.entries(aliases)) {
        if (!pattern.endsWith('*')) {
            if (pattern === source) {
                basePaths.push(...targets.map(normalize));
            }
            continue;
        }

        const prefix = pattern.slice(0, -1);

        if (!source.startsWith(prefix)) {
            continue;
        }

        const rest = source.slice(prefix.length);
        basePaths.push(...targets.map((target) => normalize(target.replace('*', rest))));
    }

    return basePaths;
}

/**
 * Every existing file an import specifier can refer to. More than one means the module ships as
 * platform variants, and the graph links all of them.
 */
function resolveModuleSources(source: string, fromFile: string, options: BuildOptions): string[] {
    const resolved: string[] = [];

    for (const basePath of expandToBasePaths(source, fromFile, options.aliases)) {
        for (const suffix of MODULE_SUFFIXES) {
            const candidate = `${basePath}${suffix}`;

            if (options.knownFiles.has(candidate) && !resolved.includes(candidate)) {
                resolved.push(candidate);
            }
        }
    }

    return resolved;
}

/** Assemble the graph, resolving every cross-file call it can and counting the ones it cannot. */
function buildCallGraph(analyses: readonly FileAnalysis[], options: BuildOptions): BuildResult {
    const nodesById = new Map<string, FunctionNode>();
    const analysisByFile = new Map<string, FileAnalysis>();

    for (const analysis of analyses) {
        analysisByFile.set(analysis.file, analysis);

        for (const unit of analysis.units) {
            if (!nodesById.has(unit.id)) {
                nodesById.set(unit.id, {id: unit.id, isRenderEntry: unit.isRenderEntry});
            }
        }
    }

    /** The unit a `{file, name}` export refers to, following re-exports when the file only forwards it. */
    function resolveExportedUnit(file: string, name: string, depth: number): string | null {
        const analysis = analysisByFile.get(file);

        if (!analysis || depth > MAX_REEXPORT_DEPTH) {
            return null;
        }

        if (name === 'default' && analysis.defaultExportUnitId) {
            return analysis.defaultExportUnitId;
        }

        const directId = `${file}#${name}`;

        if (nodesById.has(directId)) {
            return directId;
        }

        for (const reExport of analysis.reExports) {
            if (reExport.name !== name && reExport.name !== '*') {
                continue;
            }

            for (const nextFile of resolveModuleSources(reExport.source, file, options)) {
                const found = resolveExportedUnit(nextFile, name, depth + 1);

                if (found) {
                    return found;
                }
            }
        }

        return null;
    }

    const edges: CallEdge[] = [];
    const seenEdges = new Set<string>();
    const unresolvedByReason: Record<UnresolvedReason, number> = {global: 0, dynamic: 0, member: 0, unknown: 0};
    let unresolvedCalls = 0;
    let unresolvedModuleTargets = 0;
    let externalModuleCalls = 0;
    let missingExportCalls = 0;

    function addEdge(from: string, to: string): void {
        const edgeKey = `${from} -> ${to}`;

        if (seenEdges.has(edgeKey)) {
            return;
        }

        seenEdges.add(edgeKey);
        edges.push({from, to});
    }

    for (const analysis of analyses) {
        for (const call of analysis.calls) {
            if (call.callee.kind === 'unresolved') {
                unresolvedCalls += 1;
                unresolvedByReason[call.callee.reason] += 1;
                continue;
            }

            if (call.callee.kind === 'local') {
                addEdge(call.from, call.callee.unitId);
                continue;
            }

            const moduleCallee = call.callee;
            const targetFiles = resolveModuleSources(moduleCallee.source, analysis.file, options);
            const targetUnits = targetFiles.flatMap((targetFile) => {
                const unitId = resolveExportedUnit(targetFile, moduleCallee.name, 0);
                return unitId ? [unitId] : [];
            });

            if (targetUnits.length === 0) {
                unresolvedModuleTargets += 1;

                if (targetFiles.length === 0) {
                    externalModuleCalls += 1;
                } else {
                    missingExportCalls += 1;
                }
                continue;
            }

            for (const targetUnit of targetUnits) {
                addEdge(call.from, targetUnit);
            }
        }
    }

    const references: ResolvedReference[] = [];

    for (const analysis of analyses) {
        for (const reference of analysis.references) {
            if (reference.target.kind === 'unresolved') {
                continue;
            }

            const targetIds =
                reference.target.kind === 'local'
                    ? [reference.target.unitId]
                    : resolveModuleSources(reference.target.source, analysis.file, options).flatMap((targetFile) => {
                          const unitId = reference.target.kind === 'module' ? resolveExportedUnit(targetFile, reference.target.name, 0) : null;
                          return unitId ? [unitId] : [];
                      });

            for (const targetId of targetIds) {
                references.push({targetId, from: reference.from, file: analysis.file, line: reference.line, via: reference.via});
            }
        }
    }

    return {
        graph: {nodes: [...nodesById.values()], edges},
        references,
        stats: {
            files: analyses.length,
            units: nodesById.size,
            edges: edges.length,
            unresolvedCalls,
            unresolvedByReason,
            unresolvedModuleTargets,
            externalModuleCalls,
            missingExportCalls,
        },
    };
}

export {buildCallGraph, expandToBasePaths, MODULE_SUFFIXES, resolveModuleSources};
export type {BuildOptions, BuildResult, BuildStats, PathAliases, ResolvedReference};
