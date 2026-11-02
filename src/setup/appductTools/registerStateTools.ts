import type {RegisterTool} from './types';

import registerCompleteOnboardingTool from './completeOnboardingTool';
import registerGetStateTool from './getStateTool';
import registerSignInTool from './signInTool';

function registerStateTools(registerTool: RegisterTool) {
    registerGetStateTool(registerTool);
    registerSignInTool(registerTool);
    registerCompleteOnboardingTool(registerTool);
}

export default registerStateTools;
