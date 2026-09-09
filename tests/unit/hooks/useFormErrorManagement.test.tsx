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
    iouMerchant: 'Coffee',
    iouCategory: '',
    iouAttendees: [],
    policy: undefined,
    policyTags: undefined,
    policyCategories: undefined,
    currentUserPersonalDetails: {accountID: 1} as CurrentUserPersonalDetails,
    isEditingSplitBill: false,
    isPolicyExpenseChat: false,
    isScanRequest: false,
    shouldShowMerchant: true,
    hasSmartScanFailed: false,
    didConfirmSplit: false,
    routeError: undefined,
    isTypeSplit: false,
    shouldShowReadOnlySplits: false,
    isNewManualExpenseFlowEnabled: false,
    isDistanceRequest: false,
    shouldShowDate: false,
    isReadOnly: false,
};

// A manual draft the user never typed a merchant into: `initMoneyRequest` seeds it with the "Expense" placeholder.
const placeholderMerchantTransaction = createMock<OnyxTypes.Transaction>({
    transactionID: 'txn1',
    amount: 100,
    merchant: CONST.TRANSACTION.DEFAULT_MERCHANT,
    isMerchantSet: false,
    comment: {},
});

const placeholderMerchantParams: Partial<Params> = {
    transaction: placeholderMerchantTransaction,
    iouMerchant: CONST.TRANSACTION.DEFAULT_MERCHANT,
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

    it('isMerchantRequired is true only for policyExpenseChat with non-scan request and shouldShowMerchant', () => {
        const {result: required} = renderHook(() => useFormErrorManagement({...baseParams, isPolicyExpenseChat: true, isScanRequest: false, shouldShowMerchant: true}), {wrapper: Wrapper});
        const {result: notRequired} = renderHook(
            () => useFormErrorManagement({...baseParams, isPolicyExpenseChat: true, isScanRequest: true, shouldShowMerchant: true, isEditingSplitBill: false}),
            {wrapper: Wrapper},
        );
        expect(required.current.isMerchantRequired).toBe(true);
        expect(notRequired.current.isMerchantRequired).toBe(false);
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

    it('errorMessage returns routeError when present', () => {
        const {result} = renderHook(() => useFormErrorManagement({...baseParams, routeError: 'route.error.unreachable'}), {wrapper: Wrapper});
        expect(result.current.errorMessage).toBe('route.error.unreachable');
    });

    it('errorMessage returns undefined for violations.missingAttendees on non-split flows', async () => {
        const {result} = renderHook(() => useFormErrorManagement(baseParams), {wrapper: Wrapper});
        act(() => result.current.setFormError('violations.missingAttendees'));
        expect(result.current.errorMessage).toBeUndefined();
    });

    it('errorMessage suppresses required/invalid amount errors in the new manual expense flow (surfaced inline)', () => {
        const {result: required} = renderHook(() => useFormErrorManagement({...baseParams, isNewManualExpenseFlowEnabled: true}), {wrapper: Wrapper});
        act(() => required.current.setFormError('common.error.fieldRequired'));
        expect(required.current.errorMessage).toBeUndefined();

        const {result: invalid} = renderHook(() => useFormErrorManagement({...baseParams, isNewManualExpenseFlowEnabled: true}), {wrapper: Wrapper});
        act(() => invalid.current.setFormError('common.error.invalidAmount'));
        expect(invalid.current.errorMessage).toBeUndefined();
    });

    it('errorMessage still shows required/invalid amount errors when the new manual expense flow is disabled', () => {
        const {result} = renderHook(() => useFormErrorManagement({...baseParams, isNewManualExpenseFlowEnabled: false}), {wrapper: Wrapper});
        act(() => result.current.setFormError('common.error.invalidAmount'));
        expect(result.current.errorMessage).toBeDefined();
    });

    const splitParams: Params = {...baseParams, isNewManualExpenseFlowEnabled: true, isTypeSplit: true, shouldShowReadOnlySplits: false};

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

    it('errorMessage still shows the invalid amount error for a distance request in the new manual expense flow (no inline surface)', () => {
        const {result} = renderHook(() => useFormErrorManagement({...baseParams, isNewManualExpenseFlowEnabled: true, isDistanceRequest: true}), {wrapper: Wrapper});
        act(() => result.current.setFormError('common.error.invalidAmount'));
        expect(result.current.errorMessage).toBeDefined();
    });

    it('errorMessage suppresses the invalid merchant error in the new manual expense flow (surfaced inline)', () => {
        const {result} = renderHook(() => useFormErrorManagement({...baseParams, isNewManualExpenseFlowEnabled: true}), {wrapper: Wrapper});
        act(() => result.current.setFormError('iou.error.invalidMerchant'));
        expect(result.current.errorMessage).toBeUndefined();
    });

    it('errorMessage still shows the invalid merchant error when the new manual expense flow is disabled', () => {
        const {result} = renderHook(() => useFormErrorManagement({...baseParams, isNewManualExpenseFlowEnabled: false}), {wrapper: Wrapper});
        act(() => result.current.setFormError('iou.error.invalidMerchant'));
        expect(result.current.errorMessage).toBeDefined();
    });

    it('treats the placeholder merchant of an untouched draft as empty, so it is only invalid while a merchant is required', () => {
        const {result: required} = renderHook(() => useFormErrorManagement({...baseParams, ...placeholderMerchantParams, isPolicyExpenseChat: true}), {wrapper: Wrapper});
        const {result: notRequired} = renderHook(() => useFormErrorManagement({...baseParams, ...placeholderMerchantParams, isPolicyExpenseChat: false}), {wrapper: Wrapper});

        expect(required.current.isMerchantFieldValid).toBe(false);
        expect(notRequired.current.isMerchantFieldValid).toBe(true);
    });

    it('keeps a placeholder merchant the user typed themselves invalid', () => {
        const {result} = renderHook(
            () =>
                useFormErrorManagement({
                    ...baseParams,
                    ...placeholderMerchantParams,
                    transaction: {...placeholderMerchantTransaction, isMerchantSet: true},
                    isPolicyExpenseChat: false,
                }),
            {wrapper: Wrapper},
        );

        expect(result.current.isMerchantFieldValid).toBe(false);
    });

    it('clears the invalid merchant error once the recipient changes from a workspace chat to a user (#96593)', () => {
        // Given an untouched manual draft (still carrying the placeholder merchant) headed for a workspace chat
        const {result, rerender} = renderHook(
            ({isPolicyExpenseChat}: {isPolicyExpenseChat: boolean}) =>
                useFormErrorManagement({...baseParams, ...placeholderMerchantParams, isNewManualExpenseFlowEnabled: true, isPolicyExpenseChat}),
            {wrapper: Wrapper, initialProps: {isPolicyExpenseChat: true}},
        );

        // When confirming surfaces the "please enter a valid merchant" error
        act(() => result.current.setFormError('iou.error.invalidMerchant'));
        expect(result.current.formError).toBe('iou.error.invalidMerchant');

        // Then switching the recipient to a user drops the merchant requirement and clears the error
        rerender({isPolicyExpenseChat: false});
        expect(result.current.formError).toBe('');
    });

    const manualRequiredParams = ({
        isAmountSet,
        created,
        shouldShowDate = true,
        isReadOnly = false,
    }: {
        isAmountSet: boolean;
        created: string;
        shouldShowDate?: boolean;
        isReadOnly?: boolean;
    }): Params => ({
        ...baseParams,
        isNewManualExpenseFlowEnabled: true,
        shouldShowDate,
        isReadOnly,
        transaction: createMock<OnyxTypes.Transaction>({
            transactionID: 'txn1',
            iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
            isAmountSet,
            created,
            comment: {},
        }),
    });

    it('clears the required error once the amount is set when the date field is hidden, so a hidden date cannot strand it', () => {
        // Given a confirmation that doesn't render the date field (a scan flow before its fields show), with no date yet
        const {result, rerender} = renderHook((props: Params) => useFormErrorManagement(props), {
            wrapper: Wrapper,
            initialProps: manualRequiredParams({isAmountSet: false, created: '', shouldShowDate: false}),
        });
        act(() => result.current.setFormError('common.error.fieldRequired'));

        // When the amount is filled, the empty date must not keep the error alive since it has no inline surface
        rerender(manualRequiredParams({isAmountSet: true, created: '', shouldShowDate: false}));
        expect(result.current.formError).toBe('');
    });

    it('clears the required error once the amount is set on a read-only confirmation, where the date is populated server-side', () => {
        const {result, rerender} = renderHook((props: Params) => useFormErrorManagement(props), {
            wrapper: Wrapper,
            initialProps: manualRequiredParams({isAmountSet: false, created: '', isReadOnly: true}),
        });
        act(() => result.current.setFormError('common.error.fieldRequired'));

        rerender(manualRequiredParams({isAmountSet: true, created: '', isReadOnly: true}));
        expect(result.current.formError).toBe('');
    });

    it('keeps the shared required error until both the amount and the date are filled (#96568)', () => {
        // Given a manual expense confirmed with both the amount and the date empty
        const {result, rerender} = renderHook((props: Params) => useFormErrorManagement(props), {
            wrapper: Wrapper,
            initialProps: manualRequiredParams({isAmountSet: false, created: ''}),
        });
        act(() => result.current.setFormError('common.error.fieldRequired'));
        expect(result.current.formError).toBe('common.error.fieldRequired');

        // When only the amount is filled, the shared error must survive so the date keeps showing it inline
        rerender(manualRequiredParams({isAmountSet: true, created: ''}));
        expect(result.current.formError).toBe('common.error.fieldRequired');

        // Then filling the date too clears it, so confirmation is no longer blocked
        rerender(manualRequiredParams({isAmountSet: true, created: '2026-07-29'}));
        expect(result.current.formError).toBe('');
    });
});
