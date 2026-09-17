/**
 * Shared React Compiler configuration used across:
 * - babel.config.js (build pipeline, extends with `sources` filter)
 * - react-compiler-compliance-check (CI and local checking)
 *
 * ESLint uses oxc-transform-react via config/reactCompiler/checkWithOxc.mjs instead.
 *
 * Intentionally omits `sources` since that's only relevant for the Babel build pipeline.
 */
const ReactCompilerConfig = {
    target: '19',
    environment: {
        enableTreatRefLikeIdentifiersAsRefs: true,
    },
};

module.exports = ReactCompilerConfig;
