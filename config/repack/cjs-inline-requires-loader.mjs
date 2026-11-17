/**
 * Lowers ES modules to CommonJS and defers each `require()` to its first use site. This gives the
 * same import-cycle tolerance Metro used to get from its `inlineRequires` serializer option,
 * which this app relies on to boot.
 *
 * Uses Metro's own `inlineRequiresPlugin` rather than SWC's `module.lazy`. Both defer ~100% of
 * imports, but SWC's lazy mode emits a memoizing wrapper function per imported module. That is
 * about 103k extra functions here, worth about 7MB of Hermes bytecode. Inlining the require at
 * the use site defers identically and emits no wrapper.
 *
 * Every deferred require is memoized in a module-level variable, so only the first use calls into
 * the module runtime. Re.Pack's runtime runs each `require()` through a guard with a try/catch, and
 * render code reads imported values many times per render, so a require at every use made native
 * renders measurably slower than Metro's output.
 *
 * Needed as a separate stage because OXC transpiles only and has no CJS lowering.
 */
import babel from '@babel/core';
import remapping from '@jridgewell/remapping';
import {rspack} from '@rspack/core';
// CommonJS with lazy getters, so named ESM imports are not statically detectable.
import metroTransformPlugins from 'metro-transform-plugins';

const {inlineRequiresPlugin} = metroTransformPlugins;

/** SWC's interop wrappers for `import x from` and `import * as x from`. */
const INTEROP_HELPERS = new Set(['_interop_require_default', '_interop_require_wildcard']);

/**
 * Modules required once at the top of each importing module instead of at their first use. Hooks,
 * JSX and the React Compiler's cache hook run on every render. None of these modules imports app
 * code, so loading them eagerly cannot create an import cycle. Metro's `nonInlinedRequires` default
 * keeps `react` and `react-native` at the top of the module for the same reason.
 */
const NON_INLINED_REQUIRES = ['react', 'react-native', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react/compiler-runtime'];
const NON_INLINED_REQUIRES_SET = new Set(NON_INLINED_REQUIRES);

/**
 * Defers each top-level `require()` binding to its first use and memoizes it. A use becomes
 * `(_x || (_x = require('x')))`, or `(_x || (_x = _interop_require_default(require('x'))))` for a
 * default or namespace import, so the module still loads at its first use and every later use only
 * reads the variable.
 *
 * Metro's plugin cannot defer the interop-wrapped form: it requires `arguments[0]` to be a string
 * literal (SWC passes a `require()` call) and skips any call whose function is bound locally (SWC
 * declares the helper in-file). Metro itself uses a global `_$$_IMPORT_DEFAULT('x')` helper that
 * resolves the module id at runtime, which webpack cannot do: it must see a literal `require('x')`
 * to add the module to the graph at all.
 *
 * Bare requires (named imports) are memoized here too, rather than with Metro's `memoizeCalls`.
 * After the first use in a scope Metro reads the bare variable, which is still empty when that
 * first use sits in a branch or a parameter default that did not run.
 */
function memoizeDeferredRequiresPlugin({types: t}) {
    const isDeferrableRequire = (node) =>
        t.isCallExpression(node) &&
        t.isIdentifier(node.callee, {name: 'require'}) &&
        node.arguments.length === 1 &&
        t.isStringLiteral(node.arguments[0]) &&
        !NON_INLINED_REQUIRES_SET.has(node.arguments[0].value);
    const isInteropRequire = (node) =>
        t.isCallExpression(node) && t.isIdentifier(node.callee) && INTEROP_HELPERS.has(node.callee.name) && node.arguments.length >= 1 && isDeferrableRequire(node.arguments[0]);

    return {
        visitor: {
            Program(programPath) {
                for (const binding of Object.values(programPath.scope.bindings)) {
                    // A destructured require (`var {a} = require('x')`) has no single variable to memoize into.
                    if (
                        !binding.path.isVariableDeclarator() ||
                        !t.isIdentifier(binding.path.node.id) ||
                        !(isInteropRequire(binding.path.node.init) || isDeferrableRequire(binding.path.node.init))
                    ) {
                        continue;
                    }
                    // Reassignment would make the memoized copies diverge from the original binding.
                    if (!binding.constant) {
                        continue;
                    }
                    // With no references there is nothing to defer, and dropping the require would stop the
                    // module loading at all, which side-effect imports rely on.
                    if (binding.referencePaths.length === 0) {
                        continue;
                    }
                    const init = binding.path.node.init;
                    const name = binding.identifier.name;
                    for (const reference of binding.referencePaths) {
                        reference.replaceWith(t.logicalExpression('||', t.identifier(name), t.assignmentExpression('=', t.identifier(name), t.cloneNode(init, true))));
                    }
                    // `var` without an initializer only reserves the variable, so when the declaration runs after
                    // a use has filled the variable, it does not clear it.
                    binding.path.node.init = null;
                    binding.path.parentPath.node.kind = 'var';
                }
            },
        },
    };
}

export default async function cjsInlineRequiresLoader(source, inputSourceMap) {
    const callback = this.async();
    try {
        const options = this.getOptions() || {};
        // On prebuilt bundles SWC can emit a multi-source map, which remapping() below rejects.
        // The node_modules rule passes `sourcemap: false` to skip maps entirely.
        const sourceMaps = options.sourcemap !== undefined ? options.sourcemap : !!this.sourceMap;

        // App source only needs block-scoping (Hermes shares one binding across loop iterations).
        // node_modules also ship async generators, which Hermes cannot parse, so the node_modules
        // rule opts into lowering those too. Everything else modern Hermes handles natively.
        const envInclude = options.hermesLowering ? ['transform-block-scoping', 'transform-async-to-generator', 'transform-async-generator-functions'] : ['transform-block-scoping'];

        const swcResult = await rspack.experiments.swc.transform(source, {
            filename: this.resourcePath,
            isModule: true,
            env: {
                targets: {node: 24},
                include: envInclude,
            },
            jsc: options.hermesLowering
                ? {
                      // Loose-mode class lowering, same as the babel config's {loose: true} plugins.
                      assumptions: {setPublicClassFields: true, privateFieldsAsProperties: true},
                  }
                : undefined,
            // Match `strictMode: false` in @react-native/babel-preset
            module: {type: 'commonjs', lazy: false, strictMode: false},
            sourceMaps,
            inputSourceMap: inputSourceMap ? JSON.stringify(inputSourceMap) : undefined,
        });

        const babelResult = await babel.transformAsync(swcResult.code, {
            babelrc: false,
            configFile: false,
            filename: this.resourcePath,
            // Top-level require bindings are memoized first; Metro's plugin then moves the remaining requires to their use sites.
            plugins: [memoizeDeferredRequiresPlugin, [inlineRequiresPlugin, {ignoredRequires: NON_INLINED_REQUIRES}]],
            sourceMaps,
            // The minifier handles formatting; keeping newlines makes build output readable.
            compact: false,
        });

        if (!sourceMaps || !babelResult.map) {
            callback(null, babelResult.code);
            return;
        }

        // swcResult.map already folds in inputSourceMap (passed above), so composing the Babel map
        // onto it is enough to keep stack traces pointing at original sources.
        const map = swcResult.map ? remapping([babelResult.map, swcResult.map], () => null) : babelResult.map;
        callback(null, babelResult.code, map);
    } catch (error) {
        callback(error);
    }
}
