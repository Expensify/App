/**
 * Lowers ES modules to CommonJS and defers each `require()` to its first use site. This gives the
 * same import-cycle tolerance Metro gets from `inlineRequires` (see metro.config.js), which this
 * app relies on to boot.
 *
 * Uses Metro's own `inlineRequiresPlugin` rather than SWC's `module.lazy`. Both defer ~100% of
 * imports, but SWC's lazy mode emits a memoizing wrapper function per imported module. That is
 * about 103k extra functions here, worth about 7MB of Hermes bytecode. Inlining the require at
 * the use site defers identically and emits no wrapper.
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
 * Extends inline-requires to SWC's interop-wrapped imports, which Metro's plugin alone cannot
 * defer: it requires `arguments[0]` to be a string literal (SWC passes a `require()` call) and
 * skips any call whose function is bound locally (SWC declares the helper in-file). Without this,
 * default and namespace imports stay hoisted and eager. That is about half of all imports here,
 * and exactly the cycle tolerance the loader exists to provide.
 *
 * Metro sidesteps the problem with a global `_$$_IMPORT_DEFAULT('x')` helper that resolves the
 * module id at runtime. That is not portable to webpack, which must see a literal `require('x')`
 * to add the module to the graph at all. So instead of hoisting the helper, we inline the whole
 * initializer (the interop call and the literal require together) down to each use site.
 *
 * Repeating the interop call per use site is cheap: `_interop_require_wildcard` early-returns for
 * `__esModule` objects and memoizes the rest in a WeakMap, and `_interop_require_default` is a
 * single object literal on the non-ESM path.
 */
function inlineInteropRequiresPlugin({types: t}) {
    const isInteropRequire = (node) =>
        t.isCallExpression(node) &&
        t.isIdentifier(node.callee) &&
        INTEROP_HELPERS.has(node.callee.name) &&
        node.arguments.length >= 1 &&
        t.isCallExpression(node.arguments[0]) &&
        t.isIdentifier(node.arguments[0].callee, {name: 'require'}) &&
        node.arguments[0].arguments.length === 1 &&
        t.isStringLiteral(node.arguments[0].arguments[0]);

    return {
        visitor: {
            Program(programPath) {
                for (const binding of Object.values(programPath.scope.bindings)) {
                    if (!binding.path.isVariableDeclarator() || !isInteropRequire(binding.path.node.init)) {
                        continue;
                    }
                    // Reassignment would make the inlined copies diverge from the original binding.
                    if (!binding.constant) {
                        continue;
                    }
                    // With no references there is nothing to inline into, and dropping the
                    // declaration would stop the module loading at all, since side-effect imports
                    // rely on it. Metro's plugin does remove these, but we stay conservative here.
                    if (binding.referencePaths.length === 0) {
                        continue;
                    }
                    for (const reference of binding.referencePaths) {
                        reference.replaceWith(t.cloneNode(binding.path.node.init, true));
                    }
                    binding.path.remove();
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
            module: {type: 'commonjs', lazy: false},
            sourceMaps,
            inputSourceMap: inputSourceMap ? JSON.stringify(inputSourceMap) : undefined,
        });

        const babelResult = await babel.transformAsync(swcResult.code, {
            babelrc: false,
            configFile: false,
            filename: this.resourcePath,
            // Interop-wrapped imports first, then Metro's plugin for the bare `require` form.
            plugins: [inlineInteropRequiresPlugin, inlineRequiresPlugin],
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
