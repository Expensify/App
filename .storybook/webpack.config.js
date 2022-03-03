const _ = require('underscore');
const lodashMerge = require('lodash/merge');
const getCommonConfig = require('../config/webpack/webpack.common');

module.exports = ({config}) => {
    const webConfig = getCommonConfig({envFile: '.env.production'});

    lodashMerge(config.resolve, webConfig.resolve);

    // Insert our custom definitions to the storybook config
    const definePlugin = _.find(webConfig.plugins, plugin => plugin.constructor.name === 'DefinePlugin');
    config.plugins.push(definePlugin);

    const babelRulesIndex = _.findIndex(webConfig.module.rules, rule => rule.loader === 'babel-loader');
    const babelRule = webConfig.module.rules[babelRulesIndex];
    config.module.rules.push(babelRule);

    // Allows loading SVG - more context here https://github.com/storybookjs/storybook/issues/6188
    const fileLoaderRule = _.find(config.module.rules, rule => rule.test && rule.test.test('.svg'));
    fileLoaderRule.exclude = /\.svg$/;
    config.module.rules.push({
        test: /\.svg$/,
        enforce: 'pre',
        loader: require.resolve('@svgr/webpack'),
    });

    return config;
};
