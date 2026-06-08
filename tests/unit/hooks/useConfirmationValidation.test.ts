import {renderHook} from '@testing-library/react-native';
import type {UseConfirmationValidationParams} from '@components/MoneyRequestConfirmationList/hooks/useConfirmationValidation';
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

const TRANSACTION_ID = 'txn1';
const REPORT_ID = 'report1';

const P2P_PARTICIPANT = {accountID: 2, isPolicyExpenseChat: false} as Participant;
const POLICY_EXPENSE_CHAT_PARTICIPANT = {accountID: 0, isPolicyExpenseChat: true, policyID: 'policy1'} as Participant;
const SELF_DM_PARTICIPANT = {accountID: 1, isPolicyExpenseChat: false, isSelfDM: true} as Participant;

const IOU_TYPES_WITH_STANDARD_VALIDATION = [CONST.IOU.TYPE.SUBMIT, CONST.IOU.TYPE.CREATE, CONST.IOU.TYPE.TRACK, CONST.IOU.TYPE.SPLIT, CONST.IOU.TYPE.INVOICE] as const;

type ValidationParamsOverrides = Omit<Partial<UseConfirmationValidationParams>, 'transaction'>;

function createTransactionBase(overrides: Partial<OnyxTypes.Transaction> = {}): OnyxTypes.Transaction {
    return {
        transactionID: TRANSACTION_ID,
        reportID: REPORT_ID,
        amount: 0,
        currency: 'USD',
        merchant: 'Coffee Shop',
        created: '2025-01-15',
        comment: {},
        ...overrides,
    };
}

function createManualTransaction(participants: Participant[], overrides: Partial<OnyxTypes.Transaction> = {}): OnyxTypes.Transaction {
    return createTransactionBase({
        iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
        participants,
        ...overrides,
    });
}

const baseParams = {
    transaction: createTransactionBase({amount: 100, participants: [P2P_PARTICIPANT]}),
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
    selectedParticipants: [P2P_PARTICIPANT],
    currentUserPersonalDetails: {accountID: 1} as CurrentUserPersonalDetails,
    isEditingSplitBill: false,
    isMerchantRequired: false,
    isMerchantFieldValid: true,
    isMerchantEmpty: false,
    shouldDisplayFieldError: false,
    shouldShowTax: false,
    isDistanceRequest: false,
    isDistanceRequestWithPendingRoute: false,
    isPerDiemRequest: false,
    isTimeRequest: false,
    routeError: undefined,
    isNewManualExpenseFlowEnabled: false,
} satisfies UseConfirmationValidationParams;

