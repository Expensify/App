import attachInpCategory from '@libs/telemetry/middlewares/attachInpCategory';

import CONST from '@src/CONST';

import type {SpanJSON} from '@sentry/core';

const INP_CATEGORY = CONST.TELEMETRY.ATTRIBUTE_INP_CATEGORY;

function buildSpan(op: string | undefined, description: string | undefined, data: SpanJSON['data'] = {}): SpanJSON {
    // eslint-disable-next-line @typescript-eslint/naming-convention -- Sentry protocol field names
    return {span_id: 'a', trace_id: 'b', start_timestamp: 0, timestamp: 1, op, description, data};
}

describe('attachInpCategory', () => {
    it('sets the category to the area and action of a 3-part label', () => {
        // Given an INP span whose target carries an <Area>-<Action>-<Detail> label
        const span = buildSpan('ui.interaction.click', '[data-sentry-label="Search-ActionCellAction-Submit"]', {existing: 'keep'});

        // When the span goes through the middleware
        const result = attachInpCategory(span);

        // Then the detail is dropped so all actions of the same kind group together, and existing data is kept
        expect(result.data).toEqual({existing: 'keep', [INP_CATEGORY]: 'Search-ActionCellAction'});
    });

    it('reads the label out of a CSS selector instead of splitting the raw description', () => {
        // Given a label prepended to a CSS path, whose class names and tags contain hyphens too
        const span = buildSpan('ui.interaction.press', '[data-sentry-label="Report-Header-Back"] div.css-view-1 > span#target-text');

        // When the span goes through the middleware
        const result = attachInpCategory(span);

        // Then only the label is used to build the category
        expect(result.data[INP_CATEGORY]).toBe('Report-Header');
    });

    it('uses the label closest to the interaction target when the selector has several', () => {
        // Given a selector listing a labelled ancestor before the labelled element that handled the interaction
        const span = buildSpan('ui.interaction.click', 'div > [data-sentry-label="Search-Row-Open"] > [data-sentry-label="Search-ActionCellAction-Pay"] > span');

        // When the span goes through the middleware
        const result = attachInpCategory(span);

        // Then the category comes from the innermost label, which Sentry's selector lists last
        expect(result.data[INP_CATEGORY]).toBe('Search-ActionCellAction');
    });

    it('leaves a span with a 2-part label without a category', () => {
        // Given an INP span with a label that has no detail part
        const span = buildSpan('ui.interaction.click', '[data-sentry-label="Search-ActionCellAction"]');

        // When the span goes through the middleware
        const result = attachInpCategory(span);

        // Then no category is set, because the label is already the most general group
        expect(result).toBe(span);
        expect(result.data).not.toHaveProperty(INP_CATEGORY);
    });

    it('leaves a span with an empty label part without a category', () => {
        // Given a label with three parts where one of them is empty
        const span = buildSpan('ui.interaction.click', '[data-sentry-label="Search--Submit"]');

        // When the span goes through the middleware
        const result = attachInpCategory(span);

        // Then no category is set, because the label does not follow the naming schema
        expect(result).toBe(span);
    });

    it('leaves a span without a label untouched', () => {
        // Given an INP span on an unlabelled element, described by the plain CSS path
        const span = buildSpan('ui.interaction.click', 'body > div.button-row > span#target');

        // When the span goes through the middleware
        const result = attachInpCategory(span);

        // Then the span is passed through unchanged
        expect(result).toBe(span);
    });

    it('leaves a span without a description untouched', () => {
        // Given an INP span without a description
        const span = buildSpan('ui.interaction.click', undefined);

        // When the span goes through the middleware
        const result = attachInpCategory(span);

        // Then the span is passed through unchanged
        expect(result).toBe(span);
    });

    it('leaves a span that is not an interaction untouched', () => {
        // Given a non-INP span whose description happens to contain a 3-part label
        const span = buildSpan('ui.action.click', '[data-sentry-label="Search-ActionCellAction-Submit"]');

        // When the span goes through the middleware
        const result = attachInpCategory(span);

        // Then no category is set, because only INP spans are grouped on the dashboard
        expect(result).toBe(span);
    });

    it('leaves a span without an op untouched', () => {
        // Given a span without an op
        const span = buildSpan(undefined, '[data-sentry-label="Search-ActionCellAction-Submit"]');

        // When the span goes through the middleware
        const result = attachInpCategory(span);

        // Then the span is passed through unchanged
        expect(result).toBe(span);
    });
});
