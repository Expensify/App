/**
 * Lowers ES modules to CommonJS with lazy imports — the equivalent of Metro's `inlineRequires`,
 * which this app relies on to tolerate import cycles (without it the app crashes on boot).
 * Needed as a separate stage because OXC transpiles only and has no CJS lowering.
 * Like babel/swc, only non-relative imports (including `@src`/`@libs` aliases) are deferred.
 */
import {rspack} from '@rspack/core';

export default async function swcLazyImportsLoader(source, inputSourceMap) {
    const callback = this.async();
    try {
        const result = await rspack.experiments.swc.transform(source, {
            filename: this.resourcePath,
            isModule: true,
            env: {
                targets: {node: 24},
                include: ['transform-block-scoping'],
            },
            module: {type: 'commonjs', lazy: true},
            sourceMaps: !!this.sourceMap,
            inputSourceMap: inputSourceMap ? JSON.stringify(inputSourceMap) : undefined,
        });
        callback(null, result.code, result.map);
    } catch (error) {
        callback(error);
    }
}
