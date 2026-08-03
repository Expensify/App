import {
    clearTravelInvoicingSettlementAccountErrors,
    clearTravelInvoicingSettlementFrequencyErrors,
    configureTravelInvoicingForPolicy,
    deactivateTravelInvoicing,
    retryTravelCardsProvisioning,
    setTravelInvoicingReconciliationBankAccount,
    setTravelInvoicingSettlementAccount,
    toggleTravelInvoicingContinuousReconciliation,
    updateTravelInvoiceSettlementFrequency,
} from '@libs/actions/TravelInvoicing';
import * as API from '@libs/API';
// We need to import API because it is used in the tests
import {getLatestErrorField, getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {getTravelInvoicingCardSettingsKey} from '@libs/TravelInvoicingUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

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
                                paymentBankAccountID: previousPaymentBankAccountID,
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

    it('setTravelInvoicingSettlementAccount reverts to the previous account when the change fails', () => {
        const workspaceAccountID = 456;
        const previousPaymentBankAccountID = 111;
        const cardSettingsKey = getTravelInvoicingCardSettingsKey(workspaceAccountID);

        setTravelInvoicingSettlementAccount('123', workspaceAccountID, 789, previousPaymentBankAccountID);

        // Matched exactly so the rejected account cannot linger anywhere in the failure update
        expect(spyAPIWrite).toHaveBeenCalledWith(
            'SetTravelInvoicingSettlementAccount',
            expect.anything(),
            expect.objectContaining({
                failureData: [
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: cardSettingsKey,
                        value: {
                            [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {
                                paymentBankAccountID: previousPaymentBankAccountID,
                                previousPaymentBankAccountID,
                                monthlySettlementDate: undefined,
                            },
                            isLoading: false,
                            pendingFields: {
                                paymentBankAccountID: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                paymentBankAccountID: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage', 0),
                            },
                        },
                    },
                ],
            }),
        );
    });

    it('setTravelInvoicingSettlementAccount keeps the new account and clears the previous one on success', () => {
        const workspaceAccountID = 456;
        const settlementBankAccountID = 789;
        const cardSettingsKey = getTravelInvoicingCardSettingsKey(workspaceAccountID);

        setTravelInvoicingSettlementAccount('123', workspaceAccountID, settlementBankAccountID, 111);

        expect(spyAPIWrite).toHaveBeenCalledWith(
            'SetTravelInvoicingSettlementAccount',
            expect.anything(),
            expect.objectContaining({
                successData: [
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: cardSettingsKey,
                        value: {
                            [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {
                                paymentBankAccountID: settlementBankAccountID,
                                previousPaymentBankAccountID: null,
                                monthlySettlementDate: undefined,
                            },
                            isLoading: false,
                            pendingFields: {
                                paymentBankAccountID: null,
                            },
                            errorFields: {
                                paymentBankAccountID: null,
                            },
                        },
                    },
                ],
            }),
        );
    });

    it('setTravelInvoicingSettlementAccount leaves no settlement account when a first enable fails', () => {
        const workspaceAccountID = 456;
        const cardSettingsKey = getTravelInvoicingCardSettingsKey(workspaceAccountID);

        setTravelInvoicingSettlementAccount('123', workspaceAccountID, 789);

        expect(spyAPIWrite).toHaveBeenCalledWith(
            'SetTravelInvoicingSettlementAccount',
            expect.anything(),
            expect.objectContaining({
                failureData: expect.arrayContaining([
                    expect.objectContaining({
                        key: cardSettingsKey,
                        value: expect.objectContaining({
                            [CONST.TRAVEL.PROGRAM_TRAVEL_US]: expect.objectContaining({
                                // null rather than undefined, otherwise the Onyx merge would not overwrite the optimistic value
                                paymentBankAccountID: null,
                            }),
                        }),
                    }),
                ]),
            }),
        );
    });

    it('setTravelInvoicingSettlementAccount falls back to the generic error keyed below a server message', () => {
        const workspaceAccountID = 456;
        const cardSettingsKey = getTravelInvoicingCardSettingsKey(workspaceAccountID);

        setTravelInvoicingSettlementAccount('123', workspaceAccountID, 789, 111);

        expect(spyAPIWrite).toHaveBeenCalledWith(
            'SetTravelInvoicingSettlementAccount',
            expect.anything(),
            expect.objectContaining({
                failureData: expect.arrayContaining([
                    expect.objectContaining({
                        key: cardSettingsKey,
                        value: expect.objectContaining({
                            errorFields: {
                                paymentBankAccountID: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage', 0),
                            },
                        }),
                    }),
                ]),
            }),
        );
    });

    it('a server-supplied settlement account message outranks the generic fallback error', () => {
        const serverErrorKey = '1770000000000000';
        const serverMessage = 'The selected bank account ending in 1234 could not be used as the settlement account. Please contact us so we can verify it.';
        const fallbackErrors = getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage', 0);

        // The backend applies its onyxData before failureData, so both messages end up merged under the same field
        const cardSettings = {errorFields: {paymentBankAccountID: {...fallbackErrors, [serverErrorKey]: serverMessage}}};

        expect(getLatestErrorField(cardSettings, 'paymentBankAccountID')).toEqual({[serverErrorKey]: serverMessage});
        expect(getLatestErrorField({errorFields: {paymentBankAccountID: fallbackErrors}}, 'paymentBankAccountID')).toEqual(fallbackErrors);
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

    it('toggleTravelInvoicingContinuousReconciliation sends travel-specific optimistic, success, and failure data', () => {
        const workspaceAccountID = 456;
        const connectionName = CONST.POLICY.CONNECTIONS.NAME.NETSUITE;
        const oldConnectionName = CONST.POLICY.CONNECTIONS.NAME.QBO;

        toggleTravelInvoicingContinuousReconciliation(workspaceAccountID, true, connectionName, oldConnectionName);

        expect(spyAPIWrite).toHaveBeenCalledWith(
            'ToggleTravelInvoicingContinuousReconciliation',
            {
                policyAccountID: workspaceAccountID,
                shouldUseContinuousReconciliation: true,
                travelInvoicingContinuousReconciliationConnection: connectionName,
            },
            expect.objectContaining({
                optimisticData: expect.arrayContaining([
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.TRAVEL_INVOICING_USE_CONTINUOUS_RECONCILIATION}${workspaceAccountID}`,
                        value: true,
                    }),
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.TRAVEL_INVOICING_USE_CONTINUOUS_RECONCILIATION_PENDING_ACTION}${workspaceAccountID}`,
                        value: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    }),
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.TRAVEL_INVOICING_CONTINUOUS_RECONCILIATION_CONNECTION}${workspaceAccountID}`,
                        value: connectionName,
                    }),
                ]),
                successData: expect.arrayContaining([
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.TRAVEL_INVOICING_USE_CONTINUOUS_RECONCILIATION_PENDING_ACTION}${workspaceAccountID}`,
                        value: null,
                    }),
                ]),
                failureData: expect.arrayContaining([
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.TRAVEL_INVOICING_USE_CONTINUOUS_RECONCILIATION}${workspaceAccountID}`,
                        value: false,
                    }),
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.TRAVEL_INVOICING_CONTINUOUS_RECONCILIATION_CONNECTION}${workspaceAccountID}`,
                        value: oldConnectionName,
                    }),
                ]),
            }),
        );
    });

    it('setTravelInvoicingReconciliationBankAccount sends the selected bank account and reverts on failure', () => {
        const workspaceAccountID = 456;
        const domainName = 'expensify_policy_123.expensify.com';
        const selectedBankAccountID = 'account-123';
        const previousBankAccountID = 'account-111';

        setTravelInvoicingReconciliationBankAccount(workspaceAccountID, domainName, selectedBankAccountID, previousBankAccountID);

        expect(spyAPIWrite).toHaveBeenCalledWith(
            'SetTravelInvoicingReconciliationBankAccount',
            {
                domainName,
                travelInvoicingReconciliationBankAccountID: selectedBankAccountID,
            },
            expect.objectContaining({
                optimisticData: expect.arrayContaining([
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.TRAVEL_INVOICING_RECONCILIATION_BANK_ACCOUNT_ID}${workspaceAccountID}`,
                        value: selectedBankAccountID,
                    }),
                ]),
                failureData: expect.arrayContaining([
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.TRAVEL_INVOICING_RECONCILIATION_BANK_ACCOUNT_ID}${workspaceAccountID}`,
                        value: previousBankAccountID,
                    }),
                ]),
            }),
        );
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
        const failedAccountID = 769;
        const currentProvisioningErrors = {[failedAccountID]: {accountID: failedAccountID, email: 'rodrigo+9@testfeedfilter5.com'}};
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
                                    errors: null,
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
