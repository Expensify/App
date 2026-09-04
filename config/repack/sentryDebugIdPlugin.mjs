import {randomUUID} from 'node:crypto';

/**
 * Stamps a Sentry Debug ID into the bundle and its sourcemap, the way Metro does through
 * `createSentryMetroSerializer`. Without it `@sentry/react-native`'s upload scripts find no
 * `debugId` and Sentry cannot match a JS stack trace to its sourcemap.
 *
 * `@sentry/webpack-plugin` cannot do this here: it injects through a `BannerPlugin` whose
 * hardcoded `include` only matches `.js`-like names, and Re.Pack emits `index.bundle`. It also
 * writes `debugId` only into the copy it uploads, never into the artifact on disk, which is what
 * the React Native scripts read.
 */
const PLUGIN_NAME = 'SentryDebugIdPlugin';

/** Mirrors the snippet `@sentry/bundler-plugin-core` injects, so the SDK reports the id at runtime. */
function debugIdSnippet(debugId) {
    return `;{try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};var n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="${debugId}",e._sentryDebugIdIdentifier="sentry-dbid-${debugId}")}catch(e){}}\n`;
}

class SentryDebugIdPlugin {
    apply(compiler) {
        const {BannerPlugin, Compilation, sources} = compiler.webpack;
        const debugIdsByChunk = new Map();

        new BannerPlugin({
            raw: true,
            include: /\.bundle$/,
            banner: ({chunk}) => {
                const name = chunk?.name ?? chunk?.id?.toString() ?? 'main';
                let debugId = debugIdsByChunk.get(name);
                if (!debugId) {
                    debugId = randomUUID();
                    debugIdsByChunk.set(name, debugId);
                }
                return debugIdSnippet(debugId);
            },
        }).apply(compiler);

        compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
            // Sourcemaps are emitted by the devtool stage, so stamp them after that runs.
            compilation.hooks.processAssets.tap({name: PLUGIN_NAME, stage: Compilation.PROCESS_ASSETS_STAGE_REPORT}, (assets) => {
                for (const chunk of compilation.chunks) {
                    const name = chunk.name ?? chunk.id?.toString() ?? 'main';
                    const debugId = debugIdsByChunk.get(name);
                    if (!debugId) {
                        continue;
                    }
                    for (const file of chunk.auxiliaryFiles) {
                        if (!file.endsWith('.map') || !assets[file]) {
                            continue;
                        }
                        let map;
                        try {
                            map = JSON.parse(assets[file].source().toString());
                        } catch {
                            compilation.warnings.push(new Error(`${PLUGIN_NAME}: could not parse ${file}, skipping Debug ID`));
                            continue;
                        }
                        map.debugId = debugId;
                        map.debug_id = debugId;
                        compilation.updateAsset(file, new sources.RawSource(JSON.stringify(map)));
                    }
                }
            });
        });
    }
}

export default SentryDebugIdPlugin;
