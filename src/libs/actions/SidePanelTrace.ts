import Log from '@libs/Log';

/**
 * Dev-only structured trace for side panel open/close/visibility diagnostics.
 * Grep logs with `[SidePanelTrace]`.
 */
function traceSidePanel(message: string, data?: Record<string, unknown>) {
    if (!__DEV__) {
        return;
    }

    Log.hmmm(`[SidePanelTrace] ${message}`, data);
}

export default traceSidePanel;
