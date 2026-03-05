import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import * as API from '@libs/API';
import type {
    ConfigureTravelInvoicingForPolicyParams,
    DeactivateTravelInvoicingParams,
    OpenPolicyTravelPageParams,
    SetTravelInvoicingSettlementAccountParams,
    UpdateTravelInvoicingSettlementFrequencyParams,
} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ApiUtils from '@libs/ApiUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import fileDownload from '@libs/fileDownload';
import localFileDownload from '@libs/localFileDownload';
import enhanceParameters from '@libs/Network/enhanceParameters';
import {getTravelInvoicingCardSettingsKey} from '@libs/TravelInvoicingUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Opens the Travel page for a policy and fetches Travel Invoicing data.
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
 * Sets the settlement account for Travel Invoicing.
 * Updates the paymentBankAccountID in the Travel Invoicing card settings.
 */
function setTravelInvoicingSettlementAccount(policyID: string, workspaceAccountID: number, settlementBankAccountID: number, previousPaymentBankAccountID?: number) {
    const cardSettingsKey = getTravelInvoicingCardSettingsKey(workspaceAccountID);

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
                paymentBankAccountID: settlementBankAccountID,
                previousPaymentBankAccountID,
                monthlySettlementDate,
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
                paymentBankAccountID: settlementBankAccountID,
                previousPaymentBankAccountID: null,
                monthlySettlementDate,
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
                // Keep the attempted value visible (grayed out) until error is dismissed
                paymentBankAccountID: settlementBankAccountID,
                previousPaymentBankAccountID,
                monthlySettlementDate,
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

    const params: SetTravelInvoicingSettlementAccountParams = {
        policyID,
        settlementBankAccountID,
    };

    API.write(WRITE_COMMANDS.SET_TRAVEL_INVOICING_SETTLEMENT_ACCOUNT, params, {optimisticData, successData, failureData});
}

/**
 * Clears any errors from the Travel Invoicing settlement account settings.
 * Also resets the paymentBankAccountID to the previous valid value (or null if none existed).
 */
function clearTravelInvoicingSettlementAccountErrors(workspaceAccountID: number, paymentBankAccountID: number | null) {
    Onyx.merge(getTravelInvoicingCardSettingsKey(workspaceAccountID), {
        paymentBankAccountID,
        previousPaymentBankAccountID: null,
        pendingFields: {
            paymentBankAccountID: null,
        },
        errorFields: {
            paymentBankAccountID: null,
        },
    });
}

/**
 * Updates the settlement frequency for Travel Invoicing.
 * Optimistically updates the monthlySettlementDate based on the selected frequency.
 * Supports offline behavior - changes are queued and synced when back online.
 */
function updateTravelInvoiceSettlementFrequency(workspaceAccountID: number, frequency: ValueOf<typeof CONST.EXPENSIFY_CARD.FREQUENCY_SETTING>, currentMonthlySettlementDate?: Date) {
    const cardSettingsKey = getTravelInvoicingCardSettingsKey(workspaceAccountID);

    // If Monthly, set date (optimistically today). If Daily, set null.
    const monthlySettlementDate = frequency === CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY ? new Date() : null;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: cardSettingsKey,
            value: {
                monthlySettlementDate,
                previousMonthlySettlementDate: currentMonthlySettlementDate,
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
                monthlySettlementDate,
                previousMonthlySettlementDate: null,
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
                monthlySettlementDate,
                previousMonthlySettlementDate: currentMonthlySettlementDate ?? null,
                pendingFields: {
                    monthlySettlementDate: null,
                },
                errorFields: {
                    monthlySettlementDate: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        },
    ];

    const params: UpdateTravelInvoicingSettlementFrequencyParams = {
        domainAccountID: workspaceAccountID,
        settlementFrequency: frequency,
    };

    API.write(WRITE_COMMANDS.UPDATE_TRAVEL_INVOICE_SETTLEMENT_FREQUENCY, params, {optimisticData, successData, failureData});
}

/**
 * Clears any errors from the Travel Invoicing settlement frequency settings.
 */
function clearTravelInvoicingSettlementFrequencyErrors(workspaceAccountID: number, monthlySettlementDate: Date | null | undefined) {
    Onyx.merge(getTravelInvoicingCardSettingsKey(workspaceAccountID), {
        monthlySettlementDate: monthlySettlementDate ?? null,
        previousMonthlySettlementDate: null,
        pendingFields: {
            monthlySettlementDate: null,
        },
        errorFields: {
            monthlySettlementDate: null,
        },
    });
}

