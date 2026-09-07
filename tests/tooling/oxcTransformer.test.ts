import {describe, expect, it} from 'bun:test';

import {createRequire} from 'node:module';
import path from 'node:path';

type TransformResult = {code: string};

type OxcTransformer = {
    process: (sourceText: string, sourcePath: string, transformOptions: unknown) => TransformResult;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Jest transformers are CJS and tsconfig.bun.json does not type-check config/babel/
const oxcTransformer = createRequire(import.meta.url)('../../config/babel/oxcJestTransformer') as OxcTransformer;

const transformOptions = {
    config: {cwd: process.cwd(), rootDir: process.cwd(), cache: false},
    cacheFS: new Map(),
    configString: '',
    instrument: false,
    supportsDynamicImport: false,
    supportsExportNamespaceFrom: false,
    supportsStaticESM: false,
    supportsTopLevelAwait: false,
};

describe('oxcTransformer', () => {
    it('emits CommonJS for app TypeScript', () => {
        const source = `
            export function add(a: number, b: number): number {
                return a + b;
            }
        `;
        const result = oxcTransformer.process(source, path.resolve('src/libs/math.ts'), transformOptions);
        expect(result.code).toContain('module.exports');
        expect(result.code).toContain('add: () => add');
        expect(result.code).not.toMatch(/^export /m);
        expect(result.code).not.toContain(': number');
    });

    it('runs React Compiler on app components', () => {
        const source = `
            export function Hello({name}: {name: string}) {
                return <div>{name.toUpperCase()}</div>;
            }
        `;
        const result = oxcTransformer.process(source, path.resolve('src/components/Hello.tsx'), transformOptions);
        expect(result.code).toMatch(/compiler-runtime|_c\(/);
        expect(result.code).toContain('jsxDEV');
    });

    it('leaves test files on babel-jest so jest.mock is hoisted', () => {
        const source = `
            import foo from './foo';
            jest.mock('./foo');
            export const x = 1;
        `;
        const result = oxcTransformer.process(source, path.resolve('tests/perf-test/Hello.perf-test.tsx'), transformOptions);
        expect(result.code).toContain('_getJestObj().mock("./foo")');
        expect(result.code.indexOf('_getJestObj().mock')).toBeLessThan(result.code.indexOf('exports.x'));
    });

    it('lowers dynamic import() so Jest still owns the module graph', () => {
        const source = `
            export function loadLazy() {
                return import('./LazyScreen');
            }
        `;
        const result = oxcTransformer.process(source, path.resolve('src/libs/loadLazy.ts'), transformOptions);
        expect(result.code).not.toMatch(/\bimport\s*\(/);
        expect(result.code).toMatch(/require\(['"]\.\/LazyScreen['"]\)/);
    });

    it('falls back to babel-jest for Flow in node_modules', () => {
        const source = `
            // @flow
            export function add(a: number, b: number): number {
                return a + b;
            }
        `;
        const result = oxcTransformer.process(source, path.resolve('node_modules/react-native/Libraries/foo.js'), transformOptions);
        expect(result.code).toBeTruthy();
        expect(result.code).not.toContain(': number');
    });
});
