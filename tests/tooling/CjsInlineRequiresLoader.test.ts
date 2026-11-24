/* eslint-disable @typescript-eslint/naming-convention -- fixture keys are module paths */
import {describe, expect, it} from 'bun:test';

import vm from 'node:vm';

import cjsInlineRequiresLoader from '../../config/repack/cjs-inline-requires-loader.mjs';

type LoaderContext = {
    async: () => (error: Error | null, code?: string) => void;
    getOptions: () => Record<string, unknown>;
    resourcePath: string;
};

type Exports = Record<string, (...args: unknown[]) => unknown>;

/** Runs the loader the way Rspack does and resolves with the transformed module code. */
function transform(source: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const context: LoaderContext = {
            async: () => (error, code) => (error ? reject(error) : resolve(code ?? '')),
            getOptions: () => ({sourcemap: false}),
            resourcePath: '/app/src/Example.tsx',
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
    const moduleObject = {exports: {} as Exports};
    vm.runInNewContext(code, {require: fakeRequire, exports: moduleObject.exports, module: moduleObject});
    return {exports: moduleObject.exports, loads};
}

/** Transforms modules that import each other and links them through a cached `require`, so a cycle sees a module that is still evaluating. */
async function evaluateModules(sources: Record<string, string>) {
    const codes = Object.fromEntries(await Promise.all(Object.entries(sources).map(async ([name, source]) => [name, await transform(source)] as const)));
    const cache: Record<string, {exports: Exports}> = {};
    const loads: Record<string, number> = {};
    const load = (name: string): Exports => {
        const cached = cache[name];
        if (cached) {
            return cached.exports;
        }
        loads[name] = (loads[name] ?? 0) + 1;
        const moduleObject = {exports: {} as Exports};
        cache[name] = moduleObject;
        vm.runInNewContext(codes[name] ?? '', {require: load, exports: moduleObject.exports, module: moduleObject});
        return moduleObject.exports;
    };
    return {load, loads};
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
        ...['react', 'react-native', 'react/jsx-runtime', 'react/compiler-runtime'].map((name) => [
            name,
            `import {x} from '${name}';\nexport default function f() { return x(); }`,
            `= require("${name}");`,
        ]),
        [
            'the scheduler',
            `var Scheduler = require('scheduler'), shouldYield = Scheduler.unstable_shouldYield;\nexports.f = function f() { return shouldYield(); };`,
            'shouldYield = Scheduler.unstable_shouldYield',
        ],
    ])('shapes %s as expected', async (_label, source, expected) => {
        // Given a module importing one dependency
        // When the loader transforms it
        const code = await transform(source);

        // Then app imports are memoized at their use site, and the React modules stay required once at the top
        expect(code).toContain(expected);
    });

    it.each([
        ['a function called twice', `import {foo} from '@libs/foo';\nexport function run() { return foo(); }`, (exports: Exports) => [exports.run(), exports.run()], ['ok', 'ok']],
        [
            'a parameter default that is skipped before one that runs',
            `import {getA, getB} from '@libs/foo';\nexport function run({a = getA, b = getB} = {}) { return [a, b()]; }`,
            (exports: Exports) => exports.run({a: 'given'}),
            ['given', 'ok'],
        ],
        [
            'an optional call argument that is skipped before a later use',
            `import {foo} from '@libs/foo';\nexport function run(callback) { callback?.(foo()); return foo(); }`,
            (exports: Exports) => [exports.run(null), exports.run(() => {})],
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

    it.each([
        ['a top-level destructured require', `const {a, b} = require('@libs/foo');\nexport function run() { return a(b); }`, {a: (value: unknown) => value, b: 'ok'}, 'ok'],
        [
            'a module-level function named require',
            `var calls = 0; var require = function (name) { calls++; return name; }; var lib = require('@libs/foo');\nexports.run = function run() { return [calls, lib]; };`,
            {},
            [1, '@libs/foo'],
        ],
        [
            'an alias of a property the file also assigns to',
            `var _x = require('@libs/foo'); _x.foo = 'a'; var X = _x.foo; _x.foo = 'b';\nexports.run = function run() { return X; };`,
            {},
            'a',
        ],
        ['a require binding the file reassigns', `var x = require('@libs/foo');\nexports.run = function run() { x = null; return x; };`, {}, null],
    ])('keeps the behavior of %s', async (_label, source, fooModule, expected) => {
        // Given a top-level require the loader must not memoize, because memoizing it would change what the module computes
        // When the loader transforms it and the module evaluates
        const code = await transform(source);
        const {exports} = evaluate(code, {'@libs/foo': fooModule});

        // Then the exported function returns what the untransformed module would
        expect(exports.run()).toEqual(expected);
    });

    it.each([
        ['a try block', `try { var opt = require('@libs/optional'); } catch (e) {}\nexport function run() { return opt; }`, 1, {}],
        ['an if block that does not run', `if (globalThis.flag) { var opt = require('@libs/optional'); }\nexport function run() { return opt; }`, 0, undefined],
    ])('keeps a require inside %s under its guard', async (_label, source, expectedLoads, expected) => {
        // Given a module-level `var` required inside a guarding block
        const code = await transform(source);

        // When the module evaluates
        const {exports, loads} = evaluate(code, {'@libs/optional': {}});

        // Then the require ran inside the block
        expect(loads['@libs/optional'] ?? 0).toBe(expectedLoads);

        // When the exported function reads the variable
        // Then it sees what the block left, without loading again
        expect(exports.run()).toEqual(expected);
        expect(loads['@libs/optional'] ?? 0).toBe(expectedLoads);
    });

    it.each([
        ['a top-level alias of a named import', `import {foo} from '@libs/foo';\nconst LIMIT = foo;\nexport function run() { return LIMIT; }`],
        ['a Babel loose-mode destructured require', `var _require = require('@libs/foo'), LIMIT = _require.foo;\nexport function run() { return LIMIT; }`],
    ])('defers %s to its first use', async (_label, source) => {
        // Given a module-level alias of an import's property, which a cycle could read before it is set
        const code = await transform(source);
        const {exports, loads} = evaluate(code, {'@libs/foo': {foo: 'ok'}});

        // When the module has only been evaluated
        // Then the import has not been loaded yet
        expect(loads['@libs/foo']).toBeUndefined();

        // When the exported function reads the alias
        // Then it gets the imported value
        expect(exports.run()).toBe('ok');
    });

    it('reads an alias of a module that was still evaluating when the cycle reached it', async () => {
        // Given two modules in a cycle, where `a` calls into `b` before it sets the constant that `b` aliases
        const {load} = await evaluateModules({
            a: `import {init} from 'b';\ninit();\nexport const LIMIT = 5;`,
            b: `import {LIMIT} from 'a';\nconst MAX = LIMIT;\nexport function init() {}\nexport function getMax() { return MAX; }`,
        });

        // When `a` finishes evaluating and `b` reads the alias
        load('a');

        // Then the alias holds the value `a` set after the cycle, because reading it was deferred to its use
        expect(load('b').getMax()).toBe(5);
    });

    it('loads each module of a cycle once when both call each other at runtime', async () => {
        // Given two modules that import each other
        const {load, loads} = await evaluateModules({
            a: `import {b} from 'b';\nexport function a() { return 'a' + b(); }\nexport function upperA() { return 'A'; }`,
            b: `import {upperA} from 'a';\nexport function b() { return upperA(); }`,
        });

        // When `a` calls into `b`, which calls back into `a`
        const result = load('a').a();

        // Then both calls resolve, and each module evaluated only once
        expect(result).toBe('aA');
        expect(loads).toEqual({a: 1, b: 1});
    });

    it('keeps the first exports object when a dependency reassigns module.exports after calling back during a cycle', async () => {
        // Given a CommonJS dependency that calls into its importer while it is still evaluating, and only then replaces module.exports
        const {load} = await evaluateModules({
            a: `import {name} from 'b';\nexport function touch() { return name; }\nexport function getName() { return name; }`,
            b: `var a = require('a');\na.touch();\nmodule.exports = {name: 'final'};`,
        });

        // When the importer reads the import after the dependency has finished
        load('b');

        // Then it still holds the empty object from its first use. This is the limit documented on memoizeDeferredRequiresPlugin, so update that comment if this changes
        expect(load('a').getName()).toBeUndefined();
    });

    it.each([
        ['a parameter', `import {foo} from '@libs/foo';\nexport function run(require) { return foo(); }`],
        ['a catch binding', `import {foo} from '@libs/foo';\nexport function run() { try { throw new Error('fail'); } catch (require) { return foo(); } }`],
        [
            'a local variable in CommonJS',
            `var _foo = require('@libs/foo');\nexports.run = function run() { var require = function () { return {foo: function () { return 'local'; }}; }; return _foo.foo(); };`,
        ],
    ])('loads the import through the module loader when %s is named require', async (_label, source) => {
        // Given a use of an import inside a scope that declares its own `require`, which the inserted require() must not call
        const code = await transform(source);
        const {exports, loads} = evaluate(code, {'@libs/foo': {foo: () => 'ok'}});

        // When the function runs, receiving its own `require` where it takes one
        const result = exports.run(() => ({foo: () => 'local'}));

        // Then the import comes from the module loader
        expect(result).toBe('ok');
        expect(loads['@libs/foo']).toBe(1);
    });
});
