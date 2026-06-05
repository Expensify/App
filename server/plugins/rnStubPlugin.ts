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
    const reactNativeStub = resolve(stubRoot, 'react-native/index.ts');
    const reactNativeSubpathStub = resolve(stubRoot, 'react-native/subpath.ts');
    const reanimatedStub = resolve(stubRoot, 'react-native-reanimated/index.ts');
    const gestureHandlerStub = resolve(stubRoot, 'react-native-gesture-handler/index.ts');
    const blobUtilStub = resolve(stubRoot, 'react-native-blob-util/index.ts');
    const configStub = resolve(stubRoot, 'react-native-config/index.ts');
    const sentryStub = resolve(stubRoot, 'sentry-react-native/index.ts');
    const nitroFetchStub = resolve(stubRoot, 'react-native-nitro-fetch/index.ts');
    const logStub = resolve(stubRoot, 'expensify-log/index.ts');
    const activeSpansStub = resolve(stubRoot, 'telemetry-activeSpans/index.ts');

    return {
        name: 'victory-chart-renderer-rn-stubs',
        setup(build) {
            build.onResolve({filter: /^@libs\/telemetry\/activeSpans$/}, () => ({
                path: activeSpansStub,
            }));

            build.onResolve({filter: /^@libs\/Log$/}, () => ({
                path: logStub,
            }));

            build.onResolve({filter: /^@sentry\/react-native/}, () => ({
                path: sentryStub,
            }));
            build.onResolve({filter: /^react-native-blob-util$/}, () => ({
                path: blobUtilStub,
            }));

            build.onResolve({filter: /^react-native-config$/}, () => ({
                path: configStub,
            }));
            build.onResolve({filter: /^@react-native-community\/netinfo$/}, () => ({
                path: reactNativeSubpathStub,
            }));

            build.onResolve({filter: /^react-native$/}, () => ({
                path: reactNativeStub,
            }));

            build.onResolve({filter: /^react-native\/.+/}, () => ({
                path: reactNativeSubpathStub,
            }));

            build.onResolve({filter: /^react-native-reanimated$/}, () => ({
                path: reanimatedStub,
            }));

            build.onResolve({filter: /^react-native-gesture-handler$/}, () => ({
                path: gestureHandlerStub,
            }));

            build.onResolve({filter: /^react-native-nitro-fetch$/}, () => ({
                path: nitroFetchStub,
            }));
        },
    };
}
