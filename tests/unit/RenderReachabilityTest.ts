import type {CallEdge, CallGraph, FunctionNode} from '../../scripts/renderReachability';

import {buildCallerIndex, findRenderPaths, hasNode, isRenderReachable} from '../../scripts/renderReachability';

function entry(id: string): FunctionNode {
    return {id, isRenderEntry: true};
}

function unit(id: string): FunctionNode {
    return {id, isRenderEntry: false};
}

function graph(nodes: FunctionNode[], edges: Array<[string, string]>): CallGraph {
    return {nodes, edges: edges.map(([from, to]): CallEdge => ({from, to}))};
}

const TARGET = 'src/libs/actions/Duplicate.ts#bulkDuplicateReports';

describe('findRenderPaths', () => {
    it('finds a component that calls the target while rendering', () => {
        const callGraph = graph([entry('src/pages/SearchPage.tsx#SearchPage'), unit(TARGET)], [['src/pages/SearchPage.tsx#SearchPage', TARGET]]);

        expect(findRenderPaths(callGraph, TARGET)).toEqual([['src/pages/SearchPage.tsx#SearchPage', TARGET]]);
        expect(isRenderReachable(callGraph, TARGET)).toBe(true);
    });

    it('leaves a handler off the render path even though its component renders', () => {
        // The component defines the handler but does not call it, so there is no edge out of the component.
        const callGraph = graph([entry('src/pages/SearchPage.tsx#SearchPage'), unit('src/pages/SearchPage.tsx#onPress'), unit(TARGET)], [['src/pages/SearchPage.tsx#onPress', TARGET]]);

        expect(findRenderPaths(callGraph, TARGET)).toEqual([]);
        expect(isRenderReachable(callGraph, TARGET)).toBe(false);
    });

    it('follows a chain across files and reports the render entry closest to the target', () => {
        const callGraph = graph(
            [entry('src/pages/SearchPage.tsx#SearchPage'), entry('src/hooks/useBulkDuplicate.ts#useBulkDuplicate'), unit('src/libs/Duplicate.ts#buildOptions'), unit(TARGET)],
            [
                ['src/pages/SearchPage.tsx#SearchPage', 'src/hooks/useBulkDuplicate.ts#useBulkDuplicate'],
                ['src/hooks/useBulkDuplicate.ts#useBulkDuplicate', 'src/libs/Duplicate.ts#buildOptions'],
                ['src/libs/Duplicate.ts#buildOptions', TARGET],
            ],
        );

        expect(findRenderPaths(callGraph, TARGET)).toEqual([['src/hooks/useBulkDuplicate.ts#useBulkDuplicate', 'src/libs/Duplicate.ts#buildOptions', TARGET]]);
    });

    it('treats a hook body as render code', () => {
        const callGraph = graph([entry('src/hooks/useSwitchToDelegator.ts#useSwitchToDelegator'), unit(TARGET)], [['src/hooks/useSwitchToDelegator.ts#useSwitchToDelegator', TARGET]]);

        expect(isRenderReachable(callGraph, TARGET)).toBe(true);
    });

    it('reports the target itself when the target is render code', () => {
        const callGraph = graph([entry('src/components/PayActionCell.tsx#PayActionCell')], []);

        expect(findRenderPaths(callGraph, 'src/components/PayActionCell.tsx#PayActionCell')).toEqual([['src/components/PayActionCell.tsx#PayActionCell']]);
    });

    it('terminates on a cycle and reports nothing when no entry reaches it', () => {
        const callGraph = graph(
            [unit('src/libs/A.ts#a'), unit('src/libs/B.ts#b'), unit(TARGET)],
            [
                ['src/libs/A.ts#a', 'src/libs/B.ts#b'],
                ['src/libs/B.ts#b', 'src/libs/A.ts#a'],
                ['src/libs/A.ts#a', TARGET],
            ],
        );

        expect(findRenderPaths(callGraph, TARGET)).toEqual([]);
    });

    it('finds the render path when a handler path and a render path both exist', () => {
        const callGraph = graph(
            [entry('src/pages/SearchPage.tsx#SearchPage'), unit('src/pages/ReportScreen.tsx#onPress'), unit('src/libs/Duplicate.ts#buildOptions'), unit(TARGET)],
            [
                ['src/pages/ReportScreen.tsx#onPress', TARGET],
                ['src/pages/SearchPage.tsx#SearchPage', 'src/libs/Duplicate.ts#buildOptions'],
                ['src/libs/Duplicate.ts#buildOptions', TARGET],
            ],
        );

        expect(findRenderPaths(callGraph, TARGET)).toEqual([['src/pages/SearchPage.tsx#SearchPage', 'src/libs/Duplicate.ts#buildOptions', TARGET]]);
    });

    it('reports one path per render entry, in a stable order', () => {
        const callGraph = graph(
            [entry('src/pages/BPage.tsx#BPage'), entry('src/pages/APage.tsx#APage'), unit(TARGET)],
            [
                ['src/pages/BPage.tsx#BPage', TARGET],
                ['src/pages/APage.tsx#APage', TARGET],
            ],
        );

        expect(findRenderPaths(callGraph, TARGET)).toEqual([
            ['src/pages/APage.tsx#APage', TARGET],
            ['src/pages/BPage.tsx#BPage', TARGET],
        ]);
    });

    it('stops at maxPaths without changing the answer', () => {
        const callGraph = graph(
            [entry('src/pages/APage.tsx#APage'), entry('src/pages/BPage.tsx#BPage'), entry('src/pages/CPage.tsx#CPage'), unit(TARGET)],
            [
                ['src/pages/APage.tsx#APage', TARGET],
                ['src/pages/BPage.tsx#BPage', TARGET],
                ['src/pages/CPage.tsx#CPage', TARGET],
            ],
        );

        expect(findRenderPaths(callGraph, TARGET, {maxPaths: 2})).toEqual([
            ['src/pages/APage.tsx#APage', TARGET],
            ['src/pages/BPage.tsx#BPage', TARGET],
        ]);
        expect(isRenderReachable(callGraph, TARGET)).toBe(true);
    });

    it('returns nothing for a target that is not in the graph', () => {
        const callGraph = graph([entry('src/pages/SearchPage.tsx#SearchPage')], []);

        expect(findRenderPaths(callGraph, TARGET)).toEqual([]);
        expect(hasNode(callGraph, TARGET)).toBe(false);
    });
});

describe('buildCallerIndex', () => {
    it('indexes callers by callee and sorts them', () => {
        const callGraph = graph(
            [entry('src/pages/BPage.tsx#BPage'), entry('src/pages/APage.tsx#APage'), unit(TARGET)],
            [
                ['src/pages/BPage.tsx#BPage', TARGET],
                ['src/pages/APage.tsx#APage', TARGET],
            ],
        );

        expect(buildCallerIndex(callGraph).get(TARGET)).toEqual(['src/pages/APage.tsx#APage', 'src/pages/BPage.tsx#BPage']);
    });
});
