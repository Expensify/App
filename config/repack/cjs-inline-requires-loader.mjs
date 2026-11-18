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
 * Required eagerly: used on every render, and they never import app code, so they cannot form a cycle.
 * The renderer aliases scheduler functions at its top level and calls `shouldYield` once per fiber.
 */
const NON_INLINED_REQUIRES = ['react', 'react-native', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react/compiler-runtime', 'scheduler'];

/**
 * Rewrites each use of a top-level require binding to `(_x || (_x = require('x')))`, including
 * SWC's interop-wrapped form, which Metro's plugin cannot defer. Memoized because Re.Pack wraps every
 * `require()` in a try/catch guard, and render code reads imports many times per render. Metro's `memoizeCalls` is not used:
 * after the first use in a scope it reads the bare variable, which is still empty when that first
 * use sat in a destructuring default, an optional call or a logical assignment that did not run.
 *
 * Limit: the first use keeps the `module.exports` it got, so a module that reassigns
 * `module.exports` after calling back into its importer during a cycle leaves the old object.
 */
function memoizeDeferredRequiresPlugin({types: t}) {
    const isDeferrableRequire = (node) =>
        t.isCallExpression(node) &&
        t.isIdentifier(node.callee, {name: 'require'}) &&
        node.arguments.length === 1 &&
        t.isStringLiteral(node.arguments[0]) &&
        !NON_INLINED_REQUIRES.includes(node.arguments[0].value);
    const isDeferrableInit = (node) => isDeferrableRequire(node) || (t.isCallExpression(node) && INTEROP_HELPERS.has(node.callee.name) && isDeferrableRequire(node.arguments[0]));
    /** `x` in `x.prop = …` or `x.prop++`. */
    const isPropertyWrite = ({node, parentPath: member}) =>
        member.isMemberExpression({object: node}) && (member.parentPath.isAssignmentExpression({left: member.node}) || member.parentPath.isUpdateExpression());
    /** `x` in a top-level `var X = x.prop` or `var X = x['prop']`. */
    const isTopLevelMemberAlias = ({node, parentPath: member}) =>
        member.isMemberExpression({object: node}) &&
        (!member.node.computed || t.isStringLiteral(member.node.property)) &&
        member.parentPath.isVariableDeclarator({init: member.node}) &&
        t.isIdentifier(member.parent.id) &&
        member.parentPath.parentPath.parentPath.isProgram();

    return {
        visitor: {
            Program(programPath) {
                // A local `require` is not the module loader. SWC renames it only in files with imports.
                if (programPath.scope.hasOwnBinding('require')) {
                    return;
                }
                for (const binding of Object.values(programPath.scope.bindings)) {
                    const {id, init} = binding.path.node;
                    // Bindings include `var`s hoisted out of top-level `try`/`if` blocks, which must stay guarded.
                    // A reassigned binding is skipped because the `_x || (_x = require())` rewrite would load the
                    // module again after the file clears it, instead of reading the value the file assigned.
                    // An unused binding is skipped because clearing its init below would stop an interop-wrapped
                    // import loading. A require whose properties the file writes is left whole to Metro's plugin,
                    // which keeps aliases of those properties at the value from their own line.
                    if (
                        !binding.path.isVariableDeclarator() ||
                        !binding.path.parentPath.parentPath.isProgram() ||
                        !t.isIdentifier(id) ||
                        !isDeferrableInit(init) ||
                        !binding.constant ||
                        binding.referencePaths.length === 0 ||
                        binding.referencePaths.some(isPropertyWrite)
                    ) {
                        continue;
                    }
                    const isBareRequire = isDeferrableRequire(init);
                    for (const reference of binding.referencePaths) {
                        // An alias stays `require('x').prop` for Metro's plugin to defer to the alias's uses. Memoized,
                        // it would run at module evaluation and read `prop` before a cycle sets it.
                        const required = t.cloneNode(init, true);
                        const isMetroAlias = isBareRequire && isTopLevelMemberAlias(reference);
                        reference.replaceWith(isMetroAlias ? required : t.logicalExpression('||', t.identifier(id.name), t.assignmentExpression('=', t.identifier(id.name), required)));
                    }
                    // SWC's block-scoping lowering emits `var`, and a `var` with no initializer does not clear a value
                    // an earlier use stored.
                    binding.path.node.init = null;
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
