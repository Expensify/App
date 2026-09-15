/**
 * The React Compiler options OXC compiles with, in one place: Re.Pack native, Rsbuild web, the Jest
 * transform and the react-compiler checker. Each used to spell out its own. The native build ended up
 * without two of them, so components carrying `react-hooks` suppressions shipped with no memoization
 * while the web build and the checker memoized the same files.
 */
const BaseReactCompilerConfig = require('./reactCompilerConfig');

/**
 * `eslintSuppressionRules: []` matches the Babel/Metro lane. Without it OXC treats a `react-hooks`
 * suppression as an opt-out of compilation. `isDev` is absent because OXC has no such option, so
 * passing it changes nothing.
 *
 * Overrides are limited to `sources` (web compiles node_modules too) and `panicThreshold` (the checker
 * needs diagnostics). Two lanes differing any other way is a bug.
 *
 * @param {Record<string, unknown>} [overrides] applied last
 * @returns {Record<string, unknown>}
 */
function oxcReactCompilerConfig(overrides = {}) {
    return {
        ...BaseReactCompilerConfig,
        eslintSuppressionRules: [],
        panicThreshold: 'none',
        ...overrides,
    };
}

module.exports = oxcReactCompilerConfig;
