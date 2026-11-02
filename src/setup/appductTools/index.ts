import {registerTool} from '@appduct/react-native';

// The native module is debug-only and a no-op in release; the __DEV__ guard also keeps the tool
// code out of release startup.
import type {RegisterTool} from './types';

import registerStateTools from './registerStateTools';

function registerAppductTools() {
    if (!__DEV__) {
        return;
    }
    // The /auto side effect subscribes the default client to deep links (the
    // link URL arrives via Linking/getInitialURL), so `appduct sessions link
    // --open android` reaches the client. Required, not imported: the import
    // would ship in release bundles, where the native module is a no-op.
    require('@appduct/react-native/auto');
    registerStateTools(registerTool as RegisterTool);
}

export default registerAppductTools;
