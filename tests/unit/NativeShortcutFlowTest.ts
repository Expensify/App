import {endNativeShortcutFlow, isNativeShortcutFlowActive, markNativeShortcutFlowIfNeeded} from '@libs/NativeShortcutFlow';

describe('NativeShortcutFlow', () => {
    beforeEach(() => {
        endNativeShortcutFlow();
    });

    describe('markNativeShortcutFlowIfNeeded', () => {
        // Mobile-Expensify's quickActionCallback generates `/create/create/start/1/{randomReportID}/scan|manual|distance-new`
        it.each([
            ['Scan receipt shortcut (app scheme)', 'new-expensify://create/create/start/1/123456789/scan'],
            ['Create expense shortcut (app scheme)', 'new-expensify://create/create/start/1/123456789/manual'],
            ['Track distance shortcut (app scheme)', 'new-expensify://create/create/start/1/123456789/distance-new'],
            ['Scan receipt shortcut (https)', 'https://new.expensify.com/create/create/start/1/123456789/scan'],
            ['shortcut URL with a trailing slash', 'new-expensify://create/create/start/1/123456789/scan/'],
            ['shortcut URL with a query string', 'new-expensify://create/create/start/1/123456789/manual?foo=bar'],
        ])('marks the flow as active for the %s', (_description, url) => {
            markNativeShortcutFlowIfNeeded(url);
            expect(isNativeShortcutFlowActive()).toBe(true);
        });

        it.each([
            ['GPS trip deeplink (sent by the GPS tracking notification, not a shortcut)', 'new-expensify://create/create/start/1/123456789/distance-gps'],
            ['GPS trip deeplink nested under distance-new', 'new-expensify://create/create/start/1/123456789/distance-new/distance-gps'],
            ['report deeplink', 'new-expensify://r/123456789'],
            ['create flow deeplink for a non-shortcut step', 'new-expensify://create/create/amount/1/123456789'],
            ['URL that only partially matches the shortcut path', 'new-expensify://create/start/1/123456789/scan'],
            ['shortcut-like path with an unknown request type', 'new-expensify://create/create/start/1/123456789/per-diem'],
            ['empty string', ''],
        ])('does not mark the flow for the %s', (_description, url) => {
            markNativeShortcutFlowIfNeeded(url);
            expect(isNativeShortcutFlowActive()).toBe(false);
        });

        it('does not mark the flow for a null or undefined URL', () => {
            markNativeShortcutFlowIfNeeded(null);
            expect(isNativeShortcutFlowActive()).toBe(false);

            markNativeShortcutFlowIfNeeded(undefined);
            expect(isNativeShortcutFlowActive()).toBe(false);
        });

        it('keeps the flow active when a non-matching URL arrives after a shortcut URL', () => {
            markNativeShortcutFlowIfNeeded('new-expensify://create/create/start/1/123456789/scan');
            markNativeShortcutFlowIfNeeded('new-expensify://r/123456789');
            expect(isNativeShortcutFlowActive()).toBe(true);
        });
    });

    describe('endNativeShortcutFlow', () => {
        it('clears an active flow', () => {
            markNativeShortcutFlowIfNeeded('new-expensify://create/create/start/1/123456789/scan');
            expect(isNativeShortcutFlowActive()).toBe(true);

            endNativeShortcutFlow();
            expect(isNativeShortcutFlowActive()).toBe(false);
        });

        it('is a no-op when the flow is already inactive', () => {
            endNativeShortcutFlow();
            expect(isNativeShortcutFlowActive()).toBe(false);
        });
    });
});
