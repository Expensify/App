import {isInternalPopstateInProgress, withInternalPopstate} from '@components/Modal/internalPopstateGuard';

describe('internalPopstateGuard', () => {
    afterEach(() => {
        // Drain any lingering popstate listener so the module-scoped flag is back to false before the next case.
        window.dispatchEvent(new PopStateEvent('popstate'));
    });

    it('reports false by default', () => {
        expect(isInternalPopstateInProgress()).toBe(false);
    });

    it('reports true synchronously after withInternalPopstate is called, before any popstate fires', () => {
        withInternalPopstate(() => {});
        expect(isInternalPopstateInProgress()).toBe(true);
    });

    it('runs the action synchronously', () => {
        const action = jest.fn();
        withInternalPopstate(action);
        expect(action).toHaveBeenCalledTimes(1);
    });

    it('clears the flag after the next popstate event fires', () => {
        withInternalPopstate(() => {});
        expect(isInternalPopstateInProgress()).toBe(true);

        window.dispatchEvent(new PopStateEvent('popstate'));

        expect(isInternalPopstateInProgress()).toBe(false);
    });

    it('detaches its popstate listener after one event (subsequent popstates do not flip the flag)', () => {
        withInternalPopstate(() => {});
        window.dispatchEvent(new PopStateEvent('popstate'));
        expect(isInternalPopstateInProgress()).toBe(false);

        window.dispatchEvent(new PopStateEvent('popstate'));
        expect(isInternalPopstateInProgress()).toBe(false);
    });

    it('a listener registered before withInternalPopstate sees the flag as true during the same popstate', () => {
        let observedDuringEvent: boolean | undefined;
        const popoverListener = () => {
            observedDuringEvent = isInternalPopstateInProgress();
        };
        window.addEventListener('popstate', popoverListener);

        withInternalPopstate(() => {});
        window.dispatchEvent(new PopStateEvent('popstate'));

        expect(observedDuringEvent).toBe(true);
        expect(isInternalPopstateInProgress()).toBe(false);

        window.removeEventListener('popstate', popoverListener);
    });

    it('a listener registered after withInternalPopstate sees the flag already cleared', () => {
        withInternalPopstate(() => {});

        let observedDuringEvent: boolean | undefined;
        const lateListener = () => {
            observedDuringEvent = isInternalPopstateInProgress();
        };
        window.addEventListener('popstate', lateListener);

        window.dispatchEvent(new PopStateEvent('popstate'));

        // Clear listener was registered before lateListener, so by the time lateListener runs the flag is already released.
        expect(observedDuringEvent).toBe(false);

        window.removeEventListener('popstate', lateListener);
    });
});
