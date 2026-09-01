import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import * as API from '@libs/API';
import type {
    ConfigureTravelBillingForPolicyParams,
    DeactivateTravelBillingParams,
    OpenPolicyTravelPageParams,
    PayTravelBillingSpendParams,
    RetryTravelCardsProvisioningParams,
    SetTravelBillingReconciliationBankAccountParams,
    SetTravelBillingSettlementAccountParams,
    ToggleTravelBillingContinuousReconciliationParams,
    UpdateTravelBillingMonthlyLimitParams,
    UpdateTravelBillingSettlementFrequencyParams,
} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ApiUtils from '@libs/ApiUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import fileDownload from '@libs/fileDownload';
import localFileDownload from '@libs/localFileDownload';
import enhanceParameters from '@libs/Network/enhanceParameters';
import {getTravelBillingCardSettingsKey} from '@libs/TravelBillingUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TravelBillingProvisioningErrors} from '@src/types/onyx/CardFeeds';
import type {ConnectionName} from '@src/types/onyx/Policy';

import type {OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

/**
 * Opens the Travel page for a policy and fetches Travel Billing data.
 * Sets the isLoading state for the card settings while the API request is in flight.
 */
function openPolicyTravelPage(policyID: string, workspaceAccountID: number) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`,
            value: {
                isLoading: true,
                isSuccess: false,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`,
            value: {
                isLoading: false,
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`,
            value: {
                isLoading: false,
            },
        },
    ];

    const params: OpenPolicyTravelPageParams = {
        policyID,
    };

    API.read(READ_COMMANDS.OPEN_POLICY_TRAVEL_PAGE, params, {optimisticData, successData, failureData});
}

/**
 * Sets the settlement account for Travel Billing.
 * Updates the paymentBankAccountID in the Travel Billing card settings.
 */
function setTravelBillingSettlementAccount(policyID: string, workspaceAccountID: number, settlementBankAccountID: number, previousPaymentBankAccountID?: number) {
    const cardSettingsKey = getTravelBillingCardSettingsKey(workspaceAccountID);

    // Determine if we need to set the default frequency:
    // - When enabling for the first time (no previous account): default to monthly
    // - When disabling (zero bank account): clear the frequency
    // - When changing accounts (previous account exists): don't touch frequency (undefined = no change)
    const isFirstEnable = settlementBankAccountID !== 0 && !previousPaymentBankAccountID;
    const isDisabling = settlementBankAccountID === 0;

    let monthlySettlementDate: Date | null | undefined;
    if (isFirstEnable) {
        monthlySettlementDate = new Date();
    } else if (isDisabling) {
        monthlySettlementDate = null;
    }
    // Otherwise leave undefined - Onyx.merge will not overwrite existing value

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: cardSettingsKey,
            value: {
                [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {
                    paymentBankAccountID: settlementBankAccountID,
                    previousPaymentBankAccountID,
                    monthlySettlementDate,
                },
                isLoading: true,
                pendingFields: {
                    paymentBankAccountID: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errorFields: {
                    paymentBankAccountID: null,
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: cardSettingsKey,
            value: {
                [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {
                    paymentBankAccountID: settlementBankAccountID,
                    previousPaymentBankAccountID: null,
                    monthlySettlementDate,
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
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: cardSettingsKey,
            value: {
                [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {
                    paymentBankAccountID: settlementBankAccountID,
                    previousPaymentBankAccountID,
                    monthlySettlementDate,
                },
                isLoading: false,
                pendingFields: {
                    paymentBankAccountID: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errorFields: {
                    paymentBankAccountID: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        },
    ];

    const params: SetTravelBillingSettlementAccountParams = {
        policyID,
        settlementBankAccountID,
    };

    API.write(WRITE_COMMANDS.SET_TRAVEL_BILLING_SETTLEMENT_ACCOUNT, params, {optimisticData, successData, failureData});
}

type TravelBillingContinuousReconciliationUpdate = OnyxUpdate<
    | typeof ONYXKEYS.COLLECTION.TRAVEL_BILLING_USE_CONTINUOUS_RECONCILIATION
    | typeof ONYXKEYS.COLLECTION.TRAVEL_BILLING_USE_CONTINUOUS_RECONCILIATION_PENDING_ACTION
    | typeof ONYXKEYS.COLLECTION.TRAVEL_BILLING_CONTINUOUS_RECONCILIATION_CONNECTION
>;

function toggleTravelBillingContinuousReconciliation(
    workspaceAccountID: number,
    shouldUseContinuousReconciliation: boolean,
    connectionName: ConnectionName,
    oldConnectionName?: ConnectionName,
) {
    const parameters: ToggleTravelBillingContinuousReconciliationParams = shouldUseContinuousReconciliation
        ? {
              policyAccountID: workspaceAccountID,
              shouldUseContinuousReconciliation,
              travelBillingContinuousReconciliationConnection: connectionName,
          }
        : {
              policyAccountID: workspaceAccountID,
              shouldUseContinuousReconciliation,
          };

    const optimisticData: TravelBillingContinuousReconciliationUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRAVEL_BILLING_USE_CONTINUOUS_RECONCILIATION}${workspaceAccountID}`,
            value: shouldUseContinuousReconciliation,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRAVEL_BILLING_USE_CONTINUOUS_RECONCILIATION_PENDING_ACTION}${workspaceAccountID}`,
            value: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRAVEL_BILLING_CONTINUOUS_RECONCILIATION_CONNECTION}${workspaceAccountID}`,
            value: connectionName,
        },
    ];

    const successData: TravelBillingContinuousReconciliationUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRAVEL_BILLING_USE_CONTINUOUS_RECONCILIATION}${workspaceAccountID}`,
            value: shouldUseContinuousReconciliation,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRAVEL_BILLING_USE_CONTINUOUS_RECONCILIATION_PENDING_ACTION}${workspaceAccountID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRAVEL_BILLING_CONTINUOUS_RECONCILIATION_CONNECTION}${workspaceAccountID}`,
            value: connectionName,
        },
    ];

    const failureData: TravelBillingContinuousReconciliationUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRAVEL_BILLING_USE_CONTINUOUS_RECONCILIATION}${workspaceAccountID}`,
            value: !shouldUseContinuousReconciliation,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRAVEL_BILLING_USE_CONTINUOUS_RECONCILIATION_PENDING_ACTION}${workspaceAccountID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRAVEL_BILLING_CONTINUOUS_RECONCILIATION_CONNECTION}${workspaceAccountID}`,
            value: oldConnectionName ?? null,
        },
    ];

    API.write(WRITE_COMMANDS.TOGGLE_TRAVEL_BILLING_CONTINUOUS_RECONCILIATION, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

function setTravelBillingReconciliationBankAccount(
    workspaceAccountID: number,
    domainName: string,
    travelBillingReconciliationBankAccountID: string,
    currentReconciliationBankAccountID?: string,
) {
    const parameters: SetTravelBillingReconciliationBankAccountParams = {
        domainName,
        travelBillingReconciliationBankAccountID,
    };

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRAVEL_BILLING_RECONCILIATION_BANK_ACCOUNT_ID>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRAVEL_BILLING_RECONCILIATION_BANK_ACCOUNT_ID}${workspaceAccountID}`,
            value: travelBillingReconciliationBankAccountID,
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRAVEL_BILLING_RECONCILIATION_BANK_ACCOUNT_ID>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRAVEL_BILLING_RECONCILIATION_BANK_ACCOUNT_ID}${workspaceAccountID}`,
            value: currentReconciliationBankAccountID ?? null,
        },
    ];

    API.write(WRITE_COMMANDS.SET_TRAVEL_BILLING_RECONCILIATION_BANK_ACCOUNT, parameters, {optimisticData, failureData});
}

