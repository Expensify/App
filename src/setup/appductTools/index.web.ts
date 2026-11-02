import {registerTool} from '@appduct/web';

// No __DEV__ guard: @appduct/web resolves to an inert entry outside the `development` condition.
import type {RegisterTool} from './types';

import registerStateTools from './registerStateTools';

function registerAppductTools() {
    registerStateTools(registerTool as RegisterTool);
}

export default registerAppductTools;
