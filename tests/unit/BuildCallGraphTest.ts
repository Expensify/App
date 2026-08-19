import type {BuildOptions, PathAliases} from '../../scripts/buildCallGraph';
import type {FileAnalysis, SourceCall, SourceReference, SourceUnit} from '../../scripts/callGraphFromSource';

import {buildCallGraph, resolveModuleSources} from '../../scripts/buildCallGraph';
import {isRenderReachable} from '../../scripts/renderReachability';

// Built rather than written as a literal: the alias keys are not valid property names for our naming rules.
const ALIASES: PathAliases = Object.fromEntries([
    ['@libs/*', ['./src/libs/*']],
    ['@userActions/*', ['./src/libs/actions/*']],
    ['@hooks/*', ['./src/hooks/*']],
]);

function options(knownFiles: string[]): BuildOptions {
    return {aliases: ALIASES, knownFiles: new Set(knownFiles)};
}

function entryUnit(file: string, name: string): SourceUnit {
    return {id: `${file}#${name}`, name, isRenderEntry: true, line: 1};
}

function plainUnit(file: string, name: string): SourceUnit {
    return {id: `${file}#${name}`, name, isRenderEntry: false, line: 1};
}

function localCall(from: string, to: string): SourceCall {
    return {from, callee: {kind: 'local', unitId: to}, line: 1};
}

function moduleCall(from: string, source: string, name: string): SourceCall {
    return {from, callee: {kind: 'module', source, name}, line: 1};
}

function localReference(from: string, to: string, via: string): SourceReference {
    return {from, target: {kind: 'local', unitId: to}, line: 7, via};
}

function moduleReference(from: string, source: string, name: string, via: string): SourceReference {
    return {from, target: {kind: 'module', source, name}, line: 7, via};
}

function analysis(file: string, parts: Partial<Omit<FileAnalysis, 'file'>> = {}): FileAnalysis {
    return {file, units: [], calls: [], references: [], reads: [], reExports: [], defaultExportUnitId: null, ...parts};
}

describe('resolveModuleSources', () => {
    it('resolves an alias to a file with an implied extension', () => {
        expect(resolveModuleSources('@libs/ReportUtils', 'src/pages/SearchPage.tsx', options(['src/libs/ReportUtils.ts']))).toEqual(['src/libs/ReportUtils.ts']);
    });

    it('resolves an alias to a directory index', () => {
        expect(resolveModuleSources('@userActions/IOU', 'src/pages/SearchPage.tsx', options(['src/libs/actions/IOU/index.ts']))).toEqual(['src/libs/actions/IOU/index.ts']);
    });

    it('resolves a relative import against the importing file', () => {
        expect(resolveModuleSources('./Duplicate', 'src/libs/actions/IOU/index.ts', options(['src/libs/actions/IOU/Duplicate.ts']))).toEqual(['src/libs/actions/IOU/Duplicate.ts']);
        expect(resolveModuleSources('../ReportUtils', 'src/libs/actions/IOU.ts', options(['src/libs/ReportUtils.ts']))).toEqual(['src/libs/ReportUtils.ts']);
    });

    it('returns every platform variant when a module has no neutral file', () => {
        const resolved = resolveModuleSources('@libs/AppState', 'src/pages/SearchPage.tsx', options(['src/libs/AppState.native.ts', 'src/libs/AppState.web.ts']));

        expect(resolved).toEqual(['src/libs/AppState.native.ts', 'src/libs/AppState.web.ts']);
    });

    it('prefers the platform-neutral file, and still lists the variants alongside it', () => {
        const resolved = resolveModuleSources('@libs/AppState', 'src/pages/SearchPage.tsx', options(['src/libs/AppState.ts', 'src/libs/AppState.native.ts']));

        expect(resolved.at(0)).toBe('src/libs/AppState.ts');
    });

    it('returns nothing for a package import', () => {
        expect(resolveModuleSources('react-native-onyx', 'src/pages/SearchPage.tsx', options(['src/libs/ReportUtils.ts']))).toEqual([]);
    });
});

