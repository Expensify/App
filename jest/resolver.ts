// Since Reanimated 4.6 its shared files are split into `.native`/`.web` variants and Jest resolves the `.native` ones,
// which call native-only APIs at import time (e.g. `setCSSEventHandler`) and crash every suite that imports Reanimated.
// Reanimated's resolver maps those files to their web variants (and chains the Worklets resolver), but replacing the
// jest-expo preset's React Native resolver would break mocking `react-native/*` subpaths, so this chains both.
//
// Jest `require`s this file untransformed, so Node strips the types and loads it as an ES module: Jest reads the `sync`
// export, and both resolvers are untyped CommonJS loaded through `createRequire`.
import {createRequire} from 'node:module';

type ResolverOptions = {
    defaultResolver: SyncResolver;
};

/** The subset of Jest's `SyncResolver` (from `jest-resolve`) that this file relies on. */
type SyncResolver = (path: string, options: ResolverOptions) => string;

const requireResolver: (id: string) => SyncResolver = createRequire(import.meta.url);
const reactNativeResolver = requireResolver('@react-native/jest-preset/jest/resolver');
const reanimatedResolver = requireResolver('react-native-reanimated/jest/resolver');

const resolver: SyncResolver = (request, options) =>
    reanimatedResolver(request, {
        ...options,
        defaultResolver: (path, nextOptions) => reactNativeResolver(path, {...nextOptions, defaultResolver: options.defaultResolver}),
    });

export default resolver;
export {resolver as sync};
