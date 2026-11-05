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

/** Whether a span name is one of the static CONST.TELEMETRY names, so it can be reported as a flow. */
function isStaticFlowName(name: string): boolean {
    flowNames ??= buildSet(CONST.TELEMETRY);
    return flowNames.has(name);
}

export {isStaticFlowName, sanitizePressLabel};
