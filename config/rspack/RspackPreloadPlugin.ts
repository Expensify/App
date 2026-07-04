import type {Compiler} from '@rspack/core';
import type {HtmlTagObject} from 'html-webpack-plugin';

import HtmlWebpackPlugin from 'html-webpack-plugin';

type Options = {
    rel: string;
    as: string;
    fileWhitelist: RegExp[];
};

/**
 * [POC] Rspack-compatible replacement for @vue/preload-webpack-plugin.
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
            // html-webpack-plugin's types are written against webpack's `Compilation` class, which
            // declares dozens of internal properties (loggers, cache versions, etc.) that Rspack's
            // `Compilation` binding doesn't expose. The `getHooks`/`alterAssetTags` API used below only
            // relies on properties both compilers share (e.g. hooks, compiler), so this is safe at runtime.
            const hooks = HtmlWebpackPlugin.getHooks(compilation as never);
            hooks.alterAssetTags.tap(this.constructor.name, (htmlPluginData) => {
                const {rel, as, fileWhitelist} = this.options;
                const publicPath = compilation.outputOptions.publicPath;
                const resolvedPublicPath = typeof publicPath === 'string' && publicPath !== 'auto' ? publicPath : '';

                const links: HtmlTagObject[] = [...compilation.getAssets()]
                    .map((asset) => asset.name)
                    .filter((name) => !name.endsWith('.map'))
                    .filter((name) => fileWhitelist.some((regex) => regex.test(name)))
                    .sort()
                    .map((file) => ({
                        tagName: 'link',
                        voidTag: true,
                        meta: {},
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
