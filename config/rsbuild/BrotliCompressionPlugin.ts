import type {Compiler} from '@rspack/core';

import {promisify} from 'util';
import zlib from 'zlib';

const PLUGIN_NAME = 'BrotliCompressionPlugin';

const brotliCompress = promisify(zlib.brotliCompress);

type Options = {
    /** Every emitted asset whose name matches gets a `.br` twin. */
    test: RegExp;
};

/**
 * Rspack plugin that writes a Brotli 11 twin (`foo.js` -> `foo.js.br`) beside every emitted asset matching `test`.
 * Every match gets one, however small or incompressible: the CDN rewrite appends `.br` blindly, so a missing twin is a 404.
 */
class BrotliCompressionPlugin {
    private readonly options: Options;

    constructor(options: Options) {
        this.options = options;
    }

    apply(compiler: Compiler): void {
        const {Compilation, sources} = compiler.rspack;

        // `thisCompilation` skips child compilations, whose assets end up in the parent's anyway.
        compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
            compilation.hooks.processAssets.tapPromise(
                // OPTIMIZE_TRANSFER runs after minification, content hashing, HTML and the service worker are emitted,
                // so the twins are made from the final bytes that will be deployed.
                {name: PLUGIN_NAME, stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER},
                async () => {
                    const assets = compilation.getAssets().filter(({name, info}) => !info.compressed && this.options.test.test(name));

                    // zlib runs each compression on the libuv thread pool, so these proceed in parallel.
                    await Promise.all(
                        assets.map(async ({name, source, info}) => {
                            const compressed = await brotliCompress(source.buffer(), {params: {[zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY}});

                            // `compressed` is the webpack convention that tells other plugins (and this one on a rebuild) not to
                            // compress the twin again. A twin of a content-hashed file is as immutable as its original.
                            compilation.emitAsset(`${name}.br`, new sources.RawSource(compressed), {compressed: true, immutable: info.immutable});
                        }),
                    );
                },
            );
        });
    }
}

export default BrotliCompressionPlugin;
