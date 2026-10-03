/**
 * The React Compiler options OXC compiles with, in one place: Re.Pack native, Rsbuild web, the Jest
 * transform and the react-compiler checker. babel.config.js passes the same object to the Babel compiler
 * for Jest coverage runs. Each used to spell out its own. The native build ended up
 * without two of them, so components carrying `react-hooks` suppressions shipped with no memoization
 * while the web build and the checker memoized the same files.
 */
/**
 * `eslintSuppressionRules: []` keeps a `react-hooks` suppression from opting the file out of
 * compilation, which OXC otherwise does. `isDev` is absent because OXC has no such option, so
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
        target: '19',
        environment: {
            enableTreatRefLikeIdentifiersAsRefs: true,
        },
        eslintSuppressionRules: [],
        panicThreshold: 'none',
        ...overrides,
    };
}

module.exports = oxcReactCompilerConfig;
