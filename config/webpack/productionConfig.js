const webpack = require('webpack');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

/**
 * Get the production webpack configuration, given an environment object.
 *
 * @param {Object} env
 * @returns {Object}
 */
function getProductionConfig(env) {
    return ({
        mode: 'production',
        devtool: 'source-map',
        plugins: [
            // This allows us to interactively inspect JS bundle contents
            ...(process.env.ANALYZE_BUNDLE === 'true' ? [new BundleAnalyzerPlugin()] : []),
            new webpack.DefinePlugin({
                __REACT_WEB_CONFIG__: JSON.stringify(env),

                // React Native JavaScript environment requires the global __DEV__ variable to be accessible.
                // react-native-render-html uses variable to log exclusively during development.
                // See https://reactnative.dev/docs/javascript-environment
                __DEV__: false,
            }),
        ],
    });
}

module.exports = getProductionConfig;
