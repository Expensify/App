import type {OnboardingScreen} from '@libs/getOnboardingStepCounter';
import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';
import {getUrlWithParams} from '@libs/Url';
import type {Route} from '@src/ROUTES';

function getOnboardingRouteFromScreen(screen: OnboardingScreen, backTo?: string): Route | undefined {
    const path = normalizedConfigs[screen]?.path;
    if (!path) {
        return undefined;
    }

    if (backTo) {
        return getUrlWithParams(path, {backTo}) as Route;
    }

    return path as Route;
}

Wait, looking at this code again, the check `if (!path)` should already prevent the issue. Let me investigate further to understand what's actually happening:

<function_calls>
<invoke name="Bash">
<parameter name="command">grep -n "getUrlWithParams" src/libs/Url.ts | head -5</parameter>
</invoke>
</function_calls>
<function_calls>
<invoke name="Bash">
<parameter name="command">sed -n '150,250p' src/libs/Url.ts</parameter>
</invoke>
</function_calls>
<function_calls>
<invoke name="Bash">
<parameter name="command">awk '/function getUrlWithParams/,/^}/' src/libs/Url.ts | head -50</parameter>
</invoke>
</function_calls>
<function_calls>
<invoke name="Bash">
<parameter name="command">grep -A30 "function getUrlWithParams" src/libs/Url.ts</parameter>
</invoke>
</function_calls>

Let me search more specifically for where `.replace` is called in the context of URL building:

<function_calls>
<invoke name="Bash">
<parameter name="command">grep -B10 -A2 "\.replace(" src/libs/Url.ts | head -80</parameter>
</invoke>
</function_calls>

Now I see the issue! In the `getUrlWithParams` function, there's likely a `.replace()` call on a parameter that could be null. Let me check the actual implementation:

<function_calls>
<invoke name="Bash">
<parameter name="command">cat src/libs/Url.ts | grep -A50 "function getUrlWithParams"</parameter>
</invoke>
</function_calls>
<function_calls>
<invoke name="Bash">
<parameter name="command">wc -l src/libs/Url.ts</parameter>
</invoke>
</function_calls>
<function_calls>
<invoke name="Bash">
<parameter name="command">tail -200 src/libs/Url.ts</parameter>
</invoke>
</function_calls>

Let me try to read specific line ranges:

<function_calls>
<invoke name="Bash">
<parameter name="command">sed -n '1,300p' src/libs/Url.ts | tail -150</parameter>
</invoke>
</function_calls>

I can see the code now. The issue is in the `getUrlWithParams` function where it calls `value.replace()` without checking if `value` is null. Looking at line patterns, when the `backTo` parameter value is null, the `.replace()` call fails.

export default getOnboardingRouteFromScreen;
