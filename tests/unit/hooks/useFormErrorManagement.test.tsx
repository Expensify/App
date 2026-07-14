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
    transaction: {transactionID: 'txn1', amount: 100, merchant: 'Coffee', comment: {}} as unknown as OnyxTypes.Transaction,
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
                    transaction: {transactionID: 'txn1', amount: 0, merchant: '', comment: {}, receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_FAILED}} as unknown as OnyxTypes.Transaction,
                    transactionReport: {type: CONST.REPORT.TYPE.IOU} as unknown as OnyxTypes.Report,
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

    it('preserves split-validation errors across focus/validation-state changes (like violations)', () => {
        const splitErrors = ['iou.error.invalidSplit', 'iou.error.invalidSplitParticipants', 'iou.error.invalidSplitYourself'] as const;
        for (const splitError of splitErrors) {
            const {result, rerender} = renderHook((props: Params) => useFormErrorManagement(props), {wrapper: Wrapper, initialProps: baseParams});
            act(() => result.current.setFormError(splitError));
            expect(result.current.formError).toBe(splitError);

            // Changing a dependency of the focus-reset effect re-runs it (e.g. returning from the merchant step).
            // Split-validation errors must survive, since only SplitBillController can clear them once the shares are valid.
            rerender({...baseParams, didConfirmSplit: true});
            expect(result.current.formError).toBe(splitError);
        }
    });

    it('clears non-violation, non-split errors across focus/validation-state changes', () => {
        const {result, rerender} = renderHook((props: Params) => useFormErrorManagement(props), {wrapper: Wrapper, initialProps: baseParams});
        act(() => result.current.setFormError('iou.error.invalidCategoryLength'));
        expect(result.current.formError).toBe('iou.error.invalidCategoryLength');

        rerender({...baseParams, didConfirmSplit: true});
        expect(result.current.formError).toBe('');
    });
});
