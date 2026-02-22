import Onyx from 'react-native-onyx';
import {
    clearTravelInvoicingSettlementAccountErrors,
    clearTravelInvoicingSettlementFrequencyErrors,
    setTravelInvoicingSettlementAccount,
    toggleTravelInvoicing,
    updateTravelInvoiceSettlementFrequency,
} from '@libs/actions/TravelInvoicing';
// We need to import API because it is used in the tests
// eslint-disable-next-line no-restricted-syntax
import * as API from '@libs/API';
import {getTravelInvoicingCardSettingsKey} from '@libs/TravelInvoicingUtils';
import CONST from '@src/CONST';

describe('TravelInvoicing', () => {
    let spyAPIWrite: jest.SpyInstance;
    let spyOnyxMerge: jest.SpyInstance;

    beforeEach(() => {
        spyAPIWrite = jest.spyOn(API, 'write');
        spyOnyxMerge = jest.spyOn(Onyx, 'merge');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('setTravelInvoicingSettlementAccount sends correct optimistic, success, and failure data', () => {
        const policyID = '123';
        const workspaceAccountID = 456;
        const settlementBankAccountID = 789;
        const previousPaymentBankAccountID = 111;
        const cardSettingsKey = getTravelInvoicingCardSettingsKey(workspaceAccountID);

        setTravelInvoicingSettlementAccount(policyID, workspaceAccountID, settlementBankAccountID, previousPaymentBankAccountID);

        expect(spyAPIWrite).toHaveBeenCalledWith(
            'SetTravelInvoicingSettlementAccount',
            {
                policyID,
                settlementBankAccountID,
            },
            expect.objectContaining({
                optimisticData: expect.arrayContaining([
                    expect.objectContaining({
                        key: cardSettingsKey,
                        value: expect.objectContaining({
                            paymentBankAccountID: settlementBankAccountID,
                            previousPaymentBankAccountID,
                            isLoading: true,
                            pendingFields: expect.objectContaining({
                                paymentBankAccountID: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            }),
                            errorFields: expect.objectContaining({
                                paymentBankAccountID: null,
                            }),
                        }),
                    }),
                ]),
                successData: expect.arrayContaining([
                    expect.objectContaining({
                        key: cardSettingsKey,
                        value: expect.objectContaining({
                            paymentBankAccountID: settlementBankAccountID,
                            previousPaymentBankAccountID: null,
                            isLoading: false,
                            pendingFields: expect.objectContaining({
                                paymentBankAccountID: null,
                            }),
                            errorFields: expect.objectContaining({
                                paymentBankAccountID: null,
                            }),
                        }),
                    }),
                ]),
                failureData: expect.arrayContaining([
                    expect.objectContaining({
                        key: cardSettingsKey,
                        value: expect.objectContaining({
                            paymentBankAccountID: settlementBankAccountID,
                            previousPaymentBankAccountID,
                            isLoading: false,
                            pendingFields: expect.objectContaining({
                                paymentBankAccountID: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            }),
                            errorFields: expect.objectContaining({
                                paymentBankAccountID: expect.anything() as unknown,
                            }),
                        }),
                    }),
                ]),
            }),
        );
    });

    it('clearTravelInvoicingSettlementAccountErrors clears errors and pendingFields', () => {
        const workspaceAccountID = 456;
        const restoredAccountID = 111;
        const cardSettingsKey = getTravelInvoicingCardSettingsKey(workspaceAccountID);

        clearTravelInvoicingSettlementAccountErrors(workspaceAccountID, restoredAccountID);

        expect(spyOnyxMerge).toHaveBeenCalledWith(cardSettingsKey, {
            paymentBankAccountID: restoredAccountID,
            previousPaymentBankAccountID: null,
            pendingFields: {
                paymentBankAccountID: null,
            },
            errorFields: {
                paymentBankAccountID: null,
            },
        });
    });

    it('clearTravelInvoicingSettlementFrequencyErrors clears errors', () => {
        const workspaceAccountID = 456;
        const cardSettingsKey = getTravelInvoicingCardSettingsKey(workspaceAccountID);

        const monthlySettlementDate = new Date('2026-01-01');
        clearTravelInvoicingSettlementFrequencyErrors(workspaceAccountID, monthlySettlementDate);

        expect(spyOnyxMerge).toHaveBeenCalledWith(cardSettingsKey, {
            monthlySettlementDate: monthlySettlementDate ?? null,
            previousMonthlySettlementDate: null,
            pendingFields: {
                monthlySettlementDate: null,
            },
            errorFields: {
                monthlySettlementDate: null,
            },
        });
    });

    it('updateTravelInvoiceSettlementFrequency sends correct optimistic, success, and failure data', () => {
        const workspaceAccountID = 456;
        const frequency = CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY;
        const currentMonthlySettlementDate = new Date('2024-01-01');
        const cardSettingsKey = getTravelInvoicingCardSettingsKey(workspaceAccountID);

        // Set fake time to ensure deterministic optimistic data
        const mockDate = new Date('2024-05-20');
        jest.useFakeTimers();
        jest.setSystemTime(mockDate);

        updateTravelInvoiceSettlementFrequency(workspaceAccountID, frequency, currentMonthlySettlementDate);

        expect(spyAPIWrite).toHaveBeenCalledWith(
            'UpdateTravelInvoiceSettlementFrequency',
            {
                domainAccountID: workspaceAccountID,
                settlementFrequency: frequency,
            },
            expect.objectContaining({
                optimisticData: expect.arrayContaining([
                    expect.objectContaining({
                        key: cardSettingsKey,
                        value: expect.objectContaining({
                            monthlySettlementDate: mockDate,
                            previousMonthlySettlementDate: currentMonthlySettlementDate,
                            pendingFields: expect.objectContaining({
                                monthlySettlementDate: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            }),
                            errorFields: {
                                monthlySettlementDate: null,
                            },
                        }),
                    }),
                ]),
                successData: expect.arrayContaining([
                    expect.objectContaining({
                        key: cardSettingsKey,
                        value: expect.objectContaining({
                            monthlySettlementDate: mockDate,
                            previousMonthlySettlementDate: null,
                            pendingFields: expect.objectContaining({
                                monthlySettlementDate: null,
                            }),
                            errorFields: {
                                monthlySettlementDate: null,
                            },
                        }),
                    }),
                ]),
                failureData: expect.arrayContaining([
                    expect.objectContaining({
                        key: cardSettingsKey,
                        value: expect.objectContaining({
                            monthlySettlementDate: mockDate,
                            previousMonthlySettlementDate: currentMonthlySettlementDate,
                            pendingFields: expect.objectContaining({
                                monthlySettlementDate: null,
                            }),
                            errorFields: {
                                monthlySettlementDate: expect.anything() as unknown,
                            },
                        }),
                    }),
                ]),
            }),
        );

        jest.useRealTimers();
    });

    it('toggleTravelInvoicing sends correct optimistic, success, and failure data', () => {
        const policyID = '123';
        const workspaceAccountID = 456;
        const enabled = true;
        const cardSettingsKey = getTravelInvoicingCardSettingsKey(workspaceAccountID);

        toggleTravelInvoicing(policyID, workspaceAccountID, enabled);

        expect(spyAPIWrite).toHaveBeenCalledWith(
            'ToggleTravelInvoicing',
            {
                policyID,
                enabled,
            },
            expect.objectContaining({
                optimisticData: expect.arrayContaining([
                    expect.objectContaining({
                        key: cardSettingsKey,
                        value: expect.objectContaining({
                            isEnabled: enabled,
                            [CONST.TRAVEL.PROGRAM_TRAVEL_US]: expect.objectContaining({
                                isEnabled: enabled,
                            }),
                            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            errors: null,
                        }),
                    }),
                ]),
                successData: expect.arrayContaining([
                    expect.objectContaining({
                        key: cardSettingsKey,
                        value: expect.objectContaining({
                            pendingAction: null,
                            [CONST.TRAVEL.PROGRAM_TRAVEL_US]: expect.objectContaining({
                                isEnabled: enabled,
                            }),
                        }),
                    }),
                ]),
                failureData: expect.arrayContaining([
                    expect.objectContaining({
                        key: cardSettingsKey,
                        value: expect.objectContaining({
                            isEnabled: !enabled,
                            [CONST.TRAVEL.PROGRAM_TRAVEL_US]: expect.objectContaining({
                                isEnabled: !enabled,
                            }),
                            pendingAction: null,
                            errors: expect.anything() as unknown,
                        }),
                    }),
                ]),
            }),
        );
    });
});
