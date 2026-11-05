import {describe, expect, it} from 'bun:test';

import findLostCacheGuards from '../../scripts/utils/findLostCacheGuards';

const CACHED_SOURCE = `
import {buildList, formatLabels, useThing} from './utils';
function useFoo(items: number[]) {
    const labels = formatLabels(items);
    useThing();
    const list = buildList(items);
    list.push(1);
    return {list, labels};
}
export default useFoo;
`;

const UNCACHED_SOURCE = `
import {buildList, formatLabels, useThing} from './utils';
function useFoo(items: number[]) {
    const labels = formatLabels(items);
    const list = buildList(items);
    useThing();
    list.push(1);
    return {list, labels};
}
export default useFoo;
`;

describe('findLostCacheGuards', () => {
    it('should report a call that the compiler cached on main and runs on every render on the branch', () => {
        // Given a hook whose list is now mutated after a hook call, which stops the compiler from caching buildList
        const baseSource = CACHED_SOURCE;
        const branchSource = UNCACHED_SOURCE;

        // When both versions are compared
        const lostGuards = findLostCacheGuards(baseSource, branchSource, 'src/hooks/useFoo.ts');

        // Then buildList and the push on its result are reported, while formatLabels keeps its cache
        expect(lostGuards).toEqual([
            {functionName: 'useFoo', call: 'buildList'},
            {functionName: 'useFoo', call: 'list.push'},
        ]);
    });

    it('should report nothing when the change keeps every cached call cached', () => {
        // Given a branch that only moves the hook call above a call that stays cached
        const branchSource = CACHED_SOURCE.replace('    const labels = formatLabels(items);\n    useThing();', '    useThing();\n    const labels = formatLabels(items);');

        // When it is compared with main
        const lostGuards = findLostCacheGuards(CACHED_SOURCE, branchSource, 'src/hooks/useFoo.ts');

        // Then the check passes, so harmless reordering does not block a PR
        expect(lostGuards).toEqual([]);
    });

    it('should not report a new uncached call when the cached calls of the same function stay cached', () => {
        // Given a branch that adds a second, uncached buildList call next to the cached one
        const branchSource = CACHED_SOURCE.replace(
            '    const labels = formatLabels(items);\n    useThing();',
            '    const labels = formatLabels(items);\n    const draft = buildList(items);\n    useThing();\n    draft.push(2);',
        );

        // When it is compared with main
        const lostGuards = findLostCacheGuards(CACHED_SOURCE, branchSource, 'src/hooks/useFoo.ts');

        // Then nothing is reported, because no call moved out of its cache guard
        expect(lostGuards).toEqual([]);
    });

    it('should report a hook that cached something on main and is no longer compiled', () => {
        // Given a hook that loses its only hook call, so the compiler skips it
        const baseSource = `
import {buildList, useThing} from './utils';
function useFoo(items: number[]) {
    useThing();
    return buildList(items);
}
export default useFoo;
`;
        const branchSource = baseSource.replace('    useThing();\n', '');

        // When both versions are compared
        const lostGuards = findLostCacheGuards(baseSource, branchSource, 'src/hooks/useFoo.ts');

        // Then the hook itself is reported, since none of its calls are cached anymore
        expect(lostGuards).toEqual([{functionName: 'useFoo'}]);
    });

    it('should report a hook that only cached a callback on main and is no longer compiled', () => {
        // Given a hook whose only cache holds a callback, which has no calls that run on render, and that loses its hook call
        const baseSource = `
import {useThing} from './utils';
function useFoo(onDone: (value: number) => void) {
    useThing();
    return () => onDone(1);
}
export default useFoo;
`;
        const branchSource = baseSource.replace('    useThing();\n', '');

        // When both versions are compared
        const lostGuards = findLostCacheGuards(baseSource, branchSource, 'src/hooks/useFoo.ts');

        // Then the hook is reported, because the callback is now a new function on every render
        expect(lostGuards).toEqual([{functionName: 'useFoo'}]);
    });

    it('should report an optional call that loses its cache guard', () => {
        // Given the cached and uncached hooks, with the list built by an optional-chained call
        const toOptionalCall = (source: string) => source.replace('buildList(items)', 'items?.slice()');

        // When both versions are compared
        const lostGuards = findLostCacheGuards(toOptionalCall(CACHED_SOURCE), toOptionalCall(UNCACHED_SOURCE), 'src/hooks/useFoo.ts');

        // Then the optional call is reported, since Babel parses it as OptionalCallExpression rather than CallExpression
        expect(lostGuards).toEqual([
            {functionName: 'useFoo', call: 'items.slice'},
            {functionName: 'useFoo', call: 'list.push'},
        ]);
    });

    it('should report a constructor call that loses its cache guard', () => {
        // Given the cached and uncached hooks, with the list built by a constructor
        const toConstructor = (source: string) => source.replace('buildList(items)', 'new Set(items)').replace('list.push(1)', 'list.add(1)');

        // When both versions are compared
        const lostGuards = findLostCacheGuards(toConstructor(CACHED_SOURCE), toConstructor(UNCACHED_SOURCE), 'src/hooks/useFoo.ts');

        // Then the constructor is reported, since Babel parses it as NewExpression rather than CallExpression
        expect(lostGuards).toEqual([
            {functionName: 'useFoo', call: 'new Set'},
            {functionName: 'useFoo', call: 'list.add'},
        ]);
    });

    it('should compile the base version with its own extension when a file was renamed from .tsx to .ts', () => {
        // Given a hook that renders JSX on main in a .tsx file, and loses its cache after moving to a .ts file
        const baseSource = CACHED_SOURCE.replace('return {list, labels};', 'return {list, labels, header: <Header />};').replace(
            "import {buildList, formatLabels, useThing} from './utils';",
            "import {buildList, formatLabels, Header, useThing} from './utils';",
        );

        // When it is compared with the branch using each version's own path
        const lostGuards = findLostCacheGuards(baseSource, UNCACHED_SOURCE, 'src/hooks/useFoo.ts', 'src/hooks/useFoo.tsx');

        // Then the lost cache is still reported, because the JSX on main no longer fails to parse as TypeScript
        expect(lostGuards).toEqual([
            {functionName: 'useFoo', call: 'buildList'},
            {functionName: 'useFoo', call: 'list.push'},
        ]);
    });

    it('should not compare a function that was renamed', () => {
        // Given a branch that loses the cache but also renames the hook
        const branchSource = UNCACHED_SOURCE.replaceAll('useFoo', 'useBar');

        // When it is compared with main
        const lostGuards = findLostCacheGuards(CACHED_SOURCE, branchSource, 'src/hooks/useFoo.ts');

        // Then nothing is reported, because the check cannot tell which function the old one became
        expect(lostGuards).toEqual([]);
    });
});
