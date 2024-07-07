/* eslint-disable no-underscore-dangle */

/* eslint-disable no-param-reassign */

/* eslint-disable @typescript-eslint/naming-convention */
import type Environment from 'config/webpack/types';
import dotenv from 'dotenv';
import path from 'path';
import {DefinePlugin} from 'webpack';
import {Configuration, ProvidePlugin, RuleSetRule} from 'webpack';

type CustomWebpackConfig = {
    resolve: {
        alias: Record<string, string>;
        extensions: string[];
        fallback?: Record<string, string | false>;
    };
    module: {
        rules: RuleSetRule[];
    };
    plugins?: (DefinePlugin | ProvidePlugin)[];
};

type CustomWebpackFunction = ({file, platform}: Environment) => CustomWebpackConfig;

type WebpackModule = {
    default: CustomWebpackFunction;
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

const env = dotenv.config({path: path.resolve(__dirname, `../${envFile}`)});
const customFunction = require<WebpackModule>('../config/webpack/webpack.common').default;

const custom: CustomWebpackConfig = customFunction({file: envFile});

const webpackConfig = ({config}: {config: Configuration}) => {
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
        'react-native-config': 'react-web-config',
        'react-native$': 'react-native-web',
        '@react-native-community/netinfo': path.resolve(__dirname, '../__mocks__/@react-native-community/netinfo.ts'),
        '@react-navigation/native': path.resolve(__dirname, '../__mocks__/@react-navigation/native'),
        ...custom.resolve.alias,
    };

    config.resolve.fallback = {
        path: require.resolve('path-browserify'),
        zlib: require.resolve('browserify-zlib'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        net: require.resolve('node-libs-browser/mock/net'),
        tls: require.resolve('node-libs-browser/mock/tls'),
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
        buffer: require.resolve('buffer/'),
        process: require.resolve('process/browser'),
        os: require.resolve('os-browserify/browser'),
        vm: require.resolve('vm-browserify'),
        fs: false,
        child_process: false,
    };

    // We can ignore the "module not installed" warning from lottie-react-native
    // because we are not using the library for JSON format of Lottie animations.
    config.ignoreWarnings = [{module: new RegExp('node_modules/lottie-react-native/lib/module/LottieView/index.web.js')}];

    // Necessary to overwrite the values in the existing DefinePlugin hardcoded to the Config staging values
    const definePluginIndex = config.plugins.findIndex((plugin) => plugin instanceof DefinePlugin);
    if (definePluginIndex !== -1 && config.plugins[definePluginIndex] instanceof DefinePlugin) {
        const definePlugin = config.plugins[definePluginIndex] as DefinePlugin;
        if (definePlugin.definitions) {
            definePlugin.definitions.__REACT_WEB_CONFIG__ = JSON.stringify(env);
        }
    }
    config.resolve.extensions = custom.resolve.extensions;

    const babelRulesIndex = custom.module.rules.findIndex((rule) => rule.loader === 'babel-loader');
    const babelRule = custom.module.rules[babelRulesIndex];
    if (babelRule) {
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

    config.plugins.push(
        new DefinePlugin({
            __DEV__: process.env.NODE_ENV === 'development',
        }),
        new ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new ProvidePlugin({
            process: 'process/browser',
        }),
    );

    return config;
};

export default webpackConfig;
