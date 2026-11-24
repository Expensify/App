import {act, renderHook} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import useFormErrorManagement from '@components/MoneyRequestConfirmationList/hooks/useFormErrorManagement';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

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
    policy: undefined,
    policyTags: undefined,
    policyCategories: undefined,
    isEditingSplitBill: false,
    hasSmartScanFailed: false,
    didConfirmSplit: false,
    routeError: undefined,
    isTypeSplit: false,
    shouldShowReadOnlySplits: false,
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
        // Given a confirm that was blocked by a category the workspace turned off
        const {result} = renderHook(() => useFormErrorManagement(baseParams), {wrapper: Wrapper});
        act(() => result.current.setConfirmError('violations.categoryOutOfPolicy'));
        expect(result.current.formError).toBe('violations.categoryOutOfPolicy');

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
        // Given a confirm blocked by a category the workspace turned off, after which the distance rate check raised its own error
        const {result} = renderHook(() => useFormErrorManagement(baseParams), {wrapper: Wrapper});
        act(() => result.current.setConfirmError('violations.categoryOutOfPolicy'));
        act(() => result.current.setFormError('iou.error.invalidRate'));

        // When a confirm blocked by a field error asks to clear its own error
        act(() => result.current.clearConfirmError());

        // Then the distance rate error stays, since it is no longer the one the confirm set
        expect(result.current.formError).toBe('iou.error.invalidRate');
    });

    it('errorMessage returns routeError when present', () => {
        const {result} = renderHook(() => useFormErrorManagement({...baseParams, routeError: 'route.error.unreachable'}), {wrapper: Wrapper});
        expect(result.current.errorMessage).toBe('route.error.unreachable');
    });

    it('errorMessage shows the form error, since the errors a field shows on itself never reach it', () => {
        // Given a distance amount too large to submit, which has no input to show it on
        const {result} = renderHook(() => useFormErrorManagement(baseParams), {wrapper: Wrapper});

        // When the form error is set
        act(() => result.current.setFormError('iou.error.distanceAmountTooLarge'));

        // Then the footer shows it under the button
        expect(result.current.errorMessage).toBeDefined();
    });

    const splitParams: Params = {...baseParams, isTypeSplit: true, shouldShowReadOnlySplits: false};

    it('shows the footer errors of an editable split once the debounce settles', () => {
        jest.useFakeTimers();
        try {
            // Given an editable split, whose footer reads the debounced form error
            const {result} = renderHook(() => useFormErrorManagement(splitParams), {wrapper: Wrapper});

            // When a form error is set and the debounce delay passes
            act(() => result.current.setFormError('iou.error.noParticipantSelected'));
            act(() => jest.advanceTimersByTime(CONST.TIMING.USE_DEBOUNCED_STATE_DELAY + 1));

            // Then the footer shows it
            expect(result.current.errorMessage).toBeDefined();
        } finally {
            jest.useRealTimers();
        }
    });
});
