import type {RsbuildConfig} from '@rsbuild/core';
import type {DefinePluginOptions, RspackPluginInstance, SwcJsMinimizerRspackPluginOptions} from '@rspack/core';

import {GenerateSW} from '@aaroon/workbox-rspack-plugin';
import {pluginBabel} from '@rsbuild/plugin-babel';
import {pluginSvgr} from '@rsbuild/plugin-svgr';
import {RsdoctorRspackPlugin} from '@rsdoctor/rspack-plugin';
import {rspack} from '@rspack/core';
import {sentryWebpackPlugin} from '@sentry/webpack-plugin';
import {execSync} from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';
import {createRequire} from 'module';
import path from 'path';
import {fileURLToPath} from 'url';

import type Environment from './types.ts';

// @ts-expect-error -- Can't use .ts extensions without allowImportingTsExtensions in tsconfig
import CustomVersionFilePlugin from './CustomVersionFilePlugin.ts';
// @ts-expect-error -- Can't use .ts extensions without allowImportingTsExtensions in tsconfig
import ModuleInitTimingPlugin from './ModuleInitTimingPlugin.ts';
// @ts-expect-error -- Can't use .ts extensions without allowImportingTsExtensions in tsconfig
import RspackPreloadPlugin from './RspackPreloadPlugin.ts';

const require = createRequire(import.meta.url);
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

dotenv.config();

function getCurrentBranchName(): string {
    try {
        return execSync('git rev-parse --abbrev-ref HEAD', {encoding: 'utf-8'}).trim();
    } catch {
        return '';
    }
}

const localBranchName = getCurrentBranchName();

/**
 * These RN packages ship non-transpiled JSX and rely on the "react-native" import (aliased to
 * react-native-web below), so they need to go through the same babel-loader pipeline as our own
 * source rather than being treated as opaque, already-built node_modules.
 */
const includeModules = new RegExp(
    `node_modules/(?!(${[
        'react-native-reanimated',
        'react-native-worklets',
        'react-native-picker-select',
        'react-native-web',
        'react-native-webview',
        '@react-native-picker',
        '@react-navigation/material-top-tabs',
        '@react-navigation/native',
        '@react-navigation/native-stack',
        '@react-navigation/stack',
        'react-native-gesture-handler',
        'react-native-google-places-autocomplete',
        'react-native-qrcode-svg',
        'react-native-view-shot',
        '@react-native/assets',
        'expo',
        'expo-audio',
        'expo-video',
        'expo-image',
        'expo-image-manipulator',
        'expo-modules-core',
        'victory-native',
        '@shopify/react-native-skia',
    ].join('|')})/).*|\\.native\\.(js|jsx|ts|tsx)$`,
);

const environmentToLogoSuffixMap: Record<string, string> = {
    production: '-dark',
    staging: '-stg',
    dev: '-dev',
    adhoc: '-adhoc',
};

function mapEnvironmentToLogoSuffix(environmentFile: string): string {
    let environment = environmentFile.split('.').at(2);
    if (typeof environment === 'undefined') {
        environment = 'dev';
    }
    return environmentToLogoSuffixMap[environment];
}

/**
 * `source.define` values shared between the main app build (below) and Storybook (via
 * `.storybook/rsbuild.config.ts`), so both bundle the same `__DEV__`/`__REACT_WEB_CONFIG__`/
 * `__GIT_BRANCH__` values for a given env file.
 */
function getDefineValues(file: string): DefinePluginOptions {
    const isDevelopmentFile = file === '.env' || file === '.env.development';
    /* eslint-disable @typescript-eslint/naming-convention */
    return {
        process: {env: {}},
        // Define EXPO_OS for web platform to fix expo-modules-core warning
        'process.env.EXPO_OS': JSON.stringify('web'),
        __REACT_WEB_CONFIG__: JSON.stringify(dotenv.config({path: file}).parsed),

        // React Native JavaScript environment requires the global __DEV__ variable to be accessible.
        // react-native-render-html uses variable to log exclusively during development.
        // See https://reactnative.dev/docs/javascript-environment
        __DEV__: /staging|prod|adhoc/.test(file) === false,
        // Expose the current git branch so the debug menu can display it in the browser tab title.
        // Empty string in non-development builds.
        __GIT_BRANCH__: JSON.stringify(isDevelopmentFile ? localBranchName : ''),
    };
    /* eslint-enable @typescript-eslint/naming-convention */
}

