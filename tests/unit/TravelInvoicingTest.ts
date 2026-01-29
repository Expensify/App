import Onyx from 'react-native-onyx';
import {
    clearTravelInvoicingSettlementAccountErrors,
    clearTravelInvoicingSettlementFrequencyErrors,
    setTravelInvoicingSettlementAccount,
    updateTravelInvoiceSettlementFrequency,
} from '@libs/actions/TravelInvoicing';
// We need to import API because it is used in the tests
// eslint-disable-next-line no-restricted-syntax
import * as API from '@libs/API';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

describe('TravelInvoicing', () => {
    let spyAPIWrite: jest.SpyInstance;
    let spyOnyxUpdate: jest.SpyInstance;

    beforeEach(() => {
        spyAPIWrite = jest.spyOn(API, 'write');
        spyOnyxUpdate = jest.spyOn(Onyx, 'update');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('setTravelInvoicingSettlementAccount sends correct optimistic, success, and failure data', () => {
        const policyID = '123';
        const workspaceAccountID = 456;
        const settlementBankAccountID = 789;
        const previousPaymentBankAccountID = 111;
        const cardSettingsKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}_${CONST.TRAVEL.PROGRAM_TRAVEL_US}`;

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
                            pendingFields: expect.objectContaining({
                                paymentBankAccountID: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            }),
                            isLoading: true,
                        }),
                    }),
                ]),
                successData: expect.arrayContaining([
                    expect.objectContaining({
                        key: cardSettingsKey,
                        value: expect.objectContaining({
                            paymentBankAccountID: settlementBankAccountID,
                            previousPaymentBankAccountID: null,
                            pendingFields: expect.objectContaining({
                                paymentBankAccountID: null,
                            }),
                            isLoading: false,
                        }),
                    }),
                ]),
                failureData: expect.arrayContaining([
                    expect.objectContaining({
                        key: cardSettingsKey,
                        value: expect.objectContaining({
                            paymentBankAccountID: settlementBankAccountID,
                            previousPaymentBankAccountID,
                            pendingFields: expect.objectContaining({
                                paymentBankAccountID: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            }),
                            isLoading: false,
                        }),
                    }),
                ]),
            }),
        );
    });

    it('clearTravelInvoicingSettlementAccountErrors clears errors and pendingFields', () => {
        const workspaceAccountID = 456;
        const restoredAccountID = 111;
        const cardSettingsKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}_${CONST.TRAVEL.PROGRAM_TRAVEL_US}`;

        clearTravelInvoicingSettlementAccountErrors(workspaceAccountID, restoredAccountID);

        expect(spyOnyxUpdate).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    key: cardSettingsKey,
                    value: expect.objectContaining({
                        errorFields: {
                            paymentBankAccountID: null,
                        },
                        pendingFields: expect.objectContaining({
                            paymentBankAccountID: null,
                        }),
                        paymentBankAccountID: restoredAccountID,
                        previousPaymentBankAccountID: null,
                    }),
                }),
            ]),
        );
    });

    it('clearTravelInvoicingSettlementFrequencyErrors clears errors', () => {
        const workspaceAccountID = 456;
        const cardSettingsKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}_${CONST.TRAVEL.PROGRAM_TRAVEL_US}`;

        clearTravelInvoicingSettlementFrequencyErrors(workspaceAccountID, undefined);

        expect(spyOnyxUpdate).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    key: cardSettingsKey,
                    value: expect.objectContaining({
                        errors: null,
                    }),
                }),
            ]),
        );
    });

    it('updateTravelInvoiceSettlementFrequency sends correct optimistic, success, and failure data', () => {
        const policyID = '123';
        const workspaceAccountID = 456;
        const frequency = CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY;
        const currentMonthlySettlementDate = new Date('2024-01-01');
        const cardSettingsKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}_${CONST.TRAVEL.PROGRAM_TRAVEL_US}`;

        // Set fake time to ensure deterministic optimistic data
        const mockDate = new Date('2024-05-20');
        jest.useFakeTimers();
        jest.setSystemTime(mockDate);

        updateTravelInvoiceSettlementFrequency(policyID, workspaceAccountID, frequency, currentMonthlySettlementDate);

        expect(spyAPIWrite).toHaveBeenCalledWith(
            'UpdateTravelInvoiceSettlementFrequency',
            {
                policyID,
                workspaceAccountID,
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
                            errors: null,
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
                            errors: null,
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
                            errors: null,
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
});