function createValidationParamsForParticipant(
    participant: Participant,
    overrides: ValidationParamsOverrides = {},
    transactionOverrides: Partial<OnyxTypes.Transaction> = {},
): UseConfirmationValidationParams {
    const participants = transactionOverrides.participants ?? [participant];

    return {
        ...baseParams,
        ...overrides,
        selectedParticipants: overrides.selectedParticipants ?? participants,
        transaction: createManualTransaction(participants, transactionOverrides),
    };
}

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
        const {result} = renderHook(() => useConfirmationValidation({...baseParams, isMerchantRequired: true, isMerchantEmpty: true, isMerchantFieldValid: false}));
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
                transaction: createTransactionBase({amount: 100, comment: {customUnit: {subRates: []}}}),
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
                transaction: createTransactionBase({amount: 100, merchant: 'Coffee'}),
                transactionReport: {type: CONST.REPORT.TYPE.IOU} as unknown as OnyxTypes.Report,
            }),
        );
        expect(result.current.validate()).toEqual({errorKey: 'iou.error.invalidAmount'});
    });

    it('returns errorKey: null on successful non-PAY validation', () => {
        const {result} = renderHook(() => useConfirmationValidation(baseParams));
        expect(result.current.validate()).toEqual({errorKey: null});
    });

    it('returns fieldRequired for manual expense when amount is not set in new manual expense flow with a policy expense chat participant', () => {
        const {result} = renderHook(() =>
            useConfirmationValidation(
                createValidationParamsForParticipant(
                    POLICY_EXPENSE_CHAT_PARTICIPANT,
                    {
                        isNewManualExpenseFlowEnabled: true,
                        iouAmount: 0,
                    },
                    {isAmountSet: false},
                ),
            ),
        );
        expect(result.current.validate()).toEqual({errorKey: 'common.error.fieldRequired'});
    });

    it('does not return fieldRequired for scan expense when amount is not set in new manual expense flow', () => {
        const {result} = renderHook(() =>
            useConfirmationValidation({
                ...baseParams,
                isNewManualExpenseFlowEnabled: true,
                transaction: createTransactionBase({
                    amount: 1000,
                    iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
                    receipt: {source: 'https://example.com/receipt.jpg'},
                }),
            }),
        );
        expect(result.current.validate()).toEqual({errorKey: null});
    });

    it('does not return fieldRequired for per diem expense when amount is not set in new manual expense flow', () => {
        const {result} = renderHook(() =>
            useConfirmationValidation({
                ...baseParams,
                isNewManualExpenseFlowEnabled: true,
                isPerDiemRequest: true,
                transaction: createTransactionBase({
                    amount: 5000,
                    iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
                    comment: {customUnit: {subRates: [{id: 'rate1', name: 'Breakfast', quantity: 1, rate: 5000}]}},
                }),
            }),
        );
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

    describe('amount validation — new manual expense flow (isAmountSet)', () => {
        const newManualFlowParams = {
            isNewManualExpenseFlowEnabled: true,
            iouAmount: 0,
        };

        describe('policy expense chat participant (workspace submit/create)', () => {
            it.each(IOU_TYPES_WITH_STANDARD_VALIDATION)('returns fieldRequired for unset manual amount when iouType is %s', (iouType) => {
                const {result} = renderHook(() =>
                    useConfirmationValidation(
                        createValidationParamsForParticipant(
                            POLICY_EXPENSE_CHAT_PARTICIPANT,
                            {
                                ...newManualFlowParams,
                                iouType,
                            },
                            {isAmountSet: false},
                        ),
                    ),
                );
                expect(result.current.validate()).toEqual({errorKey: 'common.error.fieldRequired'});
            });

            it('returns fieldRequired for PAY with unset manual amount before payment method is checked', () => {
                const {result} = renderHook(() =>
                    useConfirmationValidation(
                        createValidationParamsForParticipant(
                            POLICY_EXPENSE_CHAT_PARTICIPANT,
                            {
                                ...newManualFlowParams,
                                iouType: CONST.IOU.TYPE.PAY,
                            },
                            {isAmountSet: false},
                        ),
                    ),
                );
                expect(result.current.validate()).toEqual({errorKey: 'common.error.fieldRequired'});
                expect(result.current.validate(CONST.IOU.PAYMENT_TYPE.ELSEWHERE)).toEqual({errorKey: 'common.error.fieldRequired'});
            });

            it('returns errorKey: null when manual amount is explicitly set to zero for submit', () => {
                const {result} = renderHook(() =>
                    useConfirmationValidation(
                        createValidationParamsForParticipant(POLICY_EXPENSE_CHAT_PARTICIPANT, {...newManualFlowParams, iouType: CONST.IOU.TYPE.SUBMIT}, {amount: 0, isAmountSet: true}),
                    ),
                );
                expect(result.current.validate()).toEqual({errorKey: null});
            });

            it('returns invalidAmount when manual amount is explicitly set to zero for invoice', () => {
                const {result} = renderHook(() =>
                    useConfirmationValidation(
                        createValidationParamsForParticipant(POLICY_EXPENSE_CHAT_PARTICIPANT, {...newManualFlowParams, iouType: CONST.IOU.TYPE.INVOICE}, {amount: 0, isAmountSet: true}),
                    ),
                );
                expect(result.current.validate()).toEqual({errorKey: 'common.error.invalidAmount'});
            });
        });

        describe('P2P participant', () => {
            it.each([CONST.IOU.TYPE.SUBMIT, CONST.IOU.TYPE.CREATE, CONST.IOU.TYPE.PAY, CONST.IOU.TYPE.SPLIT])(
                'returns invalidAmount (not fieldRequired) for unset manual amount when iouType is %s',
                (iouType) => {
                    const {result} = renderHook(() =>
                        useConfirmationValidation(
                            createValidationParamsForParticipant(
                                P2P_PARTICIPANT,
                                {
                                    ...newManualFlowParams,
                                    iouType,
                                },
                                {isAmountSet: false},
                            ),
                        ),
                    );
                    expect(result.current.validate()).toEqual({errorKey: 'common.error.invalidAmount'});
                },
            );

            it('returns errorKey: null when manual amount is explicitly set to a positive value', () => {
                const {result} = renderHook(() =>
                    useConfirmationValidation(
                        createValidationParamsForParticipant(
                            P2P_PARTICIPANT,
                            {
                                ...newManualFlowParams,
                                iouAmount: 2500,
                            },
                            {amount: 2500, isAmountSet: true},
                        ),
                    ),
                );
                expect(result.current.validate()).toEqual({errorKey: null});
            });

            it('returns invalidAmount when manual amount is explicitly set to zero', () => {
                const {result} = renderHook(() => useConfirmationValidation(createValidationParamsForParticipant(P2P_PARTICIPANT, newManualFlowParams, {amount: 0, isAmountSet: true})));
                expect(result.current.validate()).toEqual({errorKey: 'common.error.invalidAmount'});
            });

            it('returns invalidAmount when manual amount is explicitly set to zero for invoice', () => {
                const {result} = renderHook(() =>
                    useConfirmationValidation(
                        createValidationParamsForParticipant(P2P_PARTICIPANT, {...newManualFlowParams, iouType: CONST.IOU.TYPE.INVOICE}, {amount: 0, isAmountSet: true}),
                    ),
                );
                expect(result.current.validate()).toEqual({errorKey: 'common.error.invalidAmount'});
            });
        });

        describe('self-DM participant', () => {
            it('returns fieldRequired for unset manual amount', () => {
                const {result} = renderHook(() => useConfirmationValidation(createValidationParamsForParticipant(SELF_DM_PARTICIPANT, newManualFlowParams, {isAmountSet: false})));
                expect(result.current.validate()).toEqual({errorKey: 'common.error.fieldRequired'});
            });

            it('returns errorKey: null when manual amount is explicitly set to zero', () => {
                const {result} = renderHook(() => useConfirmationValidation(createValidationParamsForParticipant(SELF_DM_PARTICIPANT, newManualFlowParams, {amount: 0, isAmountSet: true})));
                expect(result.current.validate()).toEqual({errorKey: null});
            });
        });

        it('does not return fieldRequired when the new manual expense flow beta is disabled', () => {
            const {result} = renderHook(() =>
                useConfirmationValidation(
                    createValidationParamsForParticipant(
                        P2P_PARTICIPANT,
                        {
                            isNewManualExpenseFlowEnabled: false,
                            iouAmount: 0,
                        },
                        {isAmountSet: false},
                    ),
                ),
            );
            expect(result.current.validate()).toEqual({errorKey: 'common.error.invalidAmount'});
        });
    });

    describe('amount validation — P2P zero amount guard', () => {
        it('returns invalidAmount for P2P manual submit with zero amount when flow is disabled', () => {
            const {result} = renderHook(() => useConfirmationValidation(createValidationParamsForParticipant(P2P_PARTICIPANT, {iouAmount: 0}, {amount: 0, isAmountSet: true})));
            expect(result.current.validate()).toEqual({errorKey: 'common.error.invalidAmount'});
        });

        it('returns errorKey: null for policy expense chat participant with zero amount', () => {
            const {result} = renderHook(() =>
                useConfirmationValidation(createValidationParamsForParticipant(POLICY_EXPENSE_CHAT_PARTICIPANT, {iouAmount: 0}, {amount: 0, isAmountSet: true})),
            );
            expect(result.current.validate()).toEqual({errorKey: null});
        });

        it('returns errorKey: null for P2P scan request with zero amount', () => {
            const {result} = renderHook(() =>
                useConfirmationValidation({
                    ...baseParams,
                    iouAmount: 0,
                    transaction: createTransactionBase({
                        amount: 0,
                        iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
                        receipt: {source: 'https://example.com/receipt.jpg'},
                        participants: [P2P_PARTICIPANT],
                    }),
                    selectedParticipants: [P2P_PARTICIPANT],
                }),
            );
            expect(result.current.validate()).toEqual({errorKey: null});
        });

        it('returns errorKey: null for P2P distance request with zero amount', () => {
            const {result} = renderHook(() =>
                useConfirmationValidation({
                    ...baseParams,
                    iouAmount: 0,
                    isDistanceRequest: true,
                    transaction: createTransactionBase({
                        amount: 0,
                        iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                        participants: [P2P_PARTICIPANT],
                        comment: {type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT},
                    }),
                    selectedParticipants: [P2P_PARTICIPANT],
                }),
            );
            expect(result.current.validate()).toEqual({errorKey: null});
        });

        it('returns errorKey: null for P2P time request with zero amount', () => {
            const {result} = renderHook(() =>
                useConfirmationValidation({
                    ...baseParams,
                    iouAmount: 0,
                    isTimeRequest: true,
                    transaction: createTransactionBase({
                        amount: 0,
                        iouRequestType: CONST.IOU.REQUEST_TYPE.TIME,
                        participants: [P2P_PARTICIPANT],
                        comment: {type: CONST.TRANSACTION.TYPE.TIME, units: {count: 1, rate: 0}},
                    }),
                    selectedParticipants: [P2P_PARTICIPANT],
                }),
            );
            expect(result.current.validate()).toEqual({errorKey: null});
        });
    });

    describe('amount validation — programmatic request types (scan, distance, time, per diem)', () => {
        const newManualFlowParams = {
            ...baseParams,
            isNewManualExpenseFlowEnabled: true,
        };

        it('does not return fieldRequired for scan expense when amount is not set', () => {
            const {result} = renderHook(() =>
                useConfirmationValidation({
                    ...newManualFlowParams,
                    transaction: createTransactionBase({
                        amount: 1000,
                        iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
                        receipt: {source: 'https://example.com/receipt.jpg'},
                        participants: [POLICY_EXPENSE_CHAT_PARTICIPANT],
                    }),
                    selectedParticipants: [POLICY_EXPENSE_CHAT_PARTICIPANT],
                }),
            );
            expect(result.current.validate()).toEqual({errorKey: null});
        });

        it('does not return fieldRequired for distance expense when amount is not set', () => {
            const {result} = renderHook(() =>
                useConfirmationValidation({
                    ...newManualFlowParams,
                    iouAmount: 5000,
                    isDistanceRequest: true,
                    transaction: createTransactionBase({
                        amount: 5000,
                        iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                        participants: [POLICY_EXPENSE_CHAT_PARTICIPANT],
                        comment: {type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT},
                    }),
                    selectedParticipants: [POLICY_EXPENSE_CHAT_PARTICIPANT],
                }),
            );
            expect(result.current.validate()).toEqual({errorKey: null});
        });

        it('does not return fieldRequired for time expense when amount is not set', () => {
            const {result} = renderHook(() =>
                useConfirmationValidation({
                    ...newManualFlowParams,
                    iouAmount: 3600,
                    isTimeRequest: true,
                    transaction: createTransactionBase({
                        amount: 3600,
                        iouRequestType: CONST.IOU.REQUEST_TYPE.TIME,
                        participants: [P2P_PARTICIPANT],
                        comment: {type: CONST.TRANSACTION.TYPE.TIME, units: {count: 1, rate: 3600}},
                    }),
                    selectedParticipants: [P2P_PARTICIPANT],
                }),
            );
            expect(result.current.validate()).toEqual({errorKey: null});
        });

        it('does not return fieldRequired for per diem expense when amount is not set', () => {
            const {result} = renderHook(() =>
                useConfirmationValidation({
                    ...newManualFlowParams,
                    isPerDiemRequest: true,
                    transaction: createTransactionBase({
                        amount: 5000,
                        iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
                        participants: [POLICY_EXPENSE_CHAT_PARTICIPANT],
                        comment: {customUnit: {subRates: [{id: 'rate1', name: 'Breakfast', quantity: 1, rate: 5000}]}},
                    }),
                    selectedParticipants: [POLICY_EXPENSE_CHAT_PARTICIPANT],
                }),
            );
            expect(result.current.validate()).toEqual({errorKey: null});
        });

        it('returns invalidAmount when distance amount exceeds validateAmount max length', () => {
            const {result} = renderHook(() =>
                useConfirmationValidation({
                    ...baseParams,
                    isDistanceRequest: true,
                    iouAmount: 123456789012345,
                    transaction: createTransactionBase({
                        amount: 123456789012345,
                        iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                        participants: [POLICY_EXPENSE_CHAT_PARTICIPANT],
                        comment: {type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT},
                    }),
                }),
            );
            expect(result.current.validate()).toEqual({errorKey: 'common.error.invalidAmount'});
        });

        it('returns errorKey: null for distance request below max safe amount when route is pending', () => {
            const {result} = renderHook(() =>
                useConfirmationValidation({
                    ...baseParams,
                    isDistanceRequest: true,
                    isDistanceRequestWithPendingRoute: true,
                    iouAmount: CONST.IOU.MAX_SAFE_AMOUNT,
                    transaction: createTransactionBase({
                        amount: CONST.IOU.MAX_SAFE_AMOUNT,
                        iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                        participants: [POLICY_EXPENSE_CHAT_PARTICIPANT],
                        comment: {type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT},
                    }),
                }),
            );
            expect(result.current.validate()).toEqual({errorKey: null});
        });

        it('returns amountTooLargeError for time expense with an invalid amount', () => {
            const {result} = renderHook(() =>
                useConfirmationValidation({
                    ...baseParams,
                    isTimeRequest: true,
                    iouAmount: CONST.IOU.MAX_SAFE_AMOUNT + 1,
                    transaction: createTransactionBase({
                        amount: CONST.IOU.MAX_SAFE_AMOUNT + 1,
                        iouRequestType: CONST.IOU.REQUEST_TYPE.TIME,
                        participants: [P2P_PARTICIPANT],
                        comment: {type: CONST.TRANSACTION.TYPE.TIME, units: {count: 1, rate: CONST.IOU.MAX_SAFE_AMOUNT + 1}},
                    }),
                }),
            );
            expect(result.current.validate()).toEqual({errorKey: 'iou.timeTracking.amountTooLargeError'});
        });

        it('returns invalidQuantity for per diem expense with an invalid computed amount', () => {
            const {result} = renderHook(() =>
                useConfirmationValidation({
                    ...baseParams,
                    isPerDiemRequest: true,
                    transaction: createTransactionBase({
                        amount: 0,
                        iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
                        participants: [POLICY_EXPENSE_CHAT_PARTICIPANT],
                        comment: {
                            customUnit: {
                                subRates: [{id: 'rate1', name: 'Breakfast', quantity: 100000, rate: 12345678}],
                            },
                        },
                    }),
                }),
            );
            expect(result.current.validate()).toEqual({errorKey: 'iou.error.invalidQuantity'});
        });
    });

    describe('amount validation — split bill editing', () => {
        it('returns invalidAmount when editing a split bill with zero amount and required fields otherwise filled', () => {
            const splitParticipants = [P2P_PARTICIPANT, {accountID: 3, isPolicyExpenseChat: false} as Participant];
            const {result} = renderHook(() =>
                useConfirmationValidation({
                    ...baseParams,
                    isEditingSplitBill: true,
                    iouAmount: 0,
                    selectedParticipants: splitParticipants,
                    transaction: createTransactionBase({
                        amount: 100,
                        merchant: 'Coffee',
                        participants: splitParticipants,
                    }),
                    transactionReport: {type: CONST.REPORT.TYPE.IOU} as unknown as OnyxTypes.Report,
                }),
            );
            // P2P zero-amount guard runs before the split-bill-specific invalidAmount check.
            expect(result.current.validate()).toEqual({errorKey: 'common.error.invalidAmount'});
        });

        it('returns invalidAmount for split IOU type with unset manual amount and P2P participants', () => {
            const splitParticipants = [P2P_PARTICIPANT, {accountID: 3, isPolicyExpenseChat: false} as Participant];
            const {result} = renderHook(() =>
                useConfirmationValidation(
                    createValidationParamsForParticipant(
                        P2P_PARTICIPANT,
                        {
                            iouType: CONST.IOU.TYPE.SPLIT,
                            isNewManualExpenseFlowEnabled: true,
                            iouAmount: 0,
                            selectedParticipants: splitParticipants,
                        },
                        {isAmountSet: false, participants: splitParticipants},
                    ),
                ),
            );
            expect(result.current.validate()).toEqual({errorKey: 'common.error.invalidAmount'});
        });

        it('returns fieldRequired for split IOU type with unset manual amount and a policy expense chat participant', () => {
            const {result} = renderHook(() =>
                useConfirmationValidation(
                    createValidationParamsForParticipant(
                        POLICY_EXPENSE_CHAT_PARTICIPANT,
                        {
                            iouType: CONST.IOU.TYPE.SPLIT,
                            isNewManualExpenseFlowEnabled: true,
                            iouAmount: 0,
                        },
                        {isAmountSet: false},
                    ),
                ),
            );
            expect(result.current.validate()).toEqual({errorKey: 'common.error.fieldRequired'});
        });

        it('returns invalidAmount for split IOU type with zero amount and isAmountSet true', () => {
            const splitParticipants = [POLICY_EXPENSE_CHAT_PARTICIPANT, {accountID: 3, isPolicyExpenseChat: false} as Participant];
            const {result} = renderHook(() =>
                useConfirmationValidation(
                    createValidationParamsForParticipant(
                        POLICY_EXPENSE_CHAT_PARTICIPANT,
                        {
                            iouType: CONST.IOU.TYPE.SPLIT,
                            isNewManualExpenseFlowEnabled: true,
                            iouAmount: 0,
                            selectedParticipants: splitParticipants,
                        },
                        {amount: 0, isAmountSet: true, participants: splitParticipants},
                    ),
                ),
            );
            expect(result.current.validate()).toEqual({errorKey: 'common.error.invalidAmount'});
        });

        it('returns iou.error.invalidAmount when editing split bill with zero amount and isAmountSet true', () => {
            const splitParticipants = [POLICY_EXPENSE_CHAT_PARTICIPANT, {accountID: 3, isPolicyExpenseChat: false} as Participant];
            const {result} = renderHook(() =>
                useConfirmationValidation({
                    ...baseParams,
                    isEditingSplitBill: true,
                    iouAmount: 0,
                    selectedParticipants: splitParticipants,
                    transaction: createTransactionBase({
                        amount: 100,
                        isAmountSet: true,
                        merchant: 'Coffee',
                        participants: splitParticipants,
                    }),
                    transactionReport: {type: CONST.REPORT.TYPE.IOU} as unknown as OnyxTypes.Report,
                }),
            );
            expect(result.current.validate()).toEqual({errorKey: 'iou.error.invalidAmount'});
        });
    });
});
