import {describe, expect, it} from 'bun:test';

import findDomLibraries from '../../scripts/utils/findDomLibraries';

describe('findDomLibraries', () => {
    it('finds DOM libs with the reasons tsc gives for loading them', () => {
        // Given explain-files output where a declaration file references the DOM lib
        const output = [
            'node_modules/typescript/lib/lib.es5.d.ts',
            "   Library 'lib.es5.d.ts' specified in compilerOptions",
            'node_modules/typescript/lib/lib.dom.d.ts',
            "   Library referenced via 'dom' from file 'node_modules/web-streams-polyfill/types/polyfill.d.ts'",
            'src/App.tsx',
            "   Matched by include pattern 'src' in 'tsconfig.app.native.json'",
        ].join('\n');

        // When the DOM libs are looked up
        const domLibraries = findDomLibraries(output);

        // Then only the DOM lib is reported, with the file that pulled it in, so the error points at the dependency to fix
        expect(domLibraries).toEqual([
            {
                file: 'node_modules/typescript/lib/lib.dom.d.ts',
                reasons: ["Library referenced via 'dom' from file 'node_modules/web-streams-polyfill/types/polyfill.d.ts'"],
            },
        ]);
    });

    it('also finds the DOM iterable and web worker libs', () => {
        // Given the other libs that declare DOM globals
        const output = ['node_modules/typescript/lib/lib.dom.iterable.d.ts', 'node_modules/typescript/lib/lib.webworker.d.ts'].join('\n');

        // When the DOM libs are looked up
        const files = findDomLibraries(output).map(({file}) => file);

        // Then both are reported, because either one makes DOM globals type-check in native code
        expect(files).toEqual(['node_modules/typescript/lib/lib.dom.iterable.d.ts', 'node_modules/typescript/lib/lib.webworker.d.ts']);
    });

    it('returns nothing when the program has no DOM lib', () => {
        // Given explain-files output with only ES libs and app files
        const output = ['node_modules/typescript/lib/lib.es2015.core.d.ts', "   Library referenced via 'es2015.core'", 'src/App.tsx'].join('\n');

        // When the DOM libs are looked up / Then none are found, so the native typecheck passes
        expect(findDomLibraries(output)).toEqual([]);
    });
});
