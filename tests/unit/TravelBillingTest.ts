import {
    clearTravelBillingSettlementAccountErrors,
    clearTravelBillingSettlementFrequencyErrors,
    configureTravelBillingForPolicy,
    deactivateTravelBilling,
    retryTravelCardsProvisioning,
    setTravelBillingReconciliationBankAccount,
    setTravelBillingSettlementAccount,
    toggleTravelBillingContinuousReconciliation,
    updateTravelBillingSettlementFrequency,
} from '@libs/actions/TravelBilling';
import * as API from '@libs/API';
// We need to import API because it is used in the tests
import {getLatestErrorField, getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {getTravelBillingCardSettingsKey} from '@libs/TravelBillingUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

describe('TravelBilling', () => {
    let spyAPIWrite: jest.SpyInstance;
    let spyOnyxMerge: jest.SpyInstance;

    beforeEach(() => {
        spyAPIWrite = jest.spyOn(API, 'write');
        spyOnyxMerge = jest.spyOn(Onyx, 'merge');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('setTravelBillingSettlementAccount sends correct optimistic, success, and failure data', () => {
        const policyID = '123';
        const workspaceAccountID = 456;
        const settlementBankAccountID = 789;
        const previousPaymentBankAccountID = 111;
        const cardSettingsKey = getTravelBillingCardSettingsKey(workspaceAccountID);

        setTravelBillingSettlementAccount(policyID, workspaceAccountID, settlementBankAccountID, previousPaymentBankAccountID);

        expect(spyAPIWrite).toHaveBeenCalledWith(
            'SetTravelBillingSettlementAccount',
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

    it('setTravelBillingSettlementAccount reverts to the previous account when the change fails', () => {
        const workspaceAccountID = 456;
        const previousPaymentBankAccountID = 111;
        const cardSettingsKey = getTravelBillingCardSettingsKey(workspaceAccountID);

        setTravelBillingSettlementAccount('123', workspaceAccountID, 789, previousPaymentBankAccountID);

        // Matched exactly so the rejected account cannot linger anywhere in the failure update
        expect(spyAPIWrite).toHaveBeenCalledWith(
            'SetTravelBillingSettlementAccount',
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

    it('setTravelBillingSettlementAccount keeps the new account and clears the previous one on success', () => {
        const workspaceAccountID = 456;
        const settlementBankAccountID = 789;
        const cardSettingsKey = getTravelBillingCardSettingsKey(workspaceAccountID);

        setTravelBillingSettlementAccount('123', workspaceAccountID, settlementBankAccountID, 111);

        expect(spyAPIWrite).toHaveBeenCalledWith(
            'SetTravelBillingSettlementAccount',
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

    it('setTravelBillingSettlementAccount leaves no settlement account when a first enable fails', () => {
        const workspaceAccountID = 456;
        const cardSettingsKey = getTravelBillingCardSettingsKey(workspaceAccountID);

        setTravelBillingSettlementAccount('123', workspaceAccountID, 789);

        expect(spyAPIWrite).toHaveBeenCalledWith(
            'SetTravelBillingSettlementAccount',
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

    it('setTravelBillingSettlementAccount falls back to the generic error keyed below a server message', () => {
        const workspaceAccountID = 456;
        const cardSettingsKey = getTravelBillingCardSettingsKey(workspaceAccountID);

        setTravelBillingSettlementAccount('123', workspaceAccountID, 789, 111);

        expect(spyAPIWrite).toHaveBeenCalledWith(
            'SetTravelBillingSettlementAccount',
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
        const serverMessage = 'The selected bank account ending in 1234 could not be used as the settlement account. Please contact Concierge to verify the account.';
        const fallbackErrors = getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage', 0);

        // The backend applies its onyxData before failureData, so both messages end up merged under the same field
        const cardSettings = {errorFields: {paymentBankAccountID: {...fallbackErrors, [serverErrorKey]: serverMessage}}};

        expect(getLatestErrorField(cardSettings, 'paymentBankAccountID')).toEqual({[serverErrorKey]: serverMessage});
        expect(getLatestErrorField({errorFields: {paymentBankAccountID: fallbackErrors}}, 'paymentBankAccountID')).toEqual(fallbackErrors);
    });

    it('clearTravelBillingSettlementAccountErrors clears errors and pendingFields', () => {
        const workspaceAccountID = 456;
        const restoredAccountID = 111;
        const cardSettingsKey = getTravelBillingCardSettingsKey(workspaceAccountID);

        clearTravelBillingSettlementAccountErrors(workspaceAccountID, restoredAccountID);

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

    it('toggleTravelBillingContinuousReconciliation sends travel-specific optimistic, success, and failure data', () => {
        const workspaceAccountID = 456;
        const connectionName = CONST.POLICY.CONNECTIONS.NAME.NETSUITE;
        const oldConnectionName = CONST.POLICY.CONNECTIONS.NAME.QBO;

        toggleTravelBillingContinuousReconciliation(workspaceAccountID, true, connectionName, oldConnectionName);

        expect(spyAPIWrite).toHaveBeenCalledWith(
            'ToggleTravelBillingContinuousReconciliation',
            {
                policyAccountID: workspaceAccountID,
                shouldUseContinuousReconciliation: true,
                travelBillingContinuousReconciliationConnection: connectionName,
            },
            expect.objectContaining({
                optimisticData: expect.arrayContaining([
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.TRAVEL_BILLING_USE_CONTINUOUS_RECONCILIATION}${workspaceAccountID}`,
                        value: true,
                    }),
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.TRAVEL_BILLING_USE_CONTINUOUS_RECONCILIATION_PENDING_ACTION}${workspaceAccountID}`,
                        value: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    }),
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.TRAVEL_BILLING_CONTINUOUS_RECONCILIATION_CONNECTION}${workspaceAccountID}`,
                        value: connectionName,
                    }),
                ]),
                successData: expect.arrayContaining([
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.TRAVEL_BILLING_USE_CONTINUOUS_RECONCILIATION_PENDING_ACTION}${workspaceAccountID}`,
                        value: null,
                    }),
                ]),
                failureData: expect.arrayContaining([
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.TRAVEL_BILLING_USE_CONTINUOUS_RECONCILIATION}${workspaceAccountID}`,
                        value: false,
                    }),
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.TRAVEL_BILLING_CONTINUOUS_RECONCILIATION_CONNECTION}${workspaceAccountID}`,
                        value: oldConnectionName,
                    }),
                ]),
            }),
        );
    });

    it('setTravelBillingReconciliationBankAccount sends the selected bank account and reverts on failure', () => {
        const workspaceAccountID = 456;
        const domainName = 'expensify_policy_123.expensify.com';
        const selectedBankAccountID = 'account-123';
        const previousBankAccountID = 'account-111';

        setTravelBillingReconciliationBankAccount(workspaceAccountID, domainName, selectedBankAccountID, previousBankAccountID);

        expect(spyAPIWrite).toHaveBeenCalledWith(
            'SetTravelBillingReconciliationBankAccount',
            {
                domainName,
                travelBillingReconciliationBankAccountID: selectedBankAccountID,
            },
            expect.objectContaining({
                optimisticData: expect.arrayContaining([
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.TRAVEL_BILLING_RECONCILIATION_BANK_ACCOUNT_ID}${workspaceAccountID}`,
                        value: selectedBankAccountID,
                    }),
                ]),
                failureData: expect.arrayContaining([
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.TRAVEL_BILLING_RECONCILIATION_BANK_ACCOUNT_ID}${workspaceAccountID}`,
                        value: previousBankAccountID,
                    }),
                ]),
            }),
        );
    });

    it('clearTravelBillingSettlementFrequencyErrors clears errors', () => {
        const workspaceAccountID = 456;
        const cardSettingsKey = getTravelBillingCardSettingsKey(workspaceAccountID);

        const monthlySettlementDate = new Date('2026-01-01');
        clearTravelBillingSettlementFrequencyErrors(workspaceAccountID, monthlySettlementDate);

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

    it('updateTravelBillingSettlementFrequency sends correct optimistic, success, and failure data', () => {
        const workspaceAccountID = 456;
        const frequency = CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY;
        const currentMonthlySettlementDate = new Date('2024-01-01');
        const cardSettingsKey = getTravelBillingCardSettingsKey(workspaceAccountID);

        // Set fake time to ensure deterministic optimistic data
        const mockDate = new Date('2024-05-20');
        jest.useFakeTimers();
        jest.setSystemTime(mockDate);

        updateTravelBillingSettlementFrequency(workspaceAccountID, frequency, currentMonthlySettlementDate);

        expect(spyAPIWrite).toHaveBeenCalledWith(
            'UpdateTravelBillingSettlementFrequency',
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

    it('configureTravelBillingForPolicy sends correct optimistic, success, and failure data', () => {
        const policyID = '123';
        const workspaceAccountID = 456;
        const settlementBankAccountID = 789;
        const cardSettingsKey = getTravelBillingCardSettingsKey(workspaceAccountID);

        configureTravelBillingForPolicy(policyID, workspaceAccountID, settlementBankAccountID);

        expect(spyAPIWrite).toHaveBeenCalledWith(
            'ConfigureTravelBillingForPolicy',
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

    it('deactivateTravelBilling sends correct optimistic, success, and failure data', () => {
        const policyID = '123';
        const workspaceAccountID = 456;
        const cardSettingsKey = getTravelBillingCardSettingsKey(workspaceAccountID);

        deactivateTravelBilling(policyID, workspaceAccountID);

        expect(spyAPIWrite).toHaveBeenCalledWith(
            'DeactivateTravelBilling',
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
        const travelBillingKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`;

        retryTravelCardsProvisioning(policyID, workspaceAccountID, currentProvisioningErrors);

        expect(spyAPIWrite).toHaveBeenCalledWith(
            'RetryTravelCardsProvisioning',
            {
                policyID,
            },
            expect.objectContaining({
                optimisticData: expect.arrayContaining([
                    expect.objectContaining({
                        key: travelBillingKey,
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
                        key: travelBillingKey,
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