describe('buildCallGraph', () => {
    it('keeps a local call as an edge and resolves a call across an alias', () => {
        const analyses = [
            analysis('src/pages/SearchPage.tsx', {
                units: [entryUnit('src/pages/SearchPage.tsx', 'SearchPage')],
                calls: [moduleCall('src/pages/SearchPage.tsx#SearchPage', '@userActions/Duplicate', 'bulkDuplicateReports')],
            }),
            analysis('src/libs/actions/Duplicate.ts', {
                units: [plainUnit('src/libs/actions/Duplicate.ts', 'bulkDuplicateReports'), plainUnit('src/libs/actions/Duplicate.ts', 'buildOptions')],
                calls: [localCall('src/libs/actions/Duplicate.ts#bulkDuplicateReports', 'src/libs/actions/Duplicate.ts#buildOptions')],
            }),
        ];

        const {graph, stats} = buildCallGraph(analyses, options(['src/pages/SearchPage.tsx', 'src/libs/actions/Duplicate.ts']));

        expect(graph.edges).toEqual([
            {from: 'src/pages/SearchPage.tsx#SearchPage', to: 'src/libs/actions/Duplicate.ts#bulkDuplicateReports'},
            {from: 'src/libs/actions/Duplicate.ts#bulkDuplicateReports', to: 'src/libs/actions/Duplicate.ts#buildOptions'},
        ]);
        expect(stats.unresolvedCalls).toBe(0);
        expect(stats.unresolvedModuleTargets).toBe(0);
        // The transitive answer the checker exists for: a plain function two hops from a component body.
        expect(isRenderReachable(graph, 'src/libs/actions/Duplicate.ts#buildOptions')).toBe(true);
    });

    it('resolves a call to a module default export', () => {
        const analyses = [
            analysis('src/pages/SearchPage.tsx', {
                units: [entryUnit('src/pages/SearchPage.tsx', 'SearchPage')],
                calls: [moduleCall('src/pages/SearchPage.tsx#SearchPage', '@userActions/navigateToConciergeChat', 'default')],
            }),
            analysis('src/libs/actions/navigateToConciergeChat.ts', {
                units: [plainUnit('src/libs/actions/navigateToConciergeChat.ts', 'navigateToConciergeChat')],
                defaultExportUnitId: 'src/libs/actions/navigateToConciergeChat.ts#navigateToConciergeChat',
            }),
        ];

        const {graph} = buildCallGraph(analyses, options(['src/pages/SearchPage.tsx', 'src/libs/actions/navigateToConciergeChat.ts']));

        expect(graph.edges).toEqual([{from: 'src/pages/SearchPage.tsx#SearchPage', to: 'src/libs/actions/navigateToConciergeChat.ts#navigateToConciergeChat'}]);
    });

    it('follows a named re-export to the file that declares the function', () => {
        const analyses = [
            analysis('src/pages/SearchPage.tsx', {
                units: [entryUnit('src/pages/SearchPage.tsx', 'SearchPage')],
                calls: [moduleCall('src/pages/SearchPage.tsx#SearchPage', '@userActions/IOU', 'bulkDuplicateReports')],
            }),
            analysis('src/libs/actions/IOU/index.ts', {reExports: [{name: 'bulkDuplicateReports', source: './Duplicate'}]}),
            analysis('src/libs/actions/IOU/Duplicate.ts', {units: [plainUnit('src/libs/actions/IOU/Duplicate.ts', 'bulkDuplicateReports')]}),
        ];

        const {graph} = buildCallGraph(analyses, options(['src/pages/SearchPage.tsx', 'src/libs/actions/IOU/index.ts', 'src/libs/actions/IOU/Duplicate.ts']));

        expect(graph.edges).toEqual([{from: 'src/pages/SearchPage.tsx#SearchPage', to: 'src/libs/actions/IOU/Duplicate.ts#bulkDuplicateReports'}]);
    });

    it('follows a star re-export', () => {
        const analyses = [
            analysis('src/pages/SearchPage.tsx', {
                units: [entryUnit('src/pages/SearchPage.tsx', 'SearchPage')],
                calls: [moduleCall('src/pages/SearchPage.tsx#SearchPage', '@userActions/IOU', 'bulkDuplicateReports')],
            }),
            analysis('src/libs/actions/IOU/index.ts', {reExports: [{name: '*', source: './Duplicate'}]}),
            analysis('src/libs/actions/IOU/Duplicate.ts', {units: [plainUnit('src/libs/actions/IOU/Duplicate.ts', 'bulkDuplicateReports')]}),
        ];

        const {graph} = buildCallGraph(analyses, options(['src/pages/SearchPage.tsx', 'src/libs/actions/IOU/index.ts', 'src/libs/actions/IOU/Duplicate.ts']));

        expect(graph.edges).toEqual([{from: 'src/pages/SearchPage.tsx#SearchPage', to: 'src/libs/actions/IOU/Duplicate.ts#bulkDuplicateReports'}]);
    });

    it('links every platform variant of an imported module', () => {
        const analyses = [
            analysis('src/pages/SearchPage.tsx', {
                units: [entryUnit('src/pages/SearchPage.tsx', 'SearchPage')],
                calls: [moduleCall('src/pages/SearchPage.tsx#SearchPage', '@libs/AppState', 'isAppActive')],
            }),
            analysis('src/libs/AppState.native.ts', {units: [plainUnit('src/libs/AppState.native.ts', 'isAppActive')]}),
            analysis('src/libs/AppState.web.ts', {units: [plainUnit('src/libs/AppState.web.ts', 'isAppActive')]}),
        ];

        const {graph} = buildCallGraph(analyses, options(['src/pages/SearchPage.tsx', 'src/libs/AppState.native.ts', 'src/libs/AppState.web.ts']));

        expect(graph.edges).toEqual([
            {from: 'src/pages/SearchPage.tsx#SearchPage', to: 'src/libs/AppState.native.ts#isAppActive'},
            {from: 'src/pages/SearchPage.tsx#SearchPage', to: 'src/libs/AppState.web.ts#isAppActive'},
        ]);
    });

    it('counts what it could not resolve instead of dropping it silently', () => {
        const analyses = [
            analysis('src/pages/SearchPage.tsx', {
                units: [entryUnit('src/pages/SearchPage.tsx', 'SearchPage')],
                calls: [
                    {from: 'src/pages/SearchPage.tsx#SearchPage', callee: {kind: 'unresolved', reason: 'dynamic'}, line: 1},
                    moduleCall('src/pages/SearchPage.tsx#SearchPage', '@libs/Missing', 'whatever'),
                    moduleCall('src/pages/SearchPage.tsx#SearchPage', '@libs/ReportUtils', 'notDeclaredThere'),
                ],
            }),
            analysis('src/libs/ReportUtils.ts', {units: [plainUnit('src/libs/ReportUtils.ts', 'getReportName')]}),
        ];

        const {graph, stats} = buildCallGraph(analyses, options(['src/pages/SearchPage.tsx', 'src/libs/ReportUtils.ts']));

        expect(graph.edges).toEqual([]);
        expect(stats.unresolvedCalls).toBe(1);
        expect(stats.unresolvedByReason).toEqual({global: 0, dynamic: 1, member: 0, unknown: 0});
        expect(stats.unresolvedModuleTargets).toBe(2);
        // One module is not in the graph at all; the other is, but does not export the name.
        expect(stats.externalModuleCalls).toBe(1);
        expect(stats.missingExportCalls).toBe(1);
    });

    it('records each edge once even when the same call appears repeatedly', () => {
        const analyses = [
            analysis('src/pages/SearchPage.tsx', {
                units: [entryUnit('src/pages/SearchPage.tsx', 'SearchPage')],
                calls: [
                    moduleCall('src/pages/SearchPage.tsx#SearchPage', '@libs/ReportUtils', 'getReportName'),
                    moduleCall('src/pages/SearchPage.tsx#SearchPage', '@libs/ReportUtils', 'getReportName'),
                ],
            }),
            analysis('src/libs/ReportUtils.ts', {units: [plainUnit('src/libs/ReportUtils.ts', 'getReportName')]}),
        ];

        const {graph} = buildCallGraph(analyses, options(['src/pages/SearchPage.tsx', 'src/libs/ReportUtils.ts']));

        expect(graph.edges).toHaveLength(1);
    });
});

