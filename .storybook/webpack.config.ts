/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/naming-convention */
import dotenv from 'dotenv';
import {createRequire} from 'module';
import path from 'path';
import {fileURLToPath} from 'url';
import webpack from 'webpack';
import type {Configuration, RuleSetRule} from 'webpack';
// Storybook 10 loads TS files directly and requires .ts extension for ESM imports
// @ts-expect-error -- Can't use .ts extensions without allowImportingTsExtensions in tsconfig
// eslint-disable-next-line import/extensions
import webpackMockPaths from './webpackMockPaths.ts';

const require = createRequire(import.meta.url);
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

type CustomWebpackConfig = {
    resolve: {
        alias: Record<string, string>;
        extensions: string[];
    };
    module: {
        rules: RuleSetRule[];
    };
};

let envFile: string;
switch (process.env.ENV) {
    case 'production':
        envFile = '.env.production';
        break;
    case 'staging':
        envFile = '.env.staging';
        break;
    default:
        envFile = '.env';
}

const env = dotenv.config({path: path.resolve(dirname, `../${envFile}`)});

const webpackConfig = async ({config}: {config: Configuration}) => {
    // Storybook 10 loads TS files directly and requires .ts extension for ESM imports
    // @ts-expect-error -- Can't use .ts extensions without allowImportingTsExtensions in tsconfig
    // eslint-disable-next-line import/extensions
    const {default: customFunction} = await import('../config/webpack/webpack.common.ts');
    const custom = customFunction({file: envFile}) as CustomWebpackConfig;
    if (!config.resolve) {
        config.resolve = {};
    }
    if (!config.plugins) {
        config.plugins = [];
    }
    if (!config.module) {
        config.module = {};
    }

    config.resolve.alias = {
        ...webpackMockPaths,
        ...custom.resolve.alias,
    };

    // We can ignore the "module not installed" warning from lottie-react-native
    // because we are not using the library for JSON format of Lottie animations.
    config.ignoreWarnings = [{module: new RegExp('node_modules/lottie-react-native/lib/module/LottieView/index.web.js')}];

    // Necessary to overwrite the values in the existing DefinePlugin hardcoded to the Config staging values
    const definePluginIndex = config.plugins.findIndex((plugin) => plugin instanceof webpack.DefinePlugin);
    if (definePluginIndex !== -1 && config.plugins.at(definePluginIndex) instanceof webpack.DefinePlugin) {
        const definePlugin = config.plugins.at(definePluginIndex) as webpack.DefinePlugin;
        if (definePlugin.definitions) {
            definePlugin.definitions.__REACT_WEB_CONFIG__ = JSON.stringify(env);
        }
    }
    config.resolve.extensions = custom.resolve.extensions;

    const babelRulesIndex = custom.module.rules.findIndex((rule) => rule.loader === 'babel-loader');
    const babelRule = custom.module.rules.at(babelRulesIndex);
    if (babelRulesIndex !== -1 && babelRule) {
        config.module.rules?.push(babelRule);
    }

    const fileLoaderRule = config.module.rules?.find(
        (rule): rule is RuleSetRule =>
            typeof rule !== 'boolean' && typeof rule !== 'string' && typeof rule !== 'number' && !!rule?.test && rule.test instanceof RegExp && rule.test.test('.svg'),
    );
    if (fileLoaderRule) {
        fileLoaderRule.exclude = /\.svg$/;
    }
    config.module.rules?.push({
        test: /\.svg$/,
        enforce: 'pre',
        loader: require.resolve('@svgr/webpack'),
    });

    config.module.rules?.push({
        test: /pdf\.worker\.min\.mjs$/,
        type: 'asset/source',
    });

    config.plugins.push(
        new webpack.DefinePlugin({
            __DEV__: process.env.NODE_ENV === 'development',
        }),
    );

    config.module.rules?.push({
        test: /\.lottie$/,
        type: 'asset/resource',
    });

    return config;
};

export default webpackConfig;
