import path from 'path';
import type {Configuration} from 'webpack';
import webpack from 'webpack';
// eslint-disable-next-line @dword-design/import-alias/prefer-alias, import/no-relative-packages -- alias imports don't work for webpack
import {dependencies as desktopDependencies} from '../../desktop/package.json';
import type Environment from './types';
import getCommonConfiguration from './webpack.common';

/**
 * Desktop creates 2 configurations in parallel
 * 1. electron-main - the core that serves the app content
 * 2. web - the app content that would be rendered in electron
 * Everything is placed in desktop/dist and ready for packaging
 */
const getConfiguration = (environment: Environment): Configuration[] => {
    const rendererConfig = getCommonConfiguration({...environment, platform: 'desktop'});
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
            // eslint-disable-next-line @typescript-eslint/naming-convention
            __dirname: false,
            // eslint-disable-next-line @typescript-eslint/naming-convention
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

export default getConfiguration;
