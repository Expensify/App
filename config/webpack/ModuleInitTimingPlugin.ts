/* eslint-disable max-classes-per-file */
import type {Chunk, Compiler} from 'webpack';
import webpack from 'webpack';

const PLUGIN_NAME = 'ModuleInitTimingPlugin';

/**
 * RuntimeModule that pushes a timing interceptor onto __webpack_require__.i.
 * Runs at STAGE_ATTACH (after webpack's own STAGE_BASIC init of __webpack_require__.i),
 * so __webpack_require__.i is already defined when this code executes.
 */
class ModuleTimingRuntimeModule extends webpack.RuntimeModule {
    constructor() {
        super('module init timing', webpack.RuntimeModule.STAGE_ATTACH);
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    override generate(): string {
        return `
// Web module init timing — consumed by src/setup/telemetry/index.web.ts.
if (typeof self !== 'undefined' && !self.__moduleInitTimes) {
    self.__moduleInitTimes = Object.create(null);
    ${webpack.RuntimeGlobals.interceptModuleExecution}.push(function(options) {
        var factory = options.factory;
        options.factory = function(module, exports, require) {
            var t = performance.now();
            factory.call(this, module, exports, require);
            self.__moduleInitTimes[String(options.id)] = performance.now() - t;
        };
    });
}`;
    }
}

/**
 * Webpack plugin that times each module factory and populates self.__moduleInitTimes
 * (moduleId → ms). In development builds, moduleId is the relative file path;
 * in production it is a deterministic numeric ID.
 *
 * Uses webpack 5's official interceptModuleExecution mechanism — no post-processing
 * of compiled assets needed.
 */
class ModuleInitTimingPlugin {
    apply(compiler: Compiler): void {
        compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
            // Ensure webpack generates the __webpack_require__.i interception
            // mechanism for every chunk that has a runtime.
            compilation.hooks.additionalTreeRuntimeRequirements.tap(PLUGIN_NAME, (_chunk: Chunk, set: Set<string>) => {
                set.add(webpack.RuntimeGlobals.interceptModuleExecution);
            });

            // Once webpack has processed that requirement, inject our RuntimeModule.
            compilation.hooks.runtimeRequirementInTree.for(webpack.RuntimeGlobals.interceptModuleExecution).tap(PLUGIN_NAME, (chunk: Chunk) => {
                compilation.addRuntimeModule(chunk, new ModuleTimingRuntimeModule());
            });
        });
    }
}

export default ModuleInitTimingPlugin;
