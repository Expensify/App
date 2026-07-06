import type {RsbuildConfig} from '@rsbuild/core';

/* eslint-disable no-param-reassign */
import {mergeRsbuildConfig} from '@rsbuild/core';
import {pluginBabel} from '@rsbuild/plugin-babel';
import {pluginSvgr} from '@rsbuild/plugin-svgr';
import dotenv from 'dotenv';
import path from 'path';
import {fileURLToPath} from 'url';

// Storybook 10 loads TS files directly and requires .ts extension for ESM imports
// @ts-expect-error -- Can't use .ts extensions without allowImportingTsExtensions in tsconfig
// eslint-disable-next-line import/extensions
import mockPaths from './mockPaths.ts';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

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

const rsbuildFinal = async (config: RsbuildConfig): Promise<RsbuildConfig> => {
    // Storybook 10 loads TS files directly and requires .ts extension for ESM imports
    // @ts-expect-error -- Can't use .ts extensions without allowImportingTsExtensions in tsconfig
    // eslint-disable-next-line import/extensions
    const {default: customFunction} = await import('../config/rspack/rspack.common.ts');
    const custom = customFunction({file: envFile});

    // Reuse the exact babel-loader rule (including its RN-package-aware exclude regex) from the
    // main app's Rspack config, so Storybook transpiles the same way the web build does.
    const babelRule = custom.module?.rules?.find(
        (rule): rule is {loader: string; test?: RegExp; exclude?: RegExp[]} => typeof rule === 'object' && rule !== null && 'loader' in rule && rule.loader === 'babel-loader',
    );
    // Rspack's `ResolveAlias` type allows `false` for the whole map (meaning "no aliases"), which object
    // spread can't handle, so narrow it to the entries form (structurally identical to Rsbuild's `Alias` type).
    const rspackAlias = custom.resolve?.alias;
    const aliasEntries = rspackAlias && typeof rspackAlias === 'object' ? rspackAlias : {};

    return mergeRsbuildConfig(config, {
        resolve: {
            alias: {
                ...mockPaths,
                ...aliasEntries,
            },
            extensions: custom.resolve?.extensions,
        },
        source: {
            /* eslint-disable @typescript-eslint/naming-convention */
            define: {
                __DEV__: process.env.NODE_ENV === 'development',
                __REACT_WEB_CONFIG__: JSON.stringify(env),
            },
            /* eslint-enable @typescript-eslint/naming-convention */
        },
        tools: {
            rspack: (rspackConfig) => {
                rspackConfig.ignoreWarnings = [
                    ...(rspackConfig.ignoreWarnings ?? []),
                    // We can ignore the "module not installed" warning from lottie-react-native
                    // because we are not using the library for JSON format of Lottie animations.
                    /node_modules\/lottie-react-native\/lib\/module\/LottieView\/index\.web\.js/,
                ];
                // See rspack.common.ts for why __filename/__dirname are explicitly mocked (avoids a
                // "Module parse warning" from canvaskit-wasm/expo that fails Storybook's `--smoke-test`).
                rspackConfig.node = custom.node;
                rspackConfig.resolve ??= {};
                rspackConfig.resolve.fallback = custom.resolve?.fallback;
                rspackConfig.module ??= {rules: []};
                rspackConfig.module.rules ??= [];
                rspackConfig.module.rules.push(
                    // We are importing this worker as a string by using asset/source otherwise it will default to loading via an HTTPS request later.
                    {
                        test: /pdf\.worker\.min\.mjs$/,
                        type: 'asset/source',
                    },
                    {
                        test: /\.lottie$/,
                        type: 'asset/resource',
                    },
                );
            },
        },
        plugins: [
            // Matches the main app's `test: /\.svg$/, exclude: /node_modules/, use: ['@svgr/webpack']` rule:
            // every non-node_modules SVG import resolves to a React component by default.
            pluginSvgr({
                svgrOptions: {exportType: 'default'},
                exclude: /node_modules/,
            }),
            pluginBabel({
                include: babelRule?.test,
                exclude: babelRule?.exclude,
                babelLoaderOptions: {
                    configFile: path.resolve(dirname, '../babel.config.js'),
                    babelrc: false,
                    presets: [],
                    plugins: [],
                },
            }),
        ],
    });
};

export default rsbuildFinal;
