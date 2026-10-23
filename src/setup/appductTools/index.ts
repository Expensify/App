import {registerTool} from '@appduct/react-native';

// Native entry. The native module ships only in debug builds (the package's
// build.gradle adds `core` to the debug source set and a no-op to release),
// and the JS entry routes registrations to that no-op when the TurboModule is
// absent, so production registers nothing. The __DEV__ guard keeps tool code
// out of release startup work too.
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
