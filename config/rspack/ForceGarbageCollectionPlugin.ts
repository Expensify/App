/* eslint-disable no-console */
import type {Compiler} from '@rspack/core';

/**
 * Custom rspack plugin that forces garbage collection every 5 compilations
 * and logs memory usage to help monitor memory consumption during development.
 *
 * Note: Requires Node.js to be started with --expose-gc flag to enable garbage collection.
 */
class ForceGarbageCollectionPlugin {
    private compilationCount = 0;

    apply(compiler: Compiler) {
        if (gc && typeof gc === 'function') {
            compiler.hooks.done.tap(this.constructor.name, () => {
                this.compilationCount++;

                const memUsage = process.memoryUsage();
                const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
                const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);

                console.log(`📊 Compilation #${this.compilationCount} - Heap: ${heapUsedMB}MB/${heapTotalMB}MB`);
                if (this.compilationCount % 5 === 0) {
                    console.log(`🗑️ Forcing garbage collection after ${this.compilationCount} compilations`);
                    gc?.();

                    const memAfterGC = process.memoryUsage();
                    const heapAfterMB = Math.round(memAfterGC.heapUsed / 1024 / 1024);
                    console.log(`✅ Post-GC heap size: ${heapAfterMB}MB (freed ${heapUsedMB - heapAfterMB}MB)`);
                }
            });
        } else {
            console.warn('⚠️ ForceGarbageCollectionPlugin: gc() function not available. Start Node.js with --expose-gc flag to enable garbage collection.');
        }
    }
}

export default ForceGarbageCollectionPlugin;
