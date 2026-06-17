/*
 * Bun bundler plugin used when bundling the victory-chart-renderer CLI.
 *
 * npm workspaces install victory-native at the App root. Bun would otherwise follow those
 * imports into Flow sources (i.e: react-native code), see malformed code (since Bun only understands TypeScript, not flow), and barf.
 *
 * This plugin stubs imports for react-native and other dependencies that don't work in a headless context with no-op packages under server/stubs/.
 * Stub paths must be absolute.
 */
import type {BunPlugin} from 'bun';
import {resolve} from 'node:path';

export default function createRnStubPlugin(stubRoot: string): BunPlugin {
    return {
        name: 'victory-chart-renderer-rn-stubs',
        setup(build) {
            build.onResolve({filter: /^@libs\/telemetry\/activeSpans$/}, () => ({
                path: resolve(stubRoot, 'telemetry-activeSpans.ts'),
            }));

            build.onResolve({filter: /^@libs\/Log$/}, () => ({
                path: resolve(stubRoot, 'expensify-log.ts'),
            }));

            build.onResolve({filter: /^@sentry\/react-native/}, () => ({
                path: resolve(stubRoot, 'sentry-react-native.ts'),
            }));

            build.onResolve({filter: /^react-native-blob-util$/}, () => ({
                path: resolve(stubRoot, 'react-native-blob-util.ts'),
            }));

            build.onResolve({filter: /^react-native-config$/}, () => ({
                path: resolve(stubRoot, 'react-native-config.ts'),
            }));

            build.onResolve({filter: /^@react-native-community\/netinfo$/}, () => ({
                path: resolve(stubRoot, 'react-native/subpath.ts'),
            }));

            build.onResolve({filter: /^react-native$/}, () => ({
                path: resolve(stubRoot, 'react-native/index.ts'),
            }));

            build.onResolve({filter: /^react-native\/.+/}, () => ({
                path: resolve(stubRoot, 'react-native/subpath.ts'),
            }));

            build.onResolve({filter: /^react-native-reanimated$/}, () => ({
                path: resolve(stubRoot, 'react-native-reanimated.ts'),
            }));

            build.onResolve({filter: /^react-native-gesture-handler$/}, () => ({
                path: resolve(stubRoot, 'react-native-gesture-handler.ts'),
            }));

            build.onResolve({filter: /^react-native-nitro-fetch$/}, () => ({
                path: resolve(stubRoot, 'react-native-nitro-fetch.ts'),
            }));
        },
    };
}