/**
 * Config shared between the main app build (below) and Storybook (via
 * `.storybook/rsbuild.config.ts`): source defines, module resolution, and the SVG/babel loader
 * pipeline. Deliberately excludes anything that assumes a single-page `web/index.html` app shell
 * (HTML template, service worker, Sentry release upload, static asset copying), since Storybook
 * manages its own HTML/output and isn't a deployable release of the app.
 */
const getSharedConfiguration = ({file = '.env'}: Environment): RsbuildConfig => {
    /* eslint-disable @typescript-eslint/naming-convention */
    return {
        source: {
            define: getDefineValues(file),
            // Rsbuild already treats images/fonts/pdf as static assets by default; .lottie needs to
            // be added explicitly so it's emitted as a file instead of falling through to the JS pipeline.
            assetsInclude: /\.lottie$/,
        },
        resolve: {
            alias: {
                lodash: 'lodash-es',
                'react-native-config': 'react-web-config',
                'react-native$': 'react-native-web',
                // Use victory-native source files instead of pre-compiled dist (which uses CommonJS exports)
                'victory-native': path.resolve(dirname, '../../node_modules/victory-native/src/index.ts'),
                // Required for @shopify/react-native-skia web support
                'react-native/Libraries/Image/AssetRegistry': false,
                // @sentry/react-native references the optional expo-updates module. We do not install it,
                // so web/Storybook bundles should treat it as unavailable instead of failing resolution.
                'expo-updates': false,
                // Use legacy build of pdfjs-dist to support older browsers
                'pdfjs-dist$': path.resolve(dirname, '../../node_modules/pdfjs-dist/legacy/build/pdf.mjs'),
                '@assets': path.resolve(dirname, '../../assets'),
                '@components': path.resolve(dirname, '../../src/components/'),
                '@hooks': path.resolve(dirname, '../../src/hooks/'),
                '@libs': path.resolve(dirname, '../../src/libs/'),
                '@navigation': path.resolve(dirname, '../../src/libs/Navigation/'),
                '@pages': path.resolve(dirname, '../../src/pages/'),
                '@prompts': path.resolve(dirname, '../../prompts'),
                '@styles': path.resolve(dirname, '../../src/styles/'),
                '@src': path.resolve(dirname, '../../src/'),
                '@userActions': path.resolve(dirname, '../../src/libs/actions/'),
                '@selectors': path.resolve(dirname, '../../src/selectors/'),
            },
            // Resolve web-specific implementations (`.web.*`) before bare files so React Native
            // libraries and our own app-level overrides both pick up their browser variants.
            extensions: ['.web.js', '.js', '.jsx', '.web.ts', '.web.tsx', '.ts', '.tsx'],
        },
        plugins: [
            // Matches the app's SVG import convention: every non-node_modules SVG import resolves to a
            // React component by default.
            pluginSvgr({
                svgrOptions: {exportType: 'default'},
                exclude: /node_modules/,
            }),
            pluginBabel({
                include: /\.(js|ts)x?$/,
                exclude: [includeModules],
                babelLoaderOptions: {
                    configFile: path.resolve(dirname, '../../babel.config.js'),
                    babelrc: false,
                    presets: [],
                    plugins: [],
                },
            }),
        ],
        tools: {
            rspack: (config, {addRules}) => {
                // canvaskit-wasm and expo's getBundleUrl.web.ts reference __filename/__dirname, which don't
                // exist in a browser bundle. Rspack's default ('warn-mock') mocks them to a fixed value but
                // also emits a "Module parse warning" every time; explicitly opting into 'mock' keeps the
                // same fixed-value behavior without the warning. This also matters for Storybook's
                // `--smoke-test`, which fails the build on any warning that isn't explicitly allow-listed.
                // eslint-disable-next-line no-param-reassign
                config.node = {
                    __filename: 'mock',
                    __dirname: 'mock',
                };
                // We can ignore the "module not installed" warning from lottie-react-native because we
                // are not using the library for JSON format of Lottie animations.
                // eslint-disable-next-line no-param-reassign
                config.ignoreWarnings = [...(config.ignoreWarnings ?? []), /lottie-react-native\/lib\/module\/LottieView\/index\.web\.js/];

                // eslint-disable-next-line no-param-reassign
                config.resolve ??= {};
                // eslint-disable-next-line no-param-reassign
                config.resolve.fallback = {
                    'process/browser': require.resolve('process/browser'),
                    crypto: false,
                    fs: false,
                    path: false,
                };

                addRules([
                    // We are importing this worker as a string by using asset/source otherwise it will
                    // default to loading via an HTTPS request later. This causes issues if we have gone
                    // offline before the pdfjs web worker is set up as we won't be able to load it from
                    // the server.
                    {
                        test: new RegExp('node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs'),
                        type: 'asset/source' as const,
                    },
                    {
                        test: /\.lottie$/,
                        type: 'asset/resource' as const,
                    },
                    {
                        test: /\.m?js$/,
                        resolve: {fullySpecified: false},
                    },
                    // Rule for react-native-web-webview
                    {
                        test: /postMock.html$/,
                        type: 'asset',
                        generator: {filename: '[name].[ext]'},
                    },
                    {
                        resourceQuery: /raw/,
                        type: 'asset/source',
                    },
                    // This prevents import error coming from react-native-tab-view/lib/module/TabView.js
                    // where Pager is imported without extension due to having platform-specific implementations
                    {
                        test: /\.js$/,
                        resolve: {fullySpecified: false},
                        include: [path.resolve(dirname, '../../node_modules/react-native-tab-view/lib/module/TabView.js')],
                    },
                ]);

                return config;
            },
        },
    };
    /* eslint-enable @typescript-eslint/naming-convention */
};

