import {registerTool} from '@appduct/react-native';

import tools from './tools';

// The native module is debug-only and a no-op in release; the __DEV__ guard also keeps the tool
// code out of release startup.
function registerAppductTools() {
    if (!__DEV__) {
        return;
    }
    // /auto subscribes the default client to deep links. Required, not imported: an import would
    // ship in release bundles.
    require('@appduct/react-native/auto');
    for (const tool of tools) {
        registerTool(tool);
    }
}

export default registerAppductTools;
