/**
 * Shared React Compiler configuration used across:
 * - babel.config.js (build pipeline, extends with `sources` filter)
 * - eslint-plugin-react-compiler-compat (lint-time analysis)
 * - react-compiler-compliance-check (CI and local checking)
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
