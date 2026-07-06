import type {Compiler} from '@rspack/core';

type Options = {
    rel: string;
    as: string;
    fileWhitelist: RegExp[];
};

/**
 * Rspack-compatible replacement for @vue/preload-webpack-plugin.
 *
 * @vue/preload-webpack-plugin's chunk extraction (used for both the `include: 'asyncChunks'`
 * and `include: 'allAssets'` presets configured in rspack.common.ts) reaches into webpack-specific
 * internals — `chunkGroup.getParents()` and `compilation.assetsInfo` — that aren't implemented by
 * Rspack's Chunk/Compilation JS bindings, so both presets throw under Rspack.
 *
 * This app only ever renders a single HTML page with every emitted chunk referenced from it, so
 * all we actually need is "does this asset's filename match the whitelist", which we can get
 * directly from the emitted asset list via the webpack5-compatible `compilation.getAssets()` API.
 */
class RspackPreloadPlugin {
    private readonly options: Options;

    constructor(options: Options) {
        this.options = options;
    }

    apply(compiler: Compiler): void {
        compiler.hooks.compilation.tap(this.constructor.name, (compilation) => {
            // `compiler.rspack` (rather than a top-level `import {rspack} from '@rspack/core'`) is required
            // here: our config files are loaded by `tsx` as a separate module graph from the one the `rspack`
            // CLI uses internally, so a directly-imported `HtmlRspackPlugin` class fails `getCompilationHooks`'s
            // `instanceof Compilation` check against the `compilation` instance the real compiler passes in.
            const hooks = compiler.rspack.HtmlRspackPlugin.getCompilationHooks(compilation);
            hooks.alterAssetTags.tap(this.constructor.name, (htmlPluginData) => {
                const {rel, as, fileWhitelist} = this.options;
                const publicPath = compilation.outputOptions.publicPath;
                const resolvedPublicPath = typeof publicPath === 'string' && publicPath !== 'auto' ? publicPath : '';

                // Typed off `htmlPluginData.assetTags.styles` (rather than importing `JsHtmlPluginTag` from
                // `@rspack/binding` directly) since `@rspack/binding` is only a transitive dependency of
                // `@rspack/core`, not one we depend on directly.
                const links: typeof htmlPluginData.assetTags.styles = [...compilation.getAssets()]
                    .map((asset) => asset.name)
                    .filter((name) => !name.endsWith('.map'))
                    .filter((name) => fileWhitelist.some((regex) => regex.test(name)))
                    .sort()
                    .map((file) => ({
                        tagName: 'link',
                        voidTag: true,
                        // Fonts must be requested in CORS mode or the browser won't reuse the preloaded
                        // resource, matching @vue/preload-webpack-plugin's `as === 'font'` behavior.
                        attributes: as === 'font' ? {href: `${resolvedPublicPath}${file}`, rel, as, crossorigin: ''} : {href: `${resolvedPublicPath}${file}`, rel, as},
                    }));

                // eslint-disable-next-line no-param-reassign
                htmlPluginData.assetTags.styles = [...links, ...htmlPluginData.assetTags.styles];
                return htmlPluginData;
            });
        });
    }
}

export default RspackPreloadPlugin;
