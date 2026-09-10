/* eslint-disable @typescript-eslint/naming-convention -- object keys here are file extensions and workspace paths, not identifiers */
import type {KnipConfig, KnipConfiguration} from 'knip';

// Identity compilers for React Native's platform-suffixed files. These are already plain
// TypeScript, so no transform is needed — registering them here only teaches knip's module
// resolver to try `Foo.web.ts`, `Foo.native.tsx`, etc. as fallbacks when a bare `Foo.ts`/`index.ts`
// doesn't exist, the same way TypeScript's `moduleSuffixes` and Metro/rsbuild's platform
// resolution already do. See CONTRIBUTING note in tsconfig.app.native.json / tsconfig.app.web.json.
const identity = (source: string) => source;
const platformCompilers: KnipConfiguration['compilers'] = {
    '.web.ts': identity,
    '.web.tsx': identity,
    '.native.ts': identity,
    '.native.tsx': identity,
    '.ios.ts': identity,
    '.ios.tsx': identity,
    '.android.ts': identity,
    '.android.tsx': identity,
};

const config: KnipConfig = {
    workspaces: {
        '.': {
            entry: [
                'index.js',
                'wdyr.ts',
                'src/App.tsx',
                'src/HybridAppHandler.tsx',
                'scripts/**/*.{js,mjs,ts}',
                'web/proxy.ts',
                'config/rsbuild/**/*.{js,mjs,cjs,ts}',
                '.github/scripts/**/*.ts',
                'tests/tooling/**/*.ts',
                '.github/actions/javascript/**/*.ts',
                'tests/globals.d.ts',
                '.storybook/**/*.{js,ts,tsx}',
                'metro.config.js',
                'config/babel/oxcJestTransformer.js',
                'eslint.changed.config.mjs',
                'react-native.config.js',
                'rock.config.mjs',
                'src/components/HeaderWithBackButtonComposed/index.tsx',
            ],
            project: [
                'src/**/*.{js,jsx,ts,tsx}',
                'tests/**/*.{js,jsx,ts,tsx}',
                '__mocks__/**/*.{js,jsx,ts,tsx}',
                'web/**/*.{js,jsx,ts,tsx}',
                'config/**/*.{js,mjs,ts,tsx}',
                'scripts/**/*.{js,ts}',
                'jest/**/*.{js,ts}',
                '.storybook/**/*.{js,ts,tsx}',
                '.github/actions/javascript/**/*.ts',
            ],
            ignore: ['.github/actions/**/index.js', 'tests/perf-test/**', 'web/snippets/gib.js', 'src/libs/actions/connections/FinancialForce.ts', 'src/setup/telemetry/noopExpoUpdates.ts'],
            eslint: {
                config: ['config/eslint/eslint.config.mjs', 'eslint.changed.config.mjs'],
            },
            rsbuild: {
                config: ['config/rsbuild/rsbuild.config.ts', '.storybook/rsbuild.config.ts'],
            },
            babel: {
                config: ['babel.config.js'],
            },
            jest: {
                config: ['jest.config.js'],
            },
            storybook: {
                config: ['.storybook/main.ts'],
            },
        },
        'server/victory-chart-renderer': {
            entry: ['src/bootstrap.tsx', 'tests/**/*.test.ts'],
            project: ['src/**/*.{ts,tsx}', 'scripts/**/*.ts', 'tests/**/*.{ts,tsx}'],
        },
    },
    ignoreDependencies: [
        '@expensify/react-native-hybrid-app',
        'focus-trap',
        'group-ib-fp',
        'react-native-image-size',
        'react-native-picker-select',
        'react-native-quick-crypto',
        'react-native-quick-base64',
        'lodash',
        '@babel/plugin-proposal-private-methods',
        '@babel/plugin-proposal-private-property-in-object',
        '@babel/plugin-transform-export-namespace-from',
        'babel-plugin-module-resolver',
        'babel-plugin-react-compiler',
        'babel-plugin-transform-remove-console',
        'html-entities',
        '@fullstory/babel-plugin-react-native',
        '@fullstory/babel-plugin-annotate-react',
        'eslint-config-airbnb-typescript',
        'eslint-config-prettier',
        'eslint-plugin-storybook',
        '@dword-design/eslint-plugin-import-alias',
        'bun',
        'shellcheck',
        'patch-package',
        'diff-so-fancy',
        '@babel/plugin-proposal-class-properties',
        // Pre-existing phantom deps (used directly but only present transitively); unrelated to
        // this config's compilers. Listed here rather than `dependencies` to avoid an unrelated
        // package.json/lockfile change.
        'pdfjs-dist',
        'react-pdf',
        'react-freeze',
    ],
    ignoreBinaries: ['metro-symbolicate', 'mkcert', 'openssl'],
    compilers: platformCompilers,
};

export default config;
