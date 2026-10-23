import {registerTool} from '@appduct/web';

// Web entry. @appduct/web resolves to its inert entry outside the
// `development` export condition, so production bundles register nothing and
// open no connection.
import type {RegisterTool} from './types';

import registerStateTools from './registerStateTools';

function registerAppductTools() {
    registerStateTools(registerTool as RegisterTool);
}

export default registerAppductTools;
