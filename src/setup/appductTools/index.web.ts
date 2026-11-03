import {registerTool} from '@appduct/web';

import tools from './tools';

// No __DEV__ guard: @appduct/web resolves to an inert entry outside the `development` condition.
function registerAppductTools() {
    for (const tool of tools) {
        registerTool(tool);
    }
}

export default registerAppductTools;
