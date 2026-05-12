/* eslint-disable no-underscore-dangle */
// ignoring the eslint rule because the metro using __d as build in params
/**
 * Metro polyfill — runs before any module definition (__d call).
 * Wraps __d to time each module's factory execution so we can identify
 * which modules are slowest to initialize at startup.
 *
 * Results are stored in global.__moduleInitTimes (moduleId → ms) and
 * global.__moduleNames (moduleId → file path) and can be read from anywhere
 * in the app after the bundle has executed.
 */

// Cast global once to MetroRuntime (defined in src/types/global.d.ts) so all
// subsequent accesses are fully typed — no `any` needed anywhere in this file.
const runtime = global as unknown as MetroRuntime;

runtime.__moduleInitTimes = {};
runtime.__moduleNames = {};
runtime.__moduleDefCount = 0;

const originalDefine = runtime.__d;
if (typeof originalDefine === 'function') {
    runtime.__d = function (factory, moduleId, deps, moduleName) {
        runtime.__moduleDefCount = (runtime.__moduleDefCount ?? 0) + 1;
        if (typeof moduleName === 'string') {
            runtime.__moduleNames[moduleId] = moduleName;
        }

        function timedFactory(...args: Parameters<MetroModuleFactory>) {
            // nativePerformanceNow is Hermes' high-resolution clock — falls back to Date.now
            const now = runtime.nativePerformanceNow ?? Date.now;
            const start = now();
            factory(...args);
            runtime.__moduleInitTimes[moduleId] = now() - start;
        }

        return originalDefine(timedFactory, moduleId, deps, moduleName);
    };
}