/**
 * Get a production grade Rsbuild config for web
 */
const getCommonConfiguration = ({file = '.env', platform = 'web'}: Environment): RsbuildConfig => {
    const isDevelopment = file === '.env' || file === '.env.development';
    const shared = getSharedConfiguration({file, platform});
    const sharedRspackTool = shared.tools?.rspack;

    if (!isDevelopment) {
        const releaseName = `${process.env.npm_package_name}@${process.env.npm_package_version}`;
        console.debug(`[SENTRY ${platform.toUpperCase()}] Release: ${releaseName}`);
        console.debug(`[SENTRY ${platform.toUpperCase()}] Assets Path: ${'./dist/**/*.{js,map}'}`);
    }

    /* eslint-disable @typescript-eslint/naming-convention */
    return {
        ...shared,
        source: {
            ...shared.source,
            entry: {main: './index.js'},
        },
        output: {
            target: 'web',
            distPath: {
                // Flatten every asset type back to the dist root (rather than Rsbuild's default
                // `static/js`, `static/font`, etc. subfolders) to match the layout `web/index.html`,
                // the service worker precache list, and HybridApp's CDN references all expect.
                root: 'dist',
                js: '',
                jsAsync: '',
                css: '',
                cssAsync: '',
                svg: '',
                font: '',
                wasm: '',
                image: '',
                media: '',
                assets: '',
            },
            filename: {
                // Use simple filenames in development to prevent memory leaks from contenthash changes
                js: isDevelopment ? '[name].bundle.js' : '[name]-[contenthash].bundle.js',
                // Rsbuild names HTML output after the entry key (`main.html`) by default; the app,
                // its service worker, and HybridApp's CDN references all expect `index.html`.
                html: 'index.html',
            },
            assetPrefix: '/',
            sourceMap: {
                js: isDevelopment ? 'eval-source-map' : 'source-map',
            },
            cleanDistPath: true,
            copy: [
                {from: 'web/favicon.png'},
                {from: 'web/favicon-unread.png'},
                {from: 'web/og-preview-image.png'},
                {from: 'web/apple-touch-icon.png'},
                {from: 'web/robots.txt'},
                {from: 'assets/images/expensify-app-icon.svg'},
                {from: 'web/manifest.json'},
                {from: 'assets/css', to: 'css'},
                {from: 'assets/fonts/web', to: 'fonts'},
                {from: 'assets/sounds', to: 'sounds'},
                {from: 'assets/pdfs', to: 'pdfs'},
                {from: 'node_modules/react-pdf/dist/Page/AnnotationLayer.css', to: 'css/AnnotationLayer.css'},
                {from: 'node_modules/react-pdf/dist/Page/TextLayer.css', to: 'css/TextLayer.css'},
                {from: '.well-known/apple-app-site-association', to: '.well-known/apple-app-site-association', toType: 'file'},
                {from: '.well-known/assetlinks.json', to: '.well-known/assetlinks.json'},
                // https://github.com/wojtekmaj/react-pdf#copying-cmaps
                {from: 'node_modules/pdfjs-dist/cmaps/', to: 'cmaps/'},
                // Group‑IB web SDK injection file
                {from: 'web/snippets/gib.js', to: 'gib.js'},
                // CanvasKit WASM files for @shopify/react-native-skia web support (uses full version)
                {from: 'node_modules/canvaskit-wasm/bin/full/canvaskit.wasm'},
            ],
        },
        html: {
            template: 'web/index.html',
            templateParameters: {
                splashLogo: fs.readFileSync(path.resolve(dirname, `../../assets/images/new-expensify${mapEnvironmentToLogoSuffix(file)}.svg`), 'utf-8'),
                isWeb: platform === 'web',
                isProduction: file === '.env.production',
                isStaging: file === '.env.staging',
                useThirdPartyScripts: process.env.USE_THIRD_PARTY_SCRIPTS === 'true' || (platform === 'web' && ['.env.production', '.env.staging'].includes(file)),
            },
        },
        performance: {
            // We have to load the whole lottie player to get the player to work in offline mode
            // heic-to library is used sparsely so we load it as a separate chunk to reduce initial bundle size
            // ExpensifyIcons/illustrations chunks are loaded eagerly for offline support
            // Vendor: extract all 3rd party deps (~75% of App) to a separate js file for better caching
            chunkSplit: {
                strategy: 'custom',
                splitChunks: {
                    cacheGroups: {
                        lottiePlayer: {
                            test: /[\\/]node_modules[\\/](@dotlottie\/react-player)[\\/]/,
                            name: 'lottiePlayer',
                            chunks: 'all',
                        },
                        heicTo: {
                            test: /[\\/]node_modules[\\/](heic-to)[\\/]/,
                            name: 'heicTo',
                            chunks: 'all',
                            priority: 10,
                        },
                        expensifyIcons: {
                            test: /[\\/]src[\\/]components[\\/]Icon[\\/]chunks[\\/]expensify-icons\.chunk\.ts$/,
                            name: 'expensifyIcons',
                            chunks: 'all',
                        },
                        illustrations: {
                            test: /[\\/]src[\\/]components[\\/]Icon[\\/]chunks[\\/]illustrations\.chunk\.ts$/,
                            name: 'illustrations',
                            chunks: 'all',
                        },
                        vendor: {
                            test: /[\\/]node_modules[\\/]/,
                            name: 'vendors',
                            chunks: 'initial',
                        },
                    },
                },
            },
        },
        tools: {
            rspack: (config, utils) => {
                // `sharedRspackTool`'s declared return type includes `Promise<void | RspackOptions>` because
                // that's a valid shape for `tools.rspack` in general, but `getSharedConfiguration`'s own
                // callback above never actually returns a Promise. Cast away the Promise branch so callers can
                // keep mutating the result synchronously.
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                const afterShared = (typeof sharedRspackTool === 'function' ? (sharedRspackTool(config, utils) ?? config) : config) as typeof config;
                const {HtmlPlugin} = utils;

                // Preserve the class name for ImageManipulator (expo module), mirroring the TerserPlugin
                // options used previously under webpack. rspack's types only declare `keep_classnames` as a
                // boolean, but the underlying SWC minifier accepts a RegExp too (verified: ImageManipulator's
                // classname survives minification in the output bundle).
                afterShared.optimization = {
                    ...afterShared.optimization,
                    minimizer: [
                        new rspack.SwcJsMinimizerRspackPlugin({
                            minimizerOptions: {
                                compress: {passes: 2},
                                keep_classnames: /ImageManipulator|ImageModule/,
                                mangle: {keep_fnames: true},
                            } as SwcJsMinimizerRspackPluginOptions['minimizerOptions'],
                        }),
                        '...',
                    ],
                };

                afterShared.plugins ??= [];
                afterShared.plugins.push(
                    // Only emit the SW for non-development builds. In dev, the dev-server's HMR
                    // and the SW's caching behavior fight each other and confuse hot reloads.
                    // Remove this guard locally if you want to actually exercise the SW.
                    ...(isDevelopment
                        ? []
                        : [
                              new GenerateSW({
                                  clientsClaim: true,
                                  skipWaiting: true,
                                  // Cap is generous on purpose: the vendor (~6.5 MiB), main (~5.5 MiB),
                                  // authScreens.prefetch (~6.3 MiB) chunks and canvaskit.wasm (~7.6 MiB) are
                                  // all critical for offline boot, so we precache the lot. Everything in the
                                  // App build is content-hashed, so growth here only costs first-install bytes.
                                  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
                                  // Single-page app: any unmatched navigation should serve the cached app shell.
                                  navigateFallback: '/index.html',
                                  // Don't fall back for asset-like or .well-known requests.
                                  navigateFallbackDenylist: [/^\/_/, /^\/\.well-known/, /\/[^/?]+\.[^/]+$/],
                                  runtimeCaching: [
                                      {
                                          // Same-origin user media (receipts, chat attachments) — cache opportunistically
                                          // so they're viewable on offline refresh. The function below is serialized into
                                          // the generated service worker, so it executes in the SW context where
                                          // `sameOrigin` is the appropriate Workbox match (no need to read `self.location`).
                                          urlPattern: ({sameOrigin, url, request}) => sameOrigin && (request.destination === 'image' || /\/(receipts|chat-attachments)\//.test(url.pathname)),
                                          handler: 'StaleWhileRevalidate',
                                          options: {
                                              cacheName: 'user-media',
                                              expiration: {maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60},
                                          },
                                      },
                                  ],
                              }),
                          ]),
                    // Inject <link rel="prefetch/preload" /> into HTML.
                    // By convention we use ".prefetch" suffix for such chunks.
                    // See RspackPreloadPlugin.ts for why these presets can't use @vue/preload-webpack-plugin directly under Rspack.
                    new RspackPreloadPlugin({
                        rel: 'prefetch',
                        as: 'script',
                        fileWhitelist: [/(.+)\.prefetch(.*)\.js$/],
                        htmlPlugin: HtmlPlugin,
                    }),
                    new RspackPreloadPlugin({
                        rel: 'preload',
                        as: 'font',
                        fileWhitelist: [/^(?!.*seguiemj).*\.(woff2|ttf)$/],
                        htmlPlugin: HtmlPlugin,
                    }),
                    new RspackPreloadPlugin({
                        rel: 'prefetch',
                        as: 'fetch',
                        fileWhitelist: [/\.lottie$/],
                        htmlPlugin: HtmlPlugin,
                    }),
                    new rspack.ProvidePlugin({process: 'process/browser'}),
                    new ModuleInitTimingPlugin(),
                    new rspack.EnvironmentPlugin({JEST_WORKER_ID: ''}),
                    new rspack.IgnorePlugin({
                        resourceRegExp: /^\.\/locale$/,
                        contextRegExp: /moment$/,
                    }),
                    ...(file === '.env.production' || file === '.env.staging'
                        ? [
                              new rspack.IgnorePlugin({
                                  resourceRegExp: /@welldone-software\/why-did-you-render/,
                              }),
                          ]
                        : []),
                    ...(platform === 'web' ? [new CustomVersionFilePlugin()] : []),
                    // Upload source maps to Sentry
                    ...(isDevelopment
                        ? []
                        : ([
                              sentryWebpackPlugin({
                                  authToken: process.env.SENTRY_AUTH_TOKEN as string | undefined,
                                  org: 'expensify',
                                  project: 'app',
                                  release: {
                                      name: `${process.env.npm_package_name}@${process.env.npm_package_version}`,
                                      create: true,
                                      setCommits: {auto: true},
                                  },
                                  sourcemaps: {
                                      assets: './dist/**/*.{js,map}',
                                      filesToDeleteAfterUpload: './dist/**/*.map',
                                  },
                                  debug: false,
                                  telemetry: false,
                              }),
                          ] as RspackPluginInstance[])),
                    // This allows us to interactively inspect JS bundle contents, loader/plugin timings, and duplicate packages
                    ...(process.env.ANALYZE_BUNDLE === 'true' ? [new RsdoctorRspackPlugin()] : []),
                );

                return afterShared;
            },
        },
    };
    /* eslint-enable @typescript-eslint/naming-convention */
};

export default getCommonConfiguration;
export {getDefineValues, getSharedConfiguration, includeModules};
