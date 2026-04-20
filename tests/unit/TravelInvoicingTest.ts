import Onyx from 'react-native-onyx';
import {
    clearTravelInvoicingSettlementAccountErrors,
    clearTravelInvoicingSettlementFrequencyErrors,
    configureTravelInvoicingForPolicy,
    deactivateTravelInvoicing,
    retryTravelCardsProvisioning,
    setTravelInvoicingSettlementAccount,
    updateTravelInvoiceSettlementFrequency,
} from '@libs/actions/TravelInvoicing';
// We need to import API because it is used in the tests
// eslint-disable-next-line no-restricted-syntax
import * as API from '@libs/API';
import {getTravelInvoicingCardSettingsKey} from '@libs/TravelInvoicingUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

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
                            [CONST.TRAVEL.PROGRAM_TRAVEL_US]: expect.objectContaining({
                                paymentBankAccountID: settlementBankAccountID,
                                previousPaymentBankAccountID,
                            }),
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
                            [CONST.TRAVEL.PROGRAM_TRAVEL_US]: expect.objectContaining({
                                paymentBankAccountID: settlementBankAccountID,
                                previousPaymentBankAccountID: null,
                            }),
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
                            [CONST.TRAVEL.PROGRAM_TRAVEL_US]: expect.objectContaining({
                                paymentBankAccountID: settlementBankAccountID,
                                previousPaymentBankAccountID,
                            }),
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
            [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {
                paymentBankAccountID: restoredAccountID,
                previousPaymentBankAccountID: null,
            },
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
            [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {
                monthlySettlementDate: monthlySettlementDate ?? null,
                previousMonthlySettlementDate: null,
            },
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
                            [CONST.TRAVEL.PROGRAM_TRAVEL_US]: expect.objectContaining({
                                monthlySettlementDate: mockDate,
                                previousMonthlySettlementDate: currentMonthlySettlementDate,
                            }),
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
                            [CONST.TRAVEL.PROGRAM_TRAVEL_US]: expect.objectContaining({
                                monthlySettlementDate: mockDate,
                                previousMonthlySettlementDate: null,
                            }),
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
                            [CONST.TRAVEL.PROGRAM_TRAVEL_US]: expect.objectContaining({
                                monthlySettlementDate: mockDate,
                                previousMonthlySettlementDate: currentMonthlySettlementDate,
                            }),
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

    it('configureTravelInvoicingForPolicy sends correct optimistic, success, and failure data', () => {
        const policyID = '123';
        const workspaceAccountID = 456;
        const settlementBankAccountID = 789;
        const cardSettingsKey = getTravelInvoicingCardSettingsKey(workspaceAccountID);

        configureTravelInvoicingForPolicy(policyID, workspaceAccountID, settlementBankAccountID);

        expect(spyAPIWrite).toHaveBeenCalledWith(
            'ConfigureTravelInvoicingForPolicy',
            {
                policyID,
                settlementBankAccountID,
            },
            expect.objectContaining({
                optimisticData: expect.arrayContaining([
                    expect.objectContaining({
                        key: cardSettingsKey,
                        value: expect.objectContaining({
                            isLoading: true,
                            isSuccess: false,
                            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            pendingFields: expect.objectContaining({
                                paymentBankAccountID: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            }),
                            errors: null,
                        }),
                    }),
                ]),
                successData: expect.arrayContaining([
                    expect.objectContaining({
                        key: cardSettingsKey,
                        value: expect.objectContaining({
                            isLoading: false,
                            isSuccess: true,
                            pendingAction: null,
                            pendingFields: expect.objectContaining({
                                paymentBankAccountID: null,
                            }),
                        }),
                    }),
                ]),
                failureData: expect.arrayContaining([
                    expect.objectContaining({
                        key: cardSettingsKey,
                        value: expect.objectContaining({
                            isLoading: false,
                            isSuccess: false,
                            pendingAction: null,
                            pendingFields: expect.objectContaining({
                                paymentBankAccountID: null,
                            }),
                            errors: expect.anything() as unknown,
                        }),
                    }),
                ]),
            }),
        );
    });

    it('deactivateTravelInvoicing sends correct optimistic, success, and failure data', () => {
        const policyID = '123';
        const workspaceAccountID = 456;
        const cardSettingsKey = getTravelInvoicingCardSettingsKey(workspaceAccountID);

        deactivateTravelInvoicing(policyID, workspaceAccountID);

        expect(spyAPIWrite).toHaveBeenCalledWith(
            'DeactivateTravelInvoicing',
            {
                policyID,
            },
            expect.objectContaining({
                optimisticData: expect.arrayContaining([
                    expect.objectContaining({
                        key: cardSettingsKey,
                        value: expect.objectContaining({
                            [CONST.TRAVEL.PROGRAM_TRAVEL_US]: expect.objectContaining({
                                isEnabled: false,
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
                                isEnabled: false,
                            }),
                        }),
                    }),
                ]),
                failureData: expect.arrayContaining([
                    expect.objectContaining({
                        key: cardSettingsKey,
                        value: expect.objectContaining({
                            [CONST.TRAVEL.PROGRAM_TRAVEL_US]: expect.objectContaining({
                                isEnabled: true,
                            }),
                            pendingAction: null,
                            errors: expect.anything() as unknown,
                        }),
                    }),
                ]),
            }),
        );
    });

    it('retryTravelCardsProvisioning restores provisioning errors on the shared domain member key when the retry fails', () => {
        const policyID = '123';
        const workspaceAccountID = 456;
        const currentProvisioningErrors = ['provisioning-failed'];
        const travelInvoicingKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`;

        retryTravelCardsProvisioning(policyID, workspaceAccountID, currentProvisioningErrors);

        expect(spyAPIWrite).toHaveBeenCalledWith(
            'RetryTravelCardsProvisioning',
            {
                policyID,
            },
            expect.objectContaining({
                optimisticData: expect.arrayContaining([
                    expect.objectContaining({
                        key: travelInvoicingKey,
                        value: {
                            settings: {
                                travelInvoicing: {
                                    errors: [],
                                },
                            },
                        },
                    }),
                ]),
                failureData: expect.arrayContaining([
                    expect.objectContaining({
                        key: travelInvoicingKey,
                        value: {
                            settings: {
                                travelInvoicing: {
                                    errors: currentProvisioningErrors,
                                },
                            },
                        },
                    }),
                ]),
            }),
        );
    });
});
