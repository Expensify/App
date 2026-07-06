import type {RsbuildConfig} from '@rsbuild/core';

/* eslint-disable no-param-reassign */
import {mergeRsbuildConfig} from '@rsbuild/core';
import {pluginBabel} from '@rsbuild/plugin-babel';
import {pluginSvgr} from '@rsbuild/plugin-svgr';
import path from 'path';
import {fileURLToPath} from 'url';

// Storybook 10 loads TS files directly and requires .ts extension for ESM imports
// @ts-expect-error -- Can't use .ts extensions without allowImportingTsExtensions in tsconfig
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

const rsbuildFinal = async (config: RsbuildConfig): Promise<RsbuildConfig> => {
    // Storybook 10 loads TS files directly and requires .ts extension for ESM imports
    // @ts-expect-error -- Can't use .ts extensions without allowImportingTsExtensions in tsconfig
    const {default: customFunction, getDefineValues, sharedAssetRules} = await import('../config/rspack/rspack.common.ts');
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
            // Reuse the same __DEV__/__REACT_WEB_CONFIG__/__GIT_BRANCH__ values the main app build
            // defines for this env file, so Storybook doesn't drift from what the app actually ships.
            define: getDefineValues(envFile),
        },
        tools: {
            rspack: (rspackConfig) => {
                // Reuse the main app build's ignoreWarnings (e.g. the lottie-react-native
                // "module not installed" warning we don't hit since we don't use its JSON format).
                rspackConfig.ignoreWarnings = [...(rspackConfig.ignoreWarnings ?? []), ...(custom.ignoreWarnings ?? [])];
                // See rspack.common.ts for why __filename/__dirname are explicitly mocked (avoids a
                // "Module parse warning" from canvaskit-wasm/expo that fails Storybook's `--smoke-test`).
                rspackConfig.node = custom.node;
                rspackConfig.resolve ??= {};
                rspackConfig.resolve.fallback = custom.resolve?.fallback;
                rspackConfig.module ??= {rules: []};
                rspackConfig.module.rules ??= [];
                rspackConfig.module.rules.push(...sharedAssetRules);
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
