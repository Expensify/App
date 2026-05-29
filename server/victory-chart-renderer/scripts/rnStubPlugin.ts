import type {BunPlugin} from 'bun';
import {resolve} from 'node:path';

export default function createRnStubPlugin(stubRoot: string): BunPlugin {
    const reactNativeStub = resolve(stubRoot, 'react-native/index.ts');
    const reactNativeSubpathStub = resolve(stubRoot, 'react-native/subpath.ts');
    const reanimatedStub = resolve(stubRoot, 'react-native-reanimated/index.ts');
    const gestureHandlerStub = resolve(stubRoot, 'react-native-gesture-handler/index.ts');

    return {
        name: 'victory-chart-renderer-rn-stubs',
        setup(build) {
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
        },
    };
}
