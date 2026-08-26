/**
 * Thin wrapper around oxc-transform-react that runs the React Compiler over app source and
 * demotes its diagnostics from hard build errors to webpack warnings.
 *
 * With `panicThreshold: 'none'` the React Compiler never aborts the transform: it skips
 * optimizing the offending component and reports the reason as a `Warning`. Everything that
 * genuinely stops the file being transformed (parse errors, semantic analysis, invalid options)
 * arrives as an `Error` and sets `fatal` on the result, which is what fails the build here.
 * That mirrors babel-plugin-react-compiler's behaviour on the Metro/Jest side.
 */

import remapping from '@jridgewell/remapping';
import path from 'node:path';
import {transform} from 'oxc-transform-react';

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

        const result = await transform(resourcePath, source, {
            lang,
            jsx: options.jsx,
            reactCompiler: options.reactCompiler,
            sourcemap: sourceMaps,
        });

        const fatalErrors = (result.errors || []).filter((e) => e.severity === 'Error');

        if (result.fatal || fatalErrors.length > 0) {
            const msg = fatalErrors.map((e) => `${e.message}${e.codeframe ? `\n${e.codeframe}` : ''}`).join('\n\n');
            callback(new Error(`Oxc transform errors:\n${msg}`));
            return;
        }

        for (const e of result.errors || []) {
            this.emitWarning(new Error(`oxc-react-compiler-loader: ${e.message}`));
        }

        if (sourceMaps && result.map) {
            // oxc-transform-react has no equivalent of Babel's `inputSourceMap` option, so a map from an
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
