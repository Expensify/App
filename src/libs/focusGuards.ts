/** Pre-focus guards used by focus-moving systems (auto-focus, initial dialog focus, RETURN restore) to avoid overriding legitimate user focus. */

/** AUTO's async chain can outlive RETURN_HOLD_MS; skip when another element (e.g. a restored RETURN target) already holds focus. */
function shouldSkipAutoFocusDueToExistingFocus(): boolean {
    return typeof document !== 'undefined' && !!document.activeElement && document.activeElement !== document.body;
}

export default shouldSkipAutoFocusDueToExistingFocus;
