import {createCustomEvent} from '@libs/CustomEventUtils';

describe('CustomEventUtils', () => {
    describe('createCustomEvent', () => {
        it('starts with defaultPrevented false', () => {
            const event = createCustomEvent();
            expect(event.isDefaultPrevented()).toBe(false);
        });

        it('flips defaultPrevented to true after preventDefault()', () => {
            const event = createCustomEvent();
            event.preventDefault();
            expect(event.isDefaultPrevented()).toBe(true);
        });

        it('produces independent state across calls', () => {
            const a = createCustomEvent();
            const b = createCustomEvent();
            a.preventDefault();
            expect(a.isDefaultPrevented()).toBe(true);
            expect(b.isDefaultPrevented()).toBe(false);
        });
    });
});
