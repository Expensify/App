/* eslint-disable no-underscore-dangle */
/**
 * Metro polyfill — runs before any module definition (__d call).
 * Wraps __d to time each module's factory execution so we can identify
 * which modules are slowest to initialize at startup.
 *
 * Results are stored in global.__moduleInitTimes (moduleId → ms) and
 * global.__moduleNames (moduleId → file path) and can be read from anywhere
 * in the app after the bundle has executed.
 */
global.__moduleInitTimes = {};
global.__moduleNames = {};
global.__moduleDefCount = 0;

const originalDefine = global.__d;
if (typeof originalDefine === 'function') {
    global.__d = function (factory, moduleId, deps, moduleName) {
        global.__moduleDefCount = (global.__moduleDefCount || 0) + 1;
        if (typeof moduleName === 'string') {
            global.__moduleNames[moduleId] = moduleName;
        }

        function timedFactory(g, r, importDefault, importAll, module, exports, dependencyMap) {
            // nativePerformanceNow is Hermes' high-resolution clock — falls back to Date.now
            const now = global.nativePerformanceNow || Date.now;
            const start = now();
            factory(g, r, importDefault, importAll, module, exports, dependencyMap);
            global.__moduleInitTimes[moduleId] = now() - start;
        }

        return originalDefine(timedFactory, moduleId, deps, moduleName);
    };
}
