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

Wait, looking at the code again, the check `if (!path)` should already prevent the crash. Let me re-examine the stack trace and understand what `Cu` refers to in the Sentry error.

Let me check if there's a different code path or if the issue is elsewhere:

<function_calls>
<invoke name="Bash">
<parameter name="command">grep -r "normalizedConfigs" src/libs/Navigation/ --include="*.ts" --include="*.tsx" | head -20</parameter>
</invoke>
</function_calls>

<function_calls>
<invoke name="Read">
<parameter name="path">src/libs/Navigation/linkingConfig/config.ts</parameter>
</invoke>
</function_calls>

<function_calls>
<invoke name="Bash">
<parameter name="command">grep -B 5 -A 20 "normalizedConfigs" src/libs/Navigation/linkingConfig/config.ts</parameter>
</invoke>
</function_calls>

<function_calls>
<invoke name="Bash">
<parameter name="command">grep -n "normalizedConfigs" src/libs/Navigation/linkingConfig/config.ts</parameter>
</invoke>
</function_calls>

<function_calls>
<invoke name="Bash">
<parameter name="command">tail -50 src/libs/Navigation/linkingConfig/config.ts</parameter>
</invoke>
</function_calls>

The issue is that `normalizedConfigs` might have the screen key but with `path: null` or `path: undefined`. The optional chaining `normalizedConfigs[screen]?.path` returns `undefined` if the screen doesn't exist, but if the screen exists with a null/undefined path, it will return that null/undefined value, which then passes the `if (!path)` check... wait, no, `!null` is `true` so it should still catch it.

Let me think about this differently. Maybe the issue is that `normalizedConfigs[screen]` exists but returns an object where `.path` is somehow not being accessed correctly, or there's a race condition. Or perhaps `getUrlWithParams` is being called somewhere else.

Let me search for all usages of `getUrlWithParams`:

<function_calls>
<invoke name="Bash">
<parameter name="command">grep -r "getUrlWithParams" src/ --include="*.ts" --include="*.tsx" | grep -v "import.*getUrlWithParams" | grep -v "export.*getUrlWithParams" | head -20</parameter>
</invoke>
</function_calls>

Looking at the actual implementation and the bug report more carefully - the crash happens on web on the `/onboarding/purpose` screen. Let me check if there's actually an issue with how `path` might be `null` despite the check:

Actually, wait. Looking at the code logic again more carefully:

```typescript
const path = normalizedConfigs[screen]?.path;
if (!path) {
    return undefined;
}

if (backTo) {
    return getUrlWithParams(path, {backTo}) as Route;
}
```

The issue is that `path` could be an empty string `""`. An empty string is falsy in JavaScript, so `if (!path)` would catch it... unless TypeScript's type system allows it through somehow, or the config has changed.

But more likely, looking at the Sentry error mentioning `Cu` (which is likely a minified function name), the issue might actually be in `getUrlWithParams` itself receiving a null value from somewhere else, not from `getOnboardingRouteFromScreen`.

Let me check the full `getUrlWithParams` implementation to see where `.replace()` is called:

<function_calls>
<invoke name="Bash">
<parameter name="command">awk '/^function getUrlWithParams/,/^}$/' src/libs/Url.ts | head -100</parameter>
</invoke>
</function_calls>

<function_calls>
<invoke name="Bash">
<parameter name="command">awk '/^function getUrlWithParams/,/^function [a-zA-Z]/ { if (/^function [a-zA-Z]/ && !/^function getUrlWithParams/) exit; print }' src/libs/Url.ts</parameter>
</invoke>
</function_calls>

Let me try a different approach - read a larger chunk of the file:

<function_calls>
<invoke name="Bash">
<parameter name="command">sed -n '1,300p' src/libs/Url.ts</parameter>
</invoke>
</function_calls>

I can see that `getUrlWithParams` calls `url.replace()`. If `url` parameter is `null` or `undefined`, that would cause the exact error we're seeing.

Now, looking back at `getOnboardingRouteFromScreen`, the real issue is subtle: TypeScript's type checking might allow `path` to be typed as `string | undefined`, and the check `if (!path)` should catch undefined, but perhaps in the minified production code or under certain conditions, `path` is somehow becoming `null` after the check but before being passed to `getUrlWithParams`.

However, the most likely scenario is that `normalizedConfigs[screen]` returns an object where `path` is `null` (not `undefined`), and in JavaScript, `null` is falsy, so `if (!path)` should still catch it. Unless... there's a type coercion issue or the value is something else.

Let me check if `path` could be typed to allow `null`:

<function_calls>
<invoke name="Bash">
<parameter name="command">grep -A 30 "type.*normalizedConfigs" src/libs/Navigation/linkingConfig/config.ts</parameter>
</invoke>
</function_calls>

<function_calls>
<invoke name="Bash">
<parameter name="command">grep -B 5 "normalizedConfigs.*=" src/libs/Navigation/linkingConfig/config.ts</parameter>
</invoke>
</function_calls>

Actually, I think I need to reconsider. The issue states it's happening on the onboarding/purpose route. Let me search for where this screen/route might be calling something with `.replace()` directly:

<function_calls>
<invoke name="Bash">
<parameter name="command">find src/pages -name "*Purpose*" -type f</parameter>
</invoke>
</function_calls>

<function_calls>
<invoke name="Read">
<parameter name="path">src/pages/OnboardingPurpose/index.tsx</parameter>
</invoke>
</function_calls>

<function_calls>
<invoke name="Bash">
<parameter name="command">ls -la src/pages/OnboardingPurpose/</parameter>
</invoke>
</function_calls>

<function_calls>
<invoke name="Read">
<parameter name="path">src/pages/OnboardingPurpose/index.tsx</parameter>
</invoke>
</function_calls>

<function_calls>
<invoke name="Read">
<parameter name="path">src/pages/OnboardingPurpose/BaseOnboardingPurpose.tsx</parameter>
</invoke>
</function_calls>

<function_calls>
<invoke name="Bash">
<parameter name="command">grep -n "\.replace(" src/pages/OnboardingPurpose/*.tsx</parameter>
</invoke>
</function_calls>

<function_calls>
<invoke name="Bash">
<parameter name="command">grep -r "\.replace(" src/pages/OnboardingPurpose/</parameter>
</invoke>
</function_calls>

So the OnboardingPurpose page itself doesn't call `.replace()`. The error must be coming from a library or navigation code that's called when this page loads or navigates.

Given the evidence and that the stack trace shows it's related to navigation on web, and looking at `getUrlWithParams` which does call `.replace()`, the most likely scenario is:

1. Something is calling `getUrlWithParams` with a null/undefined URL
2. This is happening specifically on web when navigating to or from the onboarding purpose screen
3. The `getOnboardingRouteFromScreen` function is the most obvious culprit since it's the only code shown that calls `getUrlWithParams` with a path that comes from a lookup

The safeguard in `getOnboardingRouteFromScreen` should work, but maybe there's an edge case. The safest fix is to add a null check in `getUrlWithParams` itself to handle this defensively:

export default getOnboardingRouteFromScreen;