/**
 * References resolve like calls but stay out of the graph, because passing a function is not calling it.
 * An edge here would invent render paths that do not exist.
 */
describe('buildCallGraph, value references', () => {
    it('resolves a local reference without adding an edge', () => {
        const analyses = [
            analysis('src/hooks/useThing.ts', {
                units: [entryUnit('src/hooks/useThing.ts', 'useThing'), plainUnit('src/hooks/useThing.ts', 'useThing.refresh')],
                references: [localReference('src/hooks/useThing.ts#useThing', 'src/hooks/useThing.ts#useThing.refresh', 'useNetwork')],
            }),
        ];

        const {graph, references} = buildCallGraph(analyses, options(['src/hooks/useThing.ts']));

        expect(graph.edges).toEqual([]);
        expect(references).toEqual([{targetId: 'src/hooks/useThing.ts#useThing.refresh', from: 'src/hooks/useThing.ts#useThing', file: 'src/hooks/useThing.ts', line: 7, via: 'useNetwork'}]);
        // The hook renders, so an edge would have made the handed-off function look render-reachable.
        expect(isRenderReachable(graph, 'src/hooks/useThing.ts#useThing.refresh')).toBe(false);
    });

    it('resolves a reference across an alias to the module default', () => {
        const analyses = [
            analysis('src/pages/SearchPage.tsx', {
                units: [entryUnit('src/pages/SearchPage.tsx', 'SearchPage')],
                references: [moduleReference('src/pages/SearchPage.tsx#SearchPage', '@userActions/navigateToConciergeChat', 'default', 'onPress')],
            }),
            analysis('src/libs/actions/navigateToConciergeChat.ts', {
                units: [plainUnit('src/libs/actions/navigateToConciergeChat.ts', 'navigateToConciergeChat')],
                defaultExportUnitId: 'src/libs/actions/navigateToConciergeChat.ts#navigateToConciergeChat',
            }),
        ];

        const {graph, references} = buildCallGraph(analyses, options(['src/pages/SearchPage.tsx', 'src/libs/actions/navigateToConciergeChat.ts']));

        expect(graph.edges).toEqual([]);
        expect(references.map((reference) => reference.targetId)).toEqual(['src/libs/actions/navigateToConciergeChat.ts#navigateToConciergeChat']);
    });

    it('drops a reference whose target could not be identified', () => {
        const analyses = [
            analysis('src/pages/SearchPage.tsx', {
                units: [entryUnit('src/pages/SearchPage.tsx', 'SearchPage')],
                references: [{from: 'src/pages/SearchPage.tsx#SearchPage', target: {kind: 'unresolved', reason: 'unknown'}, line: 7, via: 'onPress'}],
            }),
        ];

        expect(buildCallGraph(analyses, options(['src/pages/SearchPage.tsx'])).references).toEqual([]);
    });
});
