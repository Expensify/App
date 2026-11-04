// The dynamic imports sit behind __DEV__ so a production web bundle drops them and never evaluates the SDK, the
// tool schemas, or the module-scope Onyx subscriptions in appductState. src/setup/index.ts calls this registrar in
// every build, and the package's `development` export condition alone would keep only the SDK inert while still
// shipping the local tool module.
async function registerAppductTools() {
    if (!__DEV__) {
        return;
    }
    const [{registerTool}, {default: tools}] = await Promise.all([import('@appduct/web'), import('./tools')]);
    for (const tool of tools) {
        registerTool(tool);
    }
}

export default registerAppductTools;
