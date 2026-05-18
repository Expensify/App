/** Native stub — focus return is web-only. No-ops so native doesn't bundle the web orchestrator. */

function setupNavigationFocusReturn(): void {}
function teardownNavigationFocusReturn(): void {}
/* eslint-disable @typescript-eslint/no-unused-vars */
function notifyPushParamsForward(_routeKey: string, _prevParams: unknown): void {}
function notifyPushParamsBackward(_routeKey: string, _targetParams: unknown): void {}
/* eslint-enable @typescript-eslint/no-unused-vars */
function cancelPendingFocusRestore(): void {}
// Web-only guard; native has no DOM activeElement, so AUTO never needs to skip.
function shouldSkipAutoFocusDueToExistingFocus(): boolean {
    return false;
}

export {setupNavigationFocusReturn, teardownNavigationFocusReturn, notifyPushParamsForward, notifyPushParamsBackward, cancelPendingFocusRestore, shouldSkipAutoFocusDueToExistingFocus};
