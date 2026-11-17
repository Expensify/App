/* eslint-disable @typescript-eslint/naming-convention -- fixture keys are module paths */
import {describe, expect, it} from 'bun:test';

import vm from 'node:vm';

import cjsInlineRequiresLoader from '../../config/repack/cjs-inline-requires-loader.mjs';

type LoaderContext = {
    async: () => (error: Error | null, code?: string) => void;
    getOptions: () => Record<string, unknown>;
    resourcePath: string;
    sourceMap: boolean;
};

/** Runs the loader the way Rspack does and resolves with the transformed module code. */
function transform(source: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const context: LoaderContext = {
            async: () => (error, code) => (error ? reject(error) : resolve(code ?? '')),
            getOptions: () => ({sourcemap: false}),
            resourcePath: '/app/src/Example.tsx',
            sourceMap: false,
        };
        (cjsInlineRequiresLoader as (this: LoaderContext, source: string) => Promise<void>).call(context, source);
    });
}

/** Evaluates transformed CommonJS code with a `require` that counts how often each module is loaded. */
function evaluate(code: string, modules: Record<string, unknown>) {
    const loads: Record<string, number> = {};
    const fakeRequire = (name: string) => {
        loads[name] = (loads[name] ?? 0) + 1;
        return modules[name];
    };
    const moduleObject = {exports: {} as Record<string, (...args: unknown[]) => unknown>};
    vm.runInNewContext(code, {require: fakeRequire, exports: moduleObject.exports, module: moduleObject, globalThis: {}});
    return {exports: moduleObject.exports, loads};
}

describe('cjsInlineRequiresLoader', () => {
    it.each([
        [
            'a default import',
            `import Icon from '@components/Icon';\nexport default function f() { return Icon; }`,
            '(_Icon || (_Icon = /*#__PURE__*/_interop_require_default(require("@components/Icon"))))',
        ],
        ['a named import', `import {foo} from '@libs/foo';\nexport default function f() { return foo(); }`, '(_foo || (_foo = require("@libs/foo")))'],
        [
            'a namespace import',
            `import * as Utils from '@libs/Utils';\nexport default function f() { return Utils.u(); }`,
            '(_Utils || (_Utils = /*#__PURE__*/_interop_require_wildcard(require("@libs/Utils"))))',
        ],
        ['react', `import {useState} from 'react';\nexport default function f() { return useState(0); }`, '= require("react");'],
        ['react-native', `import {View} from 'react-native';\nexport default function f() { return View; }`, '= require("react-native");'],
        ['the JSX runtime', `import {jsx} from 'react/jsx-runtime';\nexport default function f() { return jsx('a', {}); }`, '= require("react/jsx-runtime");'],
        ['the React Compiler runtime', `import {c} from 'react/compiler-runtime';\nexport default function f() { return c(1); }`, '= require("react/compiler-runtime");'],
    ])('shapes %s as expected', async (_label, source, expected) => {
        // Given a module importing one dependency
        // When the loader transforms it
        const code = await transform(source);

        // Then app imports are memoized at their use site, and the React modules stay required once at the top
        expect(code).toContain(expected);
    });

    it('leaves a destructured require alone', async () => {
        // Given a destructured require inside a block, which has no single variable to memoize into
        const source = `export function f() { if (globalThis.flag) { const {a, b} = require('@libs/tools'); a(b); } }`;

        // When the loader transforms it
        const code = await transform(source);

        // Then the destructuring stays as written instead of losing its initializer
        expect(code).toMatch(/var \{\s*a,\s*b\s*\} = require\('@libs\/tools'\);/);
    });

    it.each([
        [
            'a function called twice',
            `import {foo} from '@libs/foo';\nexport function run() { return foo(); }`,
            (exports: Record<string, (...args: unknown[]) => unknown>) => [exports.run(), exports.run()],
            ['ok', 'ok'],
        ],
        [
            'a parameter default that is skipped before one that runs',
            `import {getA, getB} from '@libs/foo';\nexport function run({a = getA, b = getB} = {}) { return [a, b()]; }`,
            (exports: Record<string, (...args: unknown[]) => unknown>) => exports.run({a: 'given'}),
            ['given', 'ok'],
        ],
        [
            'a use inside a branch that does not run first',
            `import {foo} from '@libs/foo';\nexport function run(skip) { if (skip) { return foo(); } return foo(); }`,
            (exports: Record<string, (...args: unknown[]) => unknown>) => [exports.run(false), exports.run(true)],
            ['ok', 'ok'],
        ],
    ])('loads a module once, at its first use, for %s', async (_label, source, act, expected) => {
        // Given a module whose import is used in a place that may not run on the first call
        const code = await transform(source);
        const {exports, loads} = evaluate(code, {'@libs/foo': {foo: () => 'ok', getA: () => 'a', getB: () => 'ok'}});

        // When nothing has used the import yet
        // Then the module has not been loaded
        expect(loads['@libs/foo']).toBeUndefined();

        // When the exported function runs
        const result = act(exports);

        // Then it returns the imported values, and the module was loaded exactly once
        expect(result).toEqual(expected);
        expect(loads['@libs/foo']).toBe(1);
    });
});
