import type {OnboardingScreen} from '@libs/getOnboardingStepCounter';
import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';
import {getUrlWithParams} from '@libs/Url';
import type {Route} from '@src/ROUTES';

function getOnboardingRouteFromScreen(screen: OnboardingScreen, backTo?: string): Route | undefined {
    const path = normalizedConfigs[screen]?.path;
    if (!path || typeof path !== 'string') {
        return undefined;
    }

    if (backTo) {
        return getUrlWithParams(path, {backTo}) as Route;
    }

    return path as Route;
}

Wait, the current code already has the check. Let me look more carefully at the stack trace and understand the actual crash location better.

<grep>
<pattern>normalizedConfigs</pattern>
<path>src/libs/Navigation</path>
</grep>

<read_file>
<path>src/libs/Navigation/linkingConfig/config.ts</path>
</read_file>

<search_files>
<path>src/libs/Navigation/linkingConfig</path>
<regex>normalizedConfigs</regex>
</search_files>

Let me check if the issue might be that `normalizedConfigs[screen]?.path` itself could be explicitly `null` rather than `undefined`:

export default getOnboardingRouteFromScreen;
