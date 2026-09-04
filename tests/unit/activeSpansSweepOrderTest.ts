import {cancelAllSpans, cancelSpansByPrefix, getSpan, getUniqueSpanByPrefix, startSpan} from '@libs/telemetry/activeSpans';

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

function getEndOrder() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return (Sentry as unknown as {endOrder: string[]}).endOrder;
}

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

        // Sentry drops a child still running when its parent ends.
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

describe('getUniqueSpanByPrefix', () => {
    it('returns the only span matching the prefix', () => {
        startSpan('ManualSendMessageVisible_1', {name: 'send-message-visible'});
        startSpan('ManualOther_1', {name: 'other'});

        expect(getUniqueSpanByPrefix('ManualSendMessageVisible')).toBe(getSpan('ManualSendMessageVisible_1'));
    });

    it('returns nothing when several spans match, so an ambiguous parent is never picked', () => {
        startSpan('ManualSendMessageVisible_1', {name: 'send-message-visible'});
        startSpan('ManualSendMessageVisible_2', {name: 'send-message-visible'});

        expect(getUniqueSpanByPrefix('ManualSendMessageVisible')).toBeUndefined();
    });

    it('returns nothing when no span matches', () => {
        startSpan('ManualOther_1', {name: 'other'});

        expect(getUniqueSpanByPrefix('ManualSendMessageVisible')).toBeUndefined();
    });
});
