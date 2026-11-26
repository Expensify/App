import CONST from '@src/CONST';

/**
 * Labels become metric attributes, so only values that are defined statically in CONST are ever reported. Anything
 * built at runtime could carry user data (e.g. Switch reuses its accessibility label, which can contain tag or category
 * names) and must never leave the device.
 */

let pressLabels: Set<string> | undefined;
let flowNames: Set<string> | undefined;

function collectStrings(value: unknown, strings: Set<string>) {
    if (typeof value === 'string') {
        strings.add(value);
        return;
    }
    if (!value || typeof value !== 'object') {
        return;
    }
    for (const nested of Object.values(value)) {
        collectStrings(nested, strings);
    }
}

function buildSet(source: unknown): Set<string> {
    const strings = new Set<string>();
    collectStrings(source, strings);
    return strings;
}

/** Keeps static CONST.SENTRY_LABEL values; every other press is reported as a generic press. */
function sanitizePressLabel(label: string | undefined): string {
    if (!label) {
        return CONST.TELEMETRY.FRAME_DROPS.INTERACTION_UNLABELED_PRESS;
    }
    pressLabels ??= buildSet(CONST.SENTRY_LABEL);
    return pressLabels.has(label) ? label : CONST.TELEMETRY.FRAME_DROPS.INTERACTION_UNLABELED_PRESS;
}

/**
 * Whether a span is a user flow frame drops are attributed to. Helper root spans (request phases, locale loading) would
 * otherwise take a running flow's frames.
 */
function isUserFlowName(name: string): boolean {
    flowNames ??= new Set<string>([
        CONST.TELEMETRY.SPAN_OPEN_REPORT,
        CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS,
        CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB,
        CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER,
        CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE,
        CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE,
        CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE,
        CONST.TELEMETRY.SPAN_ENTRY_TO_SCAN,
        CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION,
        CONST.TELEMETRY.SPAN_ODOMETER_TO_CONFIRMATION,
        CONST.TELEMETRY.SPAN_OPEN_CATEGORY_PICKER,
        CONST.TELEMETRY.SPAN_OPEN_MEMBER_CATEGORY_VISIBILITY,
        CONST.TELEMETRY.SPAN_OD_ND_TRANSITION,
        CONST.TELEMETRY.SPAN_OD_ND_TRANSITION_LOGGED_OUT,
        CONST.TELEMETRY.SPAN_SHARE_EXTENSION_OPEN_SUBMIT_FLOW,
    ]);
    return flowNames.has(name);
}

export {isUserFlowName, sanitizePressLabel};
