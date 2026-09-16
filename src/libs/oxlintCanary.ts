/**
 * Temporary CI canary. Verifies that a brand-new lint violation fails the lint checks
 * without a matching row in the eslint/oxlint seatbelt baselines.
 *
 * Delete this file once the check is confirmed.
 */
function oxlintCanary(value: number): string {
    if (value === 0) {
        debugger;
    }

    return String(value);
}

export default oxlintCanary;
