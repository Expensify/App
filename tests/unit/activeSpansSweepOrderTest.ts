import {cancelAllSpans, cancelSpansByPrefix, getSpan, startSpan} from '@libs/telemetry/activeSpans';

import * as Sentry from '@sentry/react-native';

jest.mock('@sentry/react-native', () => {
    const endOrder: string[] = [];
    return {
        startInactiveSpan: (options: {name?: string}) => ({
            name: options?.name,
            attributes: {} as Record<string, unknown>,
            setAttribute(key: string, value: unknown) {
                this.attributes[key] = value;
            },
            setAttributes(attrs: Record<string, unknown>) {
                Object.assign(this.attributes, attrs);
            },
            setStatus() {},
            end() {
                endOrder.push(this.name ?? '');
            },
        }),
        spanToJSON: (span: {attributes: Record<string, unknown>}) => ({data: span.attributes}),
        endOrder,
    };
});

/** Names in the order their spans ended, recorded by the mock. */
function getEndOrder() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return (Sentry as unknown as {endOrder: string[]}).endOrder;
}

/**
 * Register a parent and two children the way a phased span family does: the parent first, then the phases
 * that hang off it. Ids share `prefix`, so one prefix sweep covers the whole family.
 */
function startFamily(prefix: string) {
    startSpan(`${prefix}Parent_1`, {name: `${prefix}Parent`});
    startSpan(`${prefix}ChildA_1`, {name: `${prefix}ChildA`});
    startSpan(`${prefix}ChildB_1`, {name: `${prefix}ChildB`});
}

afterEach(() => {
    cancelAllSpans();
    getEndOrder().length = 0;
});

describe('cancelSpansByPrefix', () => {
    it('ends children before their parent', () => {
        startFamily('Manual');

        cancelSpansByPrefix('Manual');

        // Sentry drops children still running when their parent ends, so parent-last is what keeps them reportable.
        expect(getEndOrder()).toEqual(['ManualChildB', 'ManualChildA', 'ManualParent']);
        expect(getSpan('ManualParent_1')).toBeUndefined();
        expect(getSpan('ManualChildA_1')).toBeUndefined();
        expect(getSpan('ManualChildB_1')).toBeUndefined();
    });

    it('leaves spans outside the prefix alone', () => {
        startFamily('Manual');
        startSpan('OtherParent_1', {name: 'OtherParent'});

        cancelSpansByPrefix('Manual');

        expect(getEndOrder()).not.toContain('OtherParent');
        expect(getSpan('OtherParent_1')).toBeDefined();
    });
});
