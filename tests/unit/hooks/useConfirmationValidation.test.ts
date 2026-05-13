import {renderHook} from '@testing-library/react-native';
import useConfirmationValidation from '@components/MoneyRequestConfirmationList/hooks/useConfirmationValidation';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({
        getCurrencyDecimals: () => 2,
    }),
}));

type Params = Parameters<typeof useConfirmationValidation>[0];

const baseParams: Params = {
    transaction: {transactionID: 'txn1', comment: {}, amount: 100} as unknown as OnyxTypes.Transaction,
    transactionReport: undefined,
    transactionID: 'txn1',
    iouType: CONST.IOU.TYPE.SUBMIT,
    iouAmount: 100,
    iouMerchant: 'Coffee Shop',
    iouCategory: '',
    iouCurrencyCode: 'USD',
    iouAttendees: [],
    policy: undefined,
    policyTags: undefined,
    policyTagLists: [],
    policyCategories: undefined,
    selectedParticipants: [{accountID: 1}] as unknown as Participant[],
    currentUserPersonalDetails: {accountID: 1} as CurrentUserPersonalDetails,
    isEditingSplitBill: false,
    isMerchantRequired: false,
    isMerchantEmpty: false,
    shouldDisplayFieldError: false,
    shouldShowTax: false,
    isDistanceRequest: false,
    isDistanceRequestWithPendingRoute: false,
    isPerDiemRequest: false,
    isTimeRequest: false,
    isNewManualExpenseFlowEnabled: false,
    routeError: undefined,
};

describe('useConfirmationValidation', () => {
    it('returns null when routeError is set', () => {
        const {result} = renderHook(() => useConfirmationValidation({...baseParams, routeError: 'route error'}));
        expect(result.current.validate()).toBeNull();
    });

    it('returns null when transactionID is missing', () => {
        const {result} = renderHook(() => useConfirmationValidation({...baseParams, transactionID: undefined}));
        expect(result.current.validate()).toBeNull();
    });

    it('returns noParticipantSelected when participants are empty', () => {
        const {result} = renderHook(() => useConfirmationValidation({...baseParams, selectedParticipants: []}));
        expect(result.current.validate()).toEqual({errorKey: 'iou.error.noParticipantSelected'});
    });

    it('returns invalidMerchant when merchant exceeds max bytes', () => {
        const longMerchant = 'A'.repeat(CONST.MERCHANT_NAME_MAX_BYTES + 1);
        const {result} = renderHook(() => useConfirmationValidation({...baseParams, iouMerchant: longMerchant}));
        expect(result.current.validate()).toEqual({errorKey: 'iou.error.invalidMerchant'});
    });

    it('returns invalidMerchant when merchant is required but empty', () => {
        const {result} = renderHook(() => useConfirmationValidation({...baseParams, isMerchantRequired: true, isMerchantEmpty: true}));
        expect(result.current.validate()).toEqual({errorKey: 'iou.error.invalidMerchant'});
    });

    it('returns invalidCategoryLength when category exceeds max', () => {
        const longCategory = 'C'.repeat(CONST.API_TRANSACTION_CATEGORY_MAX_LENGTH + 1);
        const {result} = renderHook(() => useConfirmationValidation({...baseParams, iouCategory: longCategory}));
        expect(result.current.validate()).toEqual({errorKey: 'iou.error.invalidCategoryLength'});
    });

    it('returns categoryOutOfPolicy when category is disabled', () => {
        const {result} = renderHook(() =>
            useConfirmationValidation({
                ...baseParams,
                iouCategory: 'Travel',
                policyCategories: {Travel: {enabled: false, name: 'Travel'}} as unknown as OnyxTypes.PolicyCategories,
            }),
        );
        expect(result.current.validate()).toEqual({errorKey: 'violations.categoryOutOfPolicy'});
    });

    it('returns invalidSubrateLength for per-diem with no sub-rates', () => {
        const {result} = renderHook(() =>
            useConfirmationValidation({
                ...baseParams,
                isPerDiemRequest: true,
                transaction: {transactionID: 'txn1', amount: 100, comment: {customUnit: {subRates: []}}} as unknown as OnyxTypes.Transaction,
            }),
        );
        expect(result.current.validate()).toEqual({errorKey: 'iou.error.invalidSubrateLength'});
    });

    it('returns distanceAmountTooLarge when distance amount exceeds max', () => {
        const {result} = renderHook(() =>
            useConfirmationValidation({
                ...baseParams,
                isDistanceRequest: true,
                iouAmount: CONST.IOU.MAX_SAFE_AMOUNT + 1,
            }),
        );
        expect(result.current.validate()).toEqual({errorKey: 'iou.error.distanceAmountTooLarge'});
    });

    it('returns invalidAmount for split with zero amount when fields are filled', () => {
        const {result} = renderHook(() =>
            useConfirmationValidation({
                ...baseParams,
                isEditingSplitBill: true,
                iouAmount: 0,
                transaction: {transactionID: 'txn1', amount: 100, merchant: 'Coffee', comment: {}} as unknown as OnyxTypes.Transaction,
                transactionReport: {type: CONST.REPORT.TYPE.IOU} as unknown as OnyxTypes.Report,
            }),
        );
        expect(result.current.validate()).toEqual({errorKey: 'iou.error.invalidAmount'});
    });

    it('returns errorKey: null on successful non-PAY validation', () => {
        const {result} = renderHook(() => useConfirmationValidation(baseParams));
        expect(result.current.validate()).toEqual({errorKey: null});
    });

    it('returns null for PAY type without payment method', () => {
        const {result} = renderHook(() => useConfirmationValidation({...baseParams, iouType: CONST.IOU.TYPE.PAY}));
        expect(result.current.validate()).toBeNull();
    });

    it('returns errorKey: null for PAY type with payment method', () => {
        const {result} = renderHook(() => useConfirmationValidation({...baseParams, iouType: CONST.IOU.TYPE.PAY}));
        expect(result.current.validate(CONST.IOU.PAYMENT_TYPE.ELSEWHERE)).toEqual({errorKey: null});
    });
});
