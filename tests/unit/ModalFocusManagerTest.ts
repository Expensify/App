import {acquireBackgroundInputFocusSuppression, getShouldSuppressBackgroundInputFocus, subscribeToShouldSuppressBackgroundInputFocus} from '@libs/ModalFocusManager';

describe('ModalFocusManager', () => {
    it('keeps focus suppressed until every owner releases it', () => {
        const listener = jest.fn();
        const unsubscribe = subscribeToShouldSuppressBackgroundInputFocus(listener);
        const releaseFirstOwner = acquireBackgroundInputFocusSuppression();
        const releaseSecondOwner = acquireBackgroundInputFocusSuppression();

        expect(getShouldSuppressBackgroundInputFocus()).toBe(true);
        expect(listener).toHaveBeenCalledTimes(1);

        releaseFirstOwner();
        expect(getShouldSuppressBackgroundInputFocus()).toBe(true);
        expect(listener).toHaveBeenCalledTimes(1);

        releaseSecondOwner();
        expect(getShouldSuppressBackgroundInputFocus()).toBe(false);
        expect(listener).toHaveBeenCalledTimes(2);

        releaseSecondOwner();
        expect(getShouldSuppressBackgroundInputFocus()).toBe(false);
        expect(listener).toHaveBeenCalledTimes(2);
        unsubscribe();
    });
});
