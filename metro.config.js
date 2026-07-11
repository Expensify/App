const {getDefaultConfig: getExpoDefaultConfig} = require('expo/metro-config');
const {getDefaultConfig: getReactNativeDefaultConfig} = require('@react-native/metro-config');

const {mergeConfig} = require('@react-native/metro-config');
const {wrapWithReanimatedMetroConfig} = require('react-native-reanimated/metro-config');
const {withFacetpack} = require('@ecrindigital/facetpack');
const {withSentryConfig} = require('@sentry/react-native/metro');
const {createSentryMetroSerializer} = require('@sentry/react-native/dist/js/tools/sentryMetroSerializer');

const path = require('path');

const {wrapTransformResultMaps} = require('@expo/metro-config/build/serializer/packedMap');
const Bundler = require('metro/private/Bundler').default;

// Expo SDK 56's transformer emits packed per-module source maps stock metro-source-map can't
// read ("Unexpected module with full source map found"); unpack them here as Expo's CLI does.
function patchMetroForExpoPackedSourceMaps() {
    // Rock never exposes a Bundler instance, so we patch the shared prototype; the flag stops
    // repeated config evaluation from stacking wrappers.
    if (Bundler.prototype.__expoPackedSourceMapsPatched) {
        return;
    }
    const originalTransformFile = Bundler.prototype.transformFile;
    Bundler.prototype.transformFile = async function transformFile(...args) {
        return wrapTransformResultMaps(await originalTransformFile.apply(this, args));
    };
    Bundler.prototype.__expoPackedSourceMapsPatched = true;
}

patchMetroForExpoPackedSourceMaps();

// Prefer explicit ENVFILE (Fastlane/GHA set this), else fall back to local .env
const envPath = process.env.ENVFILE ? (path.isAbsolute(process.env.ENVFILE) ? process.env.ENVFILE : path.join(__dirname, process.env.ENVFILE)) : path.join(__dirname, '.env');
require('dotenv').config({path: envPath});

// Expo SDK 56 replaces global fetch with expo/fetch on native, which breaks large API responses (e.g. OpenApp).
// Keep React Native's built-in fetch unless explicitly overridden.
process.env.EXPO_PUBLIC_USE_RN_FETCH = process.env.EXPO_PUBLIC_USE_RN_FETCH ?? '1';

const defaultConfig = getReactNativeDefaultConfig(__dirname);
const expoConfig = getExpoDefaultConfig(__dirname);

const isDev = process.env.ENVIRONMENT === undefined || process.env.ENVIRONMENT === 'development';

/** Mirrors babel.config.js module-resolver aliases so Facet's OXC transformer can resolve imports. */
const MODULE_ALIASES = {
    '@assets': './assets',
    '@components': './src/components',
    '@hooks': './src/hooks',
    '@libs': './src/libs',
    '@navigation': './src/libs/Navigation',
    '@pages': './src/pages',
    '@prompts': './prompts',
    '@styles': './src/styles',
    '@src': './src',
    '@userActions': './src/libs/actions',
    '@github': './.github',
    '@selectors': './src/selectors',
};

function resolveWithDefaultResolver(context, moduleName, platform) {
    return context.resolveRequest({...context, resolveRequest: undefined}, moduleName, platform);
}

function resolveAliasedPath(context, moduleName, platform) {
    for (const [alias, aliasPath] of Object.entries(MODULE_ALIASES)) {
        if (moduleName === alias || moduleName.startsWith(`${alias}/`)) {
            const rawSubpath = moduleName === alias ? '' : moduleName.slice(alias.length + 1);
            const subpath = rawSubpath.replace(/^\/+/, '');
            const absolutePath = path.resolve(__dirname, aliasPath, subpath);
            const fromOrigin = path.relative(path.dirname(context.originModulePath), absolutePath);
            const relativeRequest = fromOrigin.startsWith('.') ? fromOrigin : `./${fromOrigin}`;

            return resolveWithDefaultResolver(context, relativeRequest.replace(/\\/g, '/'), platform);
        }
    }

    return null;
}

function resolveModuleAlias(context, moduleName, platform) {
    const aliasedResolution = resolveAliasedPath(context, moduleName, platform);
    if (aliasedResolution) {
        return aliasedResolution;
    }

    return resolveWithDefaultResolver(context, moduleName, platform);
}

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultGetPolyfills = defaultConfig.serializer?.getPolyfills ?? (() => []);

const config = {
    resolver: {
        assetExts: [...defaultConfig.resolver.assetExts, 'lottie', 'woff', 'woff2', 'ttf', 'otf'],
        sourceExts: [...defaultConfig.resolver.sourceExts, ...defaultConfig.watcher.additionalExts, 'jsx'],
        resolveRequest: resolveModuleAlias,
    },
    // We are merging the default config from Expo and React Native and expo one is overriding the React Native one so inlineRequires is set to false so we want to set it to true
    // for fix cycling dependencies and improve performance of app startup
    transformer: {
        getTransformOptions: async () => ({
            transform: {
                inlineRequires: true,
            },
        }),
    },
    serializer: {
        getPolyfills: (opts) => [...defaultGetPolyfills(opts), path.resolve(__dirname, 'src/setup/moduleInitPolyfill.ts')],
        ...(!isDev ? {customSerializer: createSentryMetroSerializer()} : {}),
    },
};

const mergedConfig = wrapWithReanimatedMetroConfig(mergeConfig(defaultConfig, expoConfig, config));

if (isDev) {
    const facetConfig = withFacetpack(mergedConfig);

    // Facet's resolver breaks Babel-style aliases and Node built-ins. Keep our resolver and only use the OXC transformer.
    module.exports = {
        ...facetConfig,
        resolver: mergedConfig.resolver,
    };
} else {
    module.exports = withSentryConfig(mergedConfig);
}
