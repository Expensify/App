// The dynamic imports sit behind __DEV__, the same gate as the native module's release no-op, so a release bundle
// drops them and never evaluates the tool module or the module-scope Onyx subscriptions in appductState.
// /auto subscribes the default client to deep links and must load before registerTool.
async function registerAppductTools() {
    if (!__DEV__) {
        return;
    }
    await import('@appduct/react-native/auto');
    const [{registerTool}, {default: tools}] = await Promise.all([import('@appduct/react-native'), import('./tools')]);
    for (const tool of tools) {
        registerTool(tool);
    }
}

export default registerAppductTools;
