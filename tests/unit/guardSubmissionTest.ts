import {act, renderHook} from '@testing-library/react-native';

import {getSpan} from '@libs/telemetry/activeSpans';

import type {CreateTransactionParams} from '@pages/iou/request/step/confirmation/submission/types';
import useSubmitLock from '@pages/iou/request/step/confirmation/submission/useSubmitLock';
import guardSubmission from '@pages/iou/request/step/confirmation/submission/utils/guardSubmission';

import CONST from '@src/CONST';

import createMock from '../utils/createMock';

jest.mock('@libs/telemetry/activeSpans', () => ({
    getSpan: jest.fn(),
}));

const PARAMS: CreateTransactionParams = {locationPermissionGranted: false, shouldHandleNavigation: true};

describe('guardSubmission', () => {
    const setAttribute = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(getSpan).mockReturnValue(createMock<NonNullable<ReturnType<typeof getSpan>>>({setAttribute}));
    });

    it('locks the submission and submits with the given params', () => {
        // Given a submission path behind a lock that is free
        const {result: lock} = renderHook(() => useSubmitLock());
        const submit = jest.fn(() => true);

        // When the guarded submit runs
        let didSubmit = false;
        act(() => {
            didSubmit = guardSubmission(lock.current, submit)(PARAMS);
        });

        // Then it tags the submit span, takes the lock, and returns what the path's submit returned
        expect(setAttribute).toHaveBeenCalledWith(CONST.TELEMETRY.ATTRIBUTE_LOCATION_SOURCE, CONST.TELEMETRY.SUBMIT_EXPENSE_LOCATION_SOURCE.NONE);
        expect(lock.current.formHasBeenSubmitted.current).toBe(true);
        expect(lock.current.isConfirmed).toBe(true);
        expect(submit).toHaveBeenCalledWith(PARAMS);
        expect(didSubmit).toBe(true);
    });

    it('stops before taking the lock when a distance rule blocks the submission', () => {
        // Given a workspace distance rule that blocks this expense
        const {result: lock} = renderHook(() => useSubmitLock());
        const submit = jest.fn(() => true);
        const blockDistanceRequestIfNeeded = jest.fn(() => true);

        // When the guarded submit runs
        let didSubmit = true;
        act(() => {
            didSubmit = guardSubmission(lock.current, submit, blockDistanceRequestIfNeeded)(PARAMS);
        });

        // Then nothing is locked or written, so the user can fix the expense and submit again
        expect(blockDistanceRequestIfNeeded).toHaveBeenCalledTimes(1);
        expect(lock.current.formHasBeenSubmitted.current).toBe(false);
        expect(lock.current.isConfirmed).toBe(false);
        expect(submit).not.toHaveBeenCalled();
        expect(didSubmit).toBe(false);
    });

    it('submits when the distance rule lets the expense through', () => {
        // Given a distance check that doesn't block this expense
        const {result: lock} = renderHook(() => useSubmitLock());
        const submit = jest.fn(() => false);
        const blockDistanceRequestIfNeeded = jest.fn(() => false);

        // When the guarded submit runs
        act(() => {
            guardSubmission(lock.current, submit, blockDistanceRequestIfNeeded)(PARAMS);
        });

        // Then the check runs first and the submission goes ahead
        expect(blockDistanceRequestIfNeeded).toHaveBeenCalledTimes(1);
        expect(lock.current.formHasBeenSubmitted.current).toBe(true);
        expect(submit).toHaveBeenCalledWith(PARAMS);
    });

    it('does not submit again while an earlier submission holds the lock', () => {
        // Given a submission that is already in flight
        const {result: lock} = renderHook(() => useSubmitLock());
        const submit = jest.fn(() => true);
        act(() => {
            guardSubmission(lock.current, submit)(PARAMS);
        });
        submit.mockClear();

        // When another tap runs the guarded submit
        let didSubmitAgain = true;
        act(() => {
            didSubmitAgain = guardSubmission(lock.current, submit)(PARAMS);
        });

        // Then the path's submit isn't called, so the expense isn't created twice
        expect(submit).not.toHaveBeenCalled();
        expect(didSubmitAgain).toBe(false);
    });
});
