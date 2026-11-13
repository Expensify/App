// Dev-only Appduct setup, imported before react-native: loads the SDK and registers the tools once a session links.
import type * as Appduct from '@appduct/react-native';

if (__DEV__) {
    // /auto subscribes the client to Appduct deep links; on web it resolves to @appduct/web, which strips #appduct= from the URL as it loads.
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
