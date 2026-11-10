import {act, renderHook} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import useFormErrorManagement from '@components/MoneyRequestConfirmationList/hooks/useFormErrorManagement';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

import type * as ReactNavigationModule from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual<typeof ReactNavigationModule>('@react-navigation/native');
    return {
        ...actual,
        useIsFocused: () => true,
    };
});

type Params = Parameters<typeof useFormErrorManagement>[0];

const baseParams: Params = {
    transaction: createMock<OnyxTypes.Transaction>({transactionID: 'txn1', amount: 100, merchant: 'Coffee', comment: {}}),
    transactionReport: undefined,
    iouCategory: '',
    iouAttendees: [],
    policy: undefined,
    policyTags: undefined,
    policyCategories: undefined,
    currentUserPersonalDetails: {accountID: 1} as CurrentUserPersonalDetails,
    isEditingSplitBill: false,
    hasSmartScanFailed: false,
    didConfirmSplit: false,
    isTypeSplit: false,
    shouldShowReadOnlySplits: false,
    isDistanceRequest: false,
};

function Wrapper({children}: {children: React.ReactNode}) {
    return <LocaleContextProvider>{children}</LocaleContextProvider>;
}

describe('useFormErrorManagement', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
        return waitForBatchedUpdatesWithAct();
    });

    it('shouldDisplayFieldError is false when not editing a split bill', () => {
        const {result} = renderHook(() => useFormErrorManagement(baseParams), {wrapper: Wrapper});
        expect(result.current.shouldDisplayFieldError).toBe(false);
    });

    it('shouldDisplayFieldError is true when editing split bill with smartScan failure and missing fields', () => {
        const {result} = renderHook(
            () =>
                useFormErrorManagement({
                    ...baseParams,
                    isEditingSplitBill: true,
                    hasSmartScanFailed: true,
                    transaction: createMock<OnyxTypes.Transaction>({transactionID: 'txn1', amount: 0, merchant: '', comment: {}, receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_FAILED}}),
                    transactionReport: createMock<OnyxTypes.Report>({type: CONST.REPORT.TYPE.IOU}),
                }),
            {wrapper: Wrapper},
        );
        expect(result.current.shouldDisplayFieldError).toBe(true);
    });

    it('clearFormErrors only clears the error when it matches the provided list', async () => {
        const {result} = renderHook(() => useFormErrorManagement(baseParams), {wrapper: Wrapper});
        act(() => result.current.setFormError('iou.error.invalidMerchant'));
        expect(result.current.formError).toBe('iou.error.invalidMerchant');

        // Non-matching list does not clear
        act(() => result.current.clearFormErrors(['iou.error.invalidCategoryLength']));
        expect(result.current.formError).toBe('iou.error.invalidMerchant');

        // Matching list clears
        act(() => result.current.clearFormErrors(['iou.error.invalidMerchant']));
        expect(result.current.formError).toBe('');
    });

    it('drops the error a confirm set once a later confirm asks for it to be cleared', () => {
        // Given a confirm that was blocked by an empty tax amount
        const {result} = renderHook(() => useFormErrorManagement(baseParams), {wrapper: Wrapper});
        act(() => result.current.setConfirmError('iou.error.invalidAmount'));
        expect(result.current.formError).toBe('iou.error.invalidAmount');

        // When a later confirm is blocked by a field error instead
        act(() => result.current.clearConfirmError());

        // Then the error is dropped, since validation checks it again on the next confirm
        expect(result.current.formError).toBe('');
    });

    it('keeps an error set outside validation when a confirm asks to clear its own', () => {
        // Given a form error the distance rate check raised
        const {result} = renderHook(() => useFormErrorManagement(baseParams), {wrapper: Wrapper});
        act(() => result.current.setFormError('iou.error.invalidRate'));

        // When a confirm blocked by a field error asks to clear its own error
        act(() => result.current.clearConfirmError());

        // Then the distance rate error stays, since validation doesn't check it again and it still has to block confirming
        expect(result.current.formError).toBe('iou.error.invalidRate');
    });

    it('keeps an error that replaced the one a confirm set', () => {
        // Given a confirm blocked by an empty tax amount, after which the distance rate check raised its own error
        const {result} = renderHook(() => useFormErrorManagement(baseParams), {wrapper: Wrapper});
        act(() => result.current.setConfirmError('iou.error.invalidAmount'));
        act(() => result.current.setFormError('iou.error.invalidRate'));

        // When a confirm blocked by a field error asks to clear its own error
        act(() => result.current.clearConfirmError());

        // Then the distance rate error stays, since it is no longer the one the confirm set
        expect(result.current.formError).toBe('iou.error.invalidRate');
    });

    it('errorMessage returns undefined for violations.missingAttendees on non-split flows', async () => {
        const {result} = renderHook(() => useFormErrorManagement(baseParams), {wrapper: Wrapper});
        act(() => result.current.setFormError('violations.missingAttendees'));
        expect(result.current.errorMessage).toBeUndefined();
    });

    it('errorMessage leaves out the invalid amount error the amount input already shows', () => {
        // Given an edited split, whose amount input flags an invalid amount through the form error as the user types
        const {result} = renderHook(() => useFormErrorManagement(baseParams), {wrapper: Wrapper});

        // When that error is set
        act(() => result.current.setFormError('common.error.invalidAmount'));

        // Then the footer doesn't repeat it under the button
        expect(result.current.errorMessage).toBeUndefined();
    });

    it('errorMessage still shows the invalid amount error for a distance request (no inline surface)', () => {
        const {result} = renderHook(() => useFormErrorManagement({...baseParams, isDistanceRequest: true}), {wrapper: Wrapper});
        act(() => result.current.setFormError('common.error.invalidAmount'));
        expect(result.current.errorMessage).toBeDefined();
    });

    const splitParams: Params = {...baseParams, isTypeSplit: true, shouldShowReadOnlySplits: false};

    it('suppresses the duplicate footer invalid amount error on an editable split (#96565)', () => {
        jest.useFakeTimers();
        try {
            const {result} = renderHook(() => useFormErrorManagement(splitParams), {wrapper: Wrapper});
            act(() => result.current.setFormError('common.error.invalidAmount'));
            act(() => jest.advanceTimersByTime(CONST.TIMING.USE_DEBOUNCED_STATE_DELAY + 1));

            // The debounce has settled, so an undefined message is real suppression rather than lag.
            expect(result.current.debouncedFormError).toBe('common.error.invalidAmount');
            expect(result.current.errorMessage).toBeUndefined();
        } finally {
            jest.useRealTimers();
        }
    });

    it('keeps a corrected split error hidden while the debounce is still holding the old value (#96565)', () => {
        jest.useFakeTimers();
        try {
            const {result} = renderHook(() => useFormErrorManagement(splitParams), {wrapper: Wrapper});

            // Given an editable split that failed confirmation with an invalid amount
            act(() => result.current.setFormError('common.error.invalidAmount'));
            act(() => jest.advanceTimersByTime(CONST.TIMING.USE_DEBOUNCED_STATE_DELAY + 1));
            expect(result.current.errorMessage).toBeUndefined();

            // When the user types a valid amount, clearing the live error while the debounced one still lags
            act(() => result.current.setFormError(''));
            expect(result.current.formError).toBe('');
            expect(result.current.debouncedFormError).toBe('common.error.invalidAmount');

            // Then the footer error must not pop back in for the length of the debounce
            expect(result.current.errorMessage).toBeUndefined();
            act(() => jest.advanceTimersByTime(CONST.TIMING.USE_DEBOUNCED_STATE_DELAY + 1));
            expect(result.current.errorMessage).toBeUndefined();
        } finally {
            jest.useRealTimers();
        }
    });

    it('still shows footer errors that have no inline surface on an editable split', () => {
        jest.useFakeTimers();
        try {
            const {result} = renderHook(() => useFormErrorManagement(splitParams), {wrapper: Wrapper});
            act(() => result.current.setFormError('iou.error.noParticipantSelected'));
            act(() => jest.advanceTimersByTime(CONST.TIMING.USE_DEBOUNCED_STATE_DELAY + 1));

            expect(result.current.errorMessage).toBeDefined();
        } finally {
            jest.useRealTimers();
        }
    });
});
