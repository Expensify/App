import CONST from '@src/CONST';

import type {TelemetryBeforeSendSpan} from './index';

/**
 * Stamps `inp.category` on web INP spans, so the Sentry INP dashboard can aggregate interactions per group.
 * A `<Area>-<Action>-<Detail>` label such as `Search-ActionCellAction-Submit` gets the `Search-ActionCellAction` category.
 * Labels with any other number of parts are left without a category.
 */

// Sentry creates INP spans with ops like `ui.interaction.click` and `ui.interaction.press`.
const INTERACTION_OP_PREFIX = 'ui.interaction.';

// The span description is the CSS selector of the interaction target, so the label has to be matched out of it rather than split from it.
const SENTRY_LABEL_REGEX = /\[data-sentry-label="([^"]+)"\]/g;

const LABEL_SEPARATOR = '-';
const CATEGORY_LABEL_PARTS = 3;

function getInpCategory(description: string): string | undefined {
    // The selector lists ancestors before the target, so the last label is the one closest to the element the user interacted with.
    const label = Array.from(description.matchAll(SENTRY_LABEL_REGEX)).at(-1)?.at(1);
    if (!label) {
        return undefined;
    }

    const parts = label.split(LABEL_SEPARATOR);
    if (parts.length !== CATEGORY_LABEL_PARTS || parts.some((part) => !part)) {
        return undefined;
    }

    const [area, action] = parts;
    return `${area}${LABEL_SEPARATOR}${action}`;
}

const attachInpCategory: TelemetryBeforeSendSpan = (span) => {
    if (!span.op?.startsWith(INTERACTION_OP_PREFIX) || !span.description) {
        return span;
    }

    const category = getInpCategory(span.description);
    if (!category) {
        return span;
    }

    return {...span, data: {...span.data, [CONST.TELEMETRY.ATTRIBUTE_INP_CATEGORY]: category}};
};

export default attachInpCategory;
