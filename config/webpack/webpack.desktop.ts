/* eslint-disable @typescript-eslint/naming-convention */
import path from 'path';
import type {Configuration} from 'webpack';
import webpack from 'webpack';
// eslint-disable-next-line @dword-design/import-alias/prefer-alias, import/no-relative-packages -- alias imports don't work for webpack
import {dependencies as desktopDependencies} from '../../desktop/package.json';
import type {WebpackConfig} from './types';
import getCommonConfig from './webpack.common';
import type {EnvFile} from './webpack.dev';

/**
 * Desktop creates 2 configurations in parallel
 * 1. electron-main - the core that serves the app content
 * 2. web - the app content that would be rendered in electron
 * Everything is placed in desktop/dist and ready for packaging
 */
const getConfig = (env: EnvFile = {}): WebpackConfig[] => {
    const rendererConfig = getCommonConfig({...env, platform: 'desktop'});
    const outputPath = path.resolve(__dirname, '../../desktop/dist');

    rendererConfig.name = 'renderer';
    (rendererConfig.output ??= {}).path = path.join(outputPath, 'www');

    // Expose react-native-config to desktop-main
    const definePlugin = rendererConfig.plugins?.find((plugin) => plugin?.constructor === webpack.DefinePlugin);

    const mainProcessConfig: Configuration = {
        mode: 'production',
        name: 'desktop-main',
        target: 'electron-main',
        entry: {
            main: './desktop/main.ts',
            contextBridge: './desktop/contextBridge.ts',
        },
        output: {
            filename: '[name].js',
            path: outputPath,
            libraryTarget: 'commonjs2',
        },
        resolve: rendererConfig.resolve,
        plugins: [definePlugin],
        externals: [...Object.keys(desktopDependencies), 'fsevents'],
        node: {
            /**
             * Disables webpack processing of __dirname and __filename, so it works like in node
             * https://github.com/webpack/webpack/issues/2010
             */
            __dirname: false,
            __filename: false,
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/,
                },
            ],
        },
    };

    return [mainProcessConfig, rendererConfig];
};

export default getConfig;
