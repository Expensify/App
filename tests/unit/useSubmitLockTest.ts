import {act, renderHook} from '@testing-library/react-native';

import useSubmitLock from '@pages/iou/request/step/confirmation/submission/useSubmitLock';

describe('useSubmitLock', () => {
    it('locks the first submission and marks the expense confirmed', () => {
        // Given a confirmation that hasn't been submitted yet
        const {result} = renderHook(() => useSubmitLock());

        // When the first submission takes the lock
        let didLock = false;
        act(() => {
            didLock = result.current.lockSubmission();
        });

        // Then it goes through, and the confirm button reads as confirmed so it can't be pressed again
        expect(didLock).toBe(true);
        expect(result.current.isConfirmed).toBe(true);
        expect(result.current.formHasBeenSubmitted.current).toBe(true);
    });

    it('refuses a second submission while the first still holds the lock', () => {
        // Given a submission that already took the lock, e.g. while the navigator is still moving away
        const {result} = renderHook(() => useSubmitLock());
        act(() => {
            result.current.lockSubmission();
        });

        // When another tap tries to submit
        let didLockAgain = true;
        act(() => {
            didLockAgain = result.current.lockSubmission();
        });

        // Then it is refused, so the expense isn't created twice
        expect(didLockAgain).toBe(false);
        expect(result.current.isConfirmed).toBe(true);
    });

    it('lets the page submit again once a submission that wrote nothing unlocks it', () => {
        // Given a submission that took the lock but returned without writing (e.g. a scan split with no receipt yet)
        const {result} = renderHook(() => useSubmitLock());
        act(() => {
            result.current.lockSubmission();
        });

        // When it hands the page back
        act(() => {
            result.current.unlockSubmission();
        });

        // Then the confirm button is active again and the next tap can submit
        expect(result.current.isConfirmed).toBe(false);
        expect(result.current.formHasBeenSubmitted.current).toBe(false);

        let didLock = false;
        act(() => {
            didLock = result.current.lockSubmission();
        });
        expect(didLock).toBe(true);
    });
});
