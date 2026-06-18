/**
 * Thin wrapper around oxc-transform that adds React Compiler support while
 * demoting non-fatal React Compiler diagnostics from hard build errors to
 * webpack warnings. This works around oxc-project/oxc#23587 (fixed in a future
 * release), which caused the build to fail instead of bailing out on components
 * that violate the Rules of React — the same behaviour as babel-plugin-react-compiler.
 *
 * Options mirror oxc-loader's TransformOptions plus `reactCompiler`.
 * This loader replaces oxc-loader entirely for Rule A (app source).
 */

const path = require('path');
const {getTsconfig} = require('get-tsconfig');

// Resolve the oxc-transform binary that oxc-loader itself uses (its nested copy)
// so we stay on the same native binary version as oxc-loader.
const oxcTransformPath = require.resolve('oxc-transform', {
    paths: [path.resolve(__dirname, '../../node_modules/oxc-loader')],
});

const {transform} = require(oxcTransformPath);

function extractTsconfigOptions(rootContext) {
    try {
        const tsconfig = getTsconfig(rootContext);
        if (!tsconfig) {
            return {};
        }
        const {compilerOptions} = tsconfig.config;
        if (!compilerOptions) {
            return {};
        }
        const opts = {};
        if (compilerOptions.target) {
            const map = {
                ES2015: 'es2015',
                ES2016: 'es2016',
                ES2017: 'es2017',
                ES2018: 'es2018',
                ES2019: 'es2019',
                ES2020: 'es2020',
                ES2021: 'es2021',
                ES2022: 'es2022',
                ESNEXT: 'esnext',
            };
            const t = map[compilerOptions.target.toUpperCase()];
            if (t) {
                opts.target = t;
            }
        }
        return opts;
    } catch {
        return {};
    }
}

function getLang(ext) {
    if (ext === 'tsx') {
        return 'tsx';
    }
    if (ext === 'jsx') {
        return 'jsx';
    }
    if (ext === 'ts') {
        return 'ts';
    }
    return 'js';
}

module.exports = async function oxcReactCompilerLoader(source) {
    const callback = this.async();
    try {
        const options = this.getOptions() || {};
        const sourceMaps = options.sourcemap !== undefined ? options.sourcemap : !!this.sourceMap;
        const tsconfigOptions = extractTsconfigOptions(this.rootContext);

        const resourcePath = this.resourcePath;
        const ext = path.extname(resourcePath).slice(1);
        const lang = getLang(ext);

        const transformOptions = {
            ...tsconfigOptions,
            lang,
            target: options.target,
            jsx: options.jsx,
            reactCompiler: options.reactCompiler,
            sourcemap: sourceMaps,
            cwd: this.rootContext,
        };

        const result = await transform(resourcePath, source, transformOptions);

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

        if (sourceMaps && result.map) {
            callback(null, result.code, result.map);
        } else {
            callback(null, result.code);
        }
    } catch (err) {
        callback(err);
    }
};
