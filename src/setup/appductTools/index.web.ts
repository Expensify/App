import {registerTool} from '@appduct/web';

import tools from './tools';

// No __DEV__ guard: @appduct/web resolves to an inert entry outside the `development` condition.
function registerAppductTools() {
    tools.forEach((tool) => registerTool(tool));
}

export default registerAppductTools;
