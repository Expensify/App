import {registerTool} from '@appduct/web';

import registerStateTools from './registerStateTools';

// No __DEV__ guard: @appduct/web resolves to an inert entry outside the `development` condition.
function registerAppductTools() {
    registerStateTools(registerTool);
}

export default registerAppductTools;
