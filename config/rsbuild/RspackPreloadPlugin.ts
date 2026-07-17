import type {Compilation, Compiler} from '@rspack/core';

type HtmlPluginTagsData = {
    assetTags: {
        styles: unknown[];
        scripts: unknown[];
        meta: unknown[];
    };
};

/**
 * A minimal, structural subset of `HtmlRspackPlugin`'s compilation hooks. Only `alterAssetTags` is
 * used below, so we don't type the rest of `getCompilationHooks`'s return value, or the extra
 * fields (`publicPath`, `outputName`, `plugin`, etc.) its callback's data argument carries: the
 * concrete `HtmlRspackPlugin` classes passed in by callers (see `Options.htmlPlugin`'s doc comment)
 * come from different packages, and neither their unused hooks nor their exact callback data shapes
 * are structurally identical between packages. `callback` is typed as `any` so that any of those
 * concrete classes' more specific `tap` signatures remain assignable to this one.
 */
type HtmlPluginClass = {
    getCompilationHooks: (compilation: Compilation) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        alterAssetTags: {tap: (name: string, callback: any) => void};
    };
};

type Options = {
    rel: string;
    as: string;
    fileWhitelist: RegExp[];
    /**
     * The `HtmlRspackPlugin`-compatible class whose compilation hooks should be tapped.
     *
     * Under raw Rspack, `compiler.rspack.HtmlRspackPlugin` (rather than a top-level
     * `import {rspack} from '@rspack/core'`) is required: config files are loaded by `bun` as a
     * separate module graph from the one the `rspack` CLI uses internally, so a directly-imported
     * `HtmlRspackPlugin` class fails `getCompilationHooks`'s `instanceof Compilation` check against
     * the `compilation` instance the real compiler passes in.
     *
     * Under Rsbuild, neither of those identities is correct: Rsbuild generates HTML using its own
     * vendored `html-rspack-plugin` package, exposed as `HtmlPlugin` in `tools.rspack`'s utils, which
     * is a third, distinct class from both of the above. Callers must pass whichever class their
     * bundler actually instantiates internally.
     */
    htmlPlugin: HtmlPluginClass;
};

/**
 * Rspack-compatible replacement for @vue/preload-webpack-plugin.
 *
 * @vue/preload-webpack-plugin's chunk extraction (used for both the `include: 'asyncChunks'`
 * and `include: 'allAssets'` presets configured in rsbuild.common.ts) reaches into webpack-specific
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
            const hooks = this.options.htmlPlugin.getCompilationHooks(compilation);
            hooks.alterAssetTags.tap(this.constructor.name, (htmlPluginData: HtmlPluginTagsData) => {
                const {rel, as, fileWhitelist} = this.options;
                const publicPath = compilation.outputOptions.publicPath;
                const resolvedPublicPath = typeof publicPath === 'string' && publicPath !== 'auto' ? publicPath : '';

                const links: HtmlPluginTagsData['assetTags']['styles'] = [...compilation.getAssets()]
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