/**
 * Clears any errors from the Travel Billing settlement account settings.
 * Also resets the paymentBankAccountID to the previous valid value (or null if none existed).
 */
function clearTravelBillingSettlementAccountErrors(workspaceAccountID: number, paymentBankAccountID: number | null) {
    Onyx.merge(getTravelBillingCardSettingsKey(workspaceAccountID), {
        [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {
            paymentBankAccountID,
            previousPaymentBankAccountID: null,
        },
        pendingFields: {
            paymentBankAccountID: null,
        },
        errorFields: {
            paymentBankAccountID: null,
        },
    });
}

/**
 * Updates the settlement frequency for Travel Billing.
 * Optimistically updates the monthlySettlementDate based on the selected frequency.
 * Supports offline behavior - changes are queued and synced when back online.
 */
function updateTravelBillingSettlementFrequency(workspaceAccountID: number, frequency: ValueOf<typeof CONST.EXPENSIFY_CARD.FREQUENCY_SETTING>, currentMonthlySettlementDate?: Date) {
    const cardSettingsKey = getTravelBillingCardSettingsKey(workspaceAccountID);

    // If Monthly, set date (optimistically today). If Daily, set null.
    const monthlySettlementDate = frequency === CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY ? new Date() : null;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: cardSettingsKey,
            value: {
                [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {
                    monthlySettlementDate,
                    previousMonthlySettlementDate: currentMonthlySettlementDate,
                },
                pendingFields: {
                    monthlySettlementDate: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errorFields: {
                    monthlySettlementDate: null,
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: cardSettingsKey,
            value: {
                [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {
                    monthlySettlementDate,
                    previousMonthlySettlementDate: null,
                },
                pendingFields: {
                    monthlySettlementDate: null,
                },
                errorFields: {
                    monthlySettlementDate: null,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: cardSettingsKey,
            value: {
                [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {
                    monthlySettlementDate,
                    previousMonthlySettlementDate: currentMonthlySettlementDate ?? null,
                },
                pendingFields: {
                    monthlySettlementDate: null,
                },
                errorFields: {
                    monthlySettlementDate: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        },
    ];

    const params: UpdateTravelBillingSettlementFrequencyParams = {
        domainAccountID: workspaceAccountID,
        settlementFrequency: frequency,
    };

    API.write(WRITE_COMMANDS.UPDATE_TRAVEL_BILLING_SETTLEMENT_FREQUENCY, params, {optimisticData, successData, failureData});
}

/**
 * Clears any errors from the Travel Billing settlement frequency settings.
 */
function clearTravelBillingSettlementFrequencyErrors(workspaceAccountID: number, monthlySettlementDate: Date | null | undefined) {
    Onyx.merge(getTravelBillingCardSettingsKey(workspaceAccountID), {
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
}

/**
 * Enables Travel Billing for a policy with a settlement bank account.
 */
function configureTravelBillingForPolicy(policyID: string, workspaceAccountID: number, settlementBankAccountID: number) {
    const cardSettingsKey = getTravelBillingCardSettingsKey(workspaceAccountID);

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: cardSettingsKey,
            value: {
                isLoading: true,
                isSuccess: false,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                pendingFields: {
                    paymentBankAccountID: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errors: null,
                errorFields: {
                    paymentBankAccountID: null,
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: cardSettingsKey,
            value: {
                isLoading: false,
                isSuccess: true,
                pendingAction: null,
                pendingFields: {
                    paymentBankAccountID: null,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: cardSettingsKey,
            value: {
                isLoading: false,
                isSuccess: false,
                pendingAction: null,
                pendingFields: {
                    paymentBankAccountID: null,
                },
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
            },
        },
    ];

    const params: ConfigureTravelBillingForPolicyParams = {
        policyID,
        settlementBankAccountID,
    };

    API.write(WRITE_COMMANDS.CONFIGURE_TRAVEL_BILLING_FOR_POLICY, params, {optimisticData, successData, failureData});
}

function deactivateTravelBilling(policyID: string, workspaceAccountID: number) {
    const cardSettingsKey = getTravelBillingCardSettingsKey(workspaceAccountID);

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: cardSettingsKey,
            value: {
                [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {
                    isEnabled: false,
                },
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                errors: null,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: cardSettingsKey,
            value: {
                [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {
                    isEnabled: false,
                },
                pendingAction: null,
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: cardSettingsKey,
            value: {
                [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {
                    isEnabled: true,
                },
                pendingAction: null,
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
            },
        },
    ];

    const params: DeactivateTravelBillingParams = {
        policyID,
    };

    API.write(WRITE_COMMANDS.DEACTIVATE_TRAVEL_BILLING, params, {optimisticData, successData, failureData});
}

/**
 * Clears any errors from the Travel Billing toggle action.
 */
function clearTravelBillingErrors(workspaceAccountID: number) {
    Onyx.merge(getTravelBillingCardSettingsKey(workspaceAccountID), {
        errors: null,
        pendingAction: null,
    });
}

/**
 * Retries travel card provisioning for workspace members that failed.
 * Optimistically clears provisioning errors and restores the previous banner if the retry fails.
 */
function retryTravelCardsProvisioning(policyID: string, workspaceAccountID: number, currentProvisioningErrors: TravelBillingProvisioningErrors) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`,
            value: {
                settings: {
                    travelInvoicing: {
                        // Errors are keyed by account ID, so a merge cannot clear them; null removes the field entirely.
                        errors: null,
                    },
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`,
            value: {
                settings: {
                    travelInvoicing: {
                        errors: currentProvisioningErrors,
                    },
                },
            },
        },
    ];

    const params: RetryTravelCardsProvisioningParams = {
        policyID,
    };

    API.write(WRITE_COMMANDS.RETRY_TRAVEL_CARDS_PROVISIONING, params, {optimisticData, failureData});
}

/**
 * Pays the outstanding Travel Billing balance for a workspace.
 * Optimistically sets the manual billing flag to true (payment queued state).
 * The backend will send updates for private_expensifyCardManualBilling_ to clear it when billing runs.
 */
function payTravelBillingSpend(policyID: string, workspaceAccountID: number, travelSpend: number) {
    const cardSettingsKey = getTravelBillingCardSettingsKey(workspaceAccountID);

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: cardSettingsKey,
            value: {
                [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {
                    pendingSettlementAmount: travelSpend,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: cardSettingsKey,
            value: {
                [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {
                    pendingSettlementAmount: 0,
                },
            },
        },
    ];

    const params: PayTravelBillingSpendParams = {
        policyID,
    };

    return API.write(WRITE_COMMANDS.PAY_TRAVEL_BILLING_SPEND, params, {optimisticData, failureData});
}

/**
 * Generates the Travel Billing Statement PDF for a policy and date range.
 * Uses Onyx to track generation state and cache the filename.
 */
function getTravelBillingStatementPDF(policyID: string, startDate: string, endDate: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.TRAVEL_BILLING_STATEMENT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.TRAVEL_BILLING_STATEMENT,
            value: {
                isGenerating: true,
            },
        },
    ];
    // Note: Backend returns onyxData with isGenerating: false AND the PDF filename,
    // so we don't need successData here - the backend response handles it.
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.TRAVEL_BILLING_STATEMENT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.TRAVEL_BILLING_STATEMENT,
            value: {
                isGenerating: false,
            },
        },
    ];

    API.read(
        READ_COMMANDS.GET_TRAVEL_BILLING_STATEMENT_PDF,
        {policyID, startDate, endDate},
        {
            optimisticData,
            failureData,
        },
    );
}

/**
 * Exports the Travel Billing Statement as CSV for a policy and date range.
 * The backend returns a direct CSV file stream.
 */
function exportTravelBillingStatementCSV(policyID: string, startDate: string, endDate: string, translate: LocalizedTranslate) {
    const finalParameters = enhanceParameters(READ_COMMANDS.EXPORT_TRAVEL_BILLING_STATEMENT_CSV, {
        policyID,
        startDate,
        endDate,
    });

    const formData = new FormData();
    for (const [key, value] of Object.entries(finalParameters)) {
        formData.append(key, String(value));
    }

    const commandURL = ApiUtils.getCommandURL({command: READ_COMMANDS.EXPORT_TRAVEL_BILLING_STATEMENT_CSV});
    const filename = `Travel_Statement_${startDate}_${endDate}.csv`;

    const onDownloadFailed = () => {
        // When no data exists for the selected date range, the backend returns a JSON error.
        // Download an empty CSV file in this case.
        localFileDownload(filename, translate('common.noResultsFound'), translate, undefined, true);
    };

    fileDownload(translate, commandURL, filename, '', false, formData, CONST.NETWORK.METHOD.POST, onDownloadFailed);
}

/**
 * Updates the per-user monthly spend limit for Travel Billing cards.
 */
function updateTravelBillingMonthlyLimit(workspaceAccountID: number, monthlySpendLimitPerUser: number, currentMonthlySpendLimitPerUser?: number) {
    const cardSettingsKey = getTravelBillingCardSettingsKey(workspaceAccountID);

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: cardSettingsKey,
            value: {
                [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {
                    monthlySpendLimitPerUser,
                },
                pendingFields: {
                    monthlySpendLimitPerUser: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errorFields: {
                    monthlySpendLimitPerUser: null,
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: cardSettingsKey,
            value: {
                pendingFields: {
                    monthlySpendLimitPerUser: null,
                },
                errorFields: {
                    monthlySpendLimitPerUser: null,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: cardSettingsKey,
            value: {
                [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {
                    monthlySpendLimitPerUser: currentMonthlySpendLimitPerUser ?? null,
                },
                pendingFields: {
                    monthlySpendLimitPerUser: null,
                },
                errorFields: {
                    monthlySpendLimitPerUser: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        },
    ];

    const params: UpdateTravelBillingMonthlyLimitParams = {
        domainAccountID: workspaceAccountID,
        monthlySpendLimitPerUser,
    };

    API.write(WRITE_COMMANDS.UPDATE_TRAVEL_BILLING_MONTHLY_LIMIT, params, {optimisticData, successData, failureData});
}

/**
 * Clears any errors from the Travel Billing monthly limit settings.
 */
function clearTravelBillingMonthlyLimitErrors(workspaceAccountID: number) {
    Onyx.merge(getTravelBillingCardSettingsKey(workspaceAccountID), {
        pendingFields: {
            monthlySpendLimitPerUser: null,
        },
        errorFields: {
            monthlySpendLimitPerUser: null,
        },
    });
}

export {
    openPolicyTravelPage,
    setTravelBillingSettlementAccount,
    clearTravelBillingSettlementAccountErrors,
    clearTravelBillingSettlementFrequencyErrors,
    updateTravelBillingSettlementFrequency,
    payTravelBillingSpend,
    getTravelBillingStatementPDF,
    exportTravelBillingStatementCSV,
    configureTravelBillingForPolicy,
    deactivateTravelBilling,
    toggleTravelBillingContinuousReconciliation,
    setTravelBillingReconciliationBankAccount,
    clearTravelBillingErrors,
    retryTravelCardsProvisioning,
    updateTravelBillingMonthlyLimit,
    clearTravelBillingMonthlyLimitErrors,
};
