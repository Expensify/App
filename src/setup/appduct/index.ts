import type * as Appduct from '@appduct/react-native';

if (__DEV__) {
    const {addAppductListener, registerTool} = require<typeof Appduct>('@appduct/react-native/auto');
    let hasRegisteredTools = false;

    // The tools and their Onyx subscriptions load only once a session links, not in every dev session.
    addAppductListener('stateChange', ({state}) => {
        if (state !== 'active' || hasRegisteredTools) {
            return;
        }
        hasRegisteredTools = true;
        import('./tools').then(({default: tools}) => {
            for (const tool of tools) {
                registerTool(tool);
            }
        });
    });
}
