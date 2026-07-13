/**
 * Thin wrapper around oxc-transform that adds React Compiler support while
 * demoting non-fatal React Compiler diagnostics from hard build errors to
 * webpack warnings.
 *
 * This works around oxc-project/oxc#23587 (fixed in a future
 * release), which caused the build to fail instead of bailing out on components
 * that violate the Rules of React — the same behaviour as babel-plugin-react-compiler.
 * We need the workaround for now until a new oxc release containing the fix adds back `reactCompiler`.
 */

import remapping from '@jridgewell/remapping';
import path from 'node:path';
import {transform} from 'oxc-transform';

function getLang(ext) {
    if (ext === 'tsx') {
        return 'tsx';
    }
    if (ext === 'ts') {
        return 'ts';
    }
    // JSX is legal syntax in plain .js files too (both rules that route here match .js and .jsx
    // identically), so .js gets the same JSX-enabled parser as .jsx rather than a stricter one.
    return 'jsx';
}

export default async function oxcReactCompilerLoader(source, inputSourceMap) {
    const callback = this.async();
    try {
        const options = this.getOptions() || {};
        const sourceMaps = options.sourcemap !== undefined ? options.sourcemap : !!this.sourceMap;

        const resourcePath = this.resourcePath;
        const ext = path.extname(resourcePath).slice(1);
        const lang = getLang(ext);

        const transformOptions = {
            lang,
            target: options.target,
            jsx: options.jsx,
            reactCompiler: options.reactCompiler,
            sourcemap: sourceMaps,
            cwd: this.rootContext,
        };

        let result = await transform(resourcePath, source, transformOptions);

        // Demote React Compiler diagnostics to webpack warnings instead of
        // hard errors (workaround for oxc-project/oxc#23587).
        const rcErrors = (result.errors || []).filter((e) => e.message && e.message.includes('[ReactCompiler]'));
        const fatalErrors = (result.errors || []).filter((e) => !e.message?.includes('[ReactCompiler]'));

        for (const e of rcErrors) {
            this.emitWarning(new Error(`oxc-react-compiler-loader: ${e.message}`));
        }

        if (fatalErrors.length > 0) {
            const msg = fatalErrors.map((e) => `${e.message}${e.codeframe ? `\n${e.codeframe}` : ''}`).join('\n\n');
            callback(new Error(`Oxc transform errors:\n${msg}`));
            return;
        }

        // A React Compiler error makes oxc-transform bail out
        // of the whole transform and return empty code, not just skip the optimization.
        // Re-run without the compiler to fall back to plain JSX/TS transform output.
        if (!result.code && rcErrors.length > 0) {
            result = await transform(resourcePath, source, {...transformOptions, reactCompiler: false});
        }

        if (sourceMaps && result.map) {
            // oxc-transform has no equivalent of Babel's `inputSourceMap` option, so a map from an
            // earlier loader (e.g. fullstory-annotation-loader) has to be composed in manually —
            // otherwise it'd be discarded and stack traces would point into fullstory's intermediate
            // output instead of the original source.
            const map = inputSourceMap ? remapping([result.map, inputSourceMap], () => null) : result.map;
            callback(null, result.code, map);
        } else {
            callback(null, result.code);
        }
    } catch (err) {
        callback(err);
    }
}
