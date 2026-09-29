import CONST from '@src/CONST';

let allowedLabels: Set<string> | undefined;

function collectLabels(value: unknown, labels: Set<string>) {
    if (typeof value === 'string') {
        labels.add(value);
        return;
    }
    if (!value || typeof value !== 'object') {
        return;
    }
    for (const nested of Object.values(value)) {
        collectLabels(nested, labels);
    }
}

/**
 * Press labels become metric attributes, so only the static labels defined in CONST.SENTRY_LABEL are kept. Some
 * components build sentryLabel at runtime (e.g. Switch reuses its accessibility label, which can contain tag or
 * category names), and those must never leave the device, so every other label is reported as a generic press.
 */
function sanitizePressLabel(label: string | undefined): string {
    if (!label) {
        return CONST.TELEMETRY.FRAME_DROPS.INTERACTION_UNLABELED_PRESS;
    }
    if (!allowedLabels) {
        allowedLabels = new Set<string>();
        collectLabels(CONST.SENTRY_LABEL, allowedLabels);
    }
    return allowedLabels.has(label) ? label : CONST.TELEMETRY.FRAME_DROPS.INTERACTION_UNLABELED_PRESS;
}

export default sanitizePressLabel;