/**
 * Enables Travel Invoicing for a policy with a settlement bank account.
 */
function configureTravelInvoicingForPolicy(policyID: string, workspaceAccountID: number, settlementBankAccountID: number) {
    const cardSettingsKey = getTravelInvoicingCardSettingsKey(workspaceAccountID);

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

    const params: ConfigureTravelInvoicingForPolicyParams = {
        policyID,
        settlementBankAccountID,
    };

    API.write(WRITE_COMMANDS.CONFIGURE_TRAVEL_INVOICING_FOR_POLICY, params, {optimisticData, successData, failureData});
}

function deactivateTravelInvoicing(policyID: string, workspaceAccountID: number) {
    const cardSettingsKey = getTravelInvoicingCardSettingsKey(workspaceAccountID);

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: cardSettingsKey,
            value: {
                isEnabled: false,
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
                pendingAction: null,
                [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {
                    isEnabled: false,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: cardSettingsKey,
            value: {
                isEnabled: true,
                [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {
                    isEnabled: true,
                },
                pendingAction: null,
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
            },
        },
    ];

    const params: DeactivateTravelInvoicingParams = {
        policyID,
    };

    API.write(WRITE_COMMANDS.DEACTIVATE_TRAVEL_INVOICING, params, {optimisticData, successData, failureData});
}

/**
 * Clears any errors from the Travel Invoicing toggle action.
 */
function clearTravelInvoicingErrors(workspaceAccountID: number) {
    Onyx.merge(getTravelInvoicingCardSettingsKey(workspaceAccountID), {
        errors: null,
        pendingAction: null,
    });
}

/**
 * Generates the Travel Invoice Statement PDF for a policy and date range.
 * Uses Onyx to track generation state and cache the filename.
 */
function getTravelInvoiceStatementPDF(policyID: string, startDate: string, endDate: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.TRAVEL_INVOICE_STATEMENT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.TRAVEL_INVOICE_STATEMENT,
            value: {
                isGenerating: true,
            },
        },
    ];
    // Note: Backend returns onyxData with isGenerating: false AND the PDF filename,
    // so we don't need successData here - the backend response handles it.
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.TRAVEL_INVOICE_STATEMENT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.TRAVEL_INVOICE_STATEMENT,
            value: {
                isGenerating: false,
            },
        },
    ];

    API.read(
        READ_COMMANDS.GET_TRAVEL_INVOICE_STATEMENT_PDF,
        {policyID, startDate, endDate},
        {
            optimisticData,
            failureData,
        },
    );
}

/**
 * Exports the Travel Invoice Statement as CSV for a policy and date range.
 * The backend returns a direct CSV file stream.
 */
function exportTravelInvoiceStatementCSV(policyID: string, startDate: string, endDate: string, translate: LocalizedTranslate) {
    const finalParameters = enhanceParameters(READ_COMMANDS.EXPORT_TRAVEL_INVOICE_STATEMENT_CSV, {
        policyID,
        startDate,
        endDate,
    });

    const formData = new FormData();
    for (const [key, value] of Object.entries(finalParameters)) {
        formData.append(key, String(value));
    }

    const commandURL = ApiUtils.getCommandURL({command: READ_COMMANDS.EXPORT_TRAVEL_INVOICE_STATEMENT_CSV});
    const filename = `Travel_Statement_${startDate}_${endDate}.csv`;

    const onDownloadFailed = () => {
        // When no data exists for the selected date range, the backend returns a JSON error.
        // Download an empty CSV file in this case.
        localFileDownload(filename, translate('common.noResultsFound'), translate, undefined, true);
    };

    fileDownload(translate, commandURL, filename, '', false, formData, CONST.NETWORK.METHOD.POST, onDownloadFailed);
}

export {
    openPolicyTravelPage,
    setTravelInvoicingSettlementAccount,
    clearTravelInvoicingSettlementAccountErrors,
    clearTravelInvoicingSettlementFrequencyErrors,
    updateTravelInvoiceSettlementFrequency,
    getTravelInvoiceStatementPDF,
    exportTravelInvoiceStatementCSV,
    configureTravelInvoicingForPolicy,
    deactivateTravelInvoicing,
    clearTravelInvoicingErrors,
};
