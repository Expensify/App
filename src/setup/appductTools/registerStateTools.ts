import type {RegisterTool} from './types';

// Shared tool registration, platform-neutral: each entry (index.web.ts on web,
// index.ts on native) passes its own SDK's registerTool. The contract for these
// tools is defined by the CI caller and mirrored in each tool's description.
//
// Dev builds only: @appduct/web resolves to an inert entry outside the
// `development` export condition on web, and the native entries guard on
// __DEV__ (the native module itself is debug-only per @appduct/react-native's
// build.gradle).
import registerCompleteOnboardingTool from './completeOnboardingTool';
import registerGetStateTool from './getStateTool';
import registerSignInTool from './signInTool';

function registerStateTools(registerTool: RegisterTool) {
    registerGetStateTool(registerTool);
    registerSignInTool(registerTool);
    registerCompleteOnboardingTool(registerTool);
}

export default registerStateTools;
