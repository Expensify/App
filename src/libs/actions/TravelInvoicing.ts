import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import type {OpenPolicyTravelPageParams, SetTravelInvoicingSettlementAccountParams, ToggleTravelInvoicingParams} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import {getTravelInvoicingCardSettingsKey} from '@libs/TravelInvoicingUtils';
import {getDomainNameForPolicy} from '@libs/PolicyUtils';
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

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: cardSettingsKey,
            value: {
                paymentBankAccountID: settlementBankAccountID,
                previousPaymentBankAccountID,
                isLoading: true,
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
                paymentBankAccountID: settlementBankAccountID,
                previousPaymentBankAccountID: null,
                isLoading: false,
                pendingAction: null,
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
                isLoading: false,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
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
        errors: null,
        pendingAction: null,
        paymentBankAccountID,
        previousPaymentBankAccountID: null,
    });
}

/**
 * Toggles Travel Invoicing on or off for a workspace.
 * When enabling: provisions travel cards for all travel-enabled users
 * When disabling: validates no outstanding balance exists first (done at the component level)
 */
function toggleTravelInvoicing(policyID: string, workspaceAccountID: number, enabled: boolean) {
    const domainName = getDomainNameForPolicy(policyID);
    const cardSettingsKey = getTravelInvoicingCardSettingsKey(workspaceAccountID);

    // Note: The toggle state should be controlled by a dedicated field from the backend (e.g., isCentralInvoicingEnabled)
    // The backend should return onyxData to update this field on success
    // We only set loading and pending states here - the actual enabled state comes from the backend
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: cardSettingsKey,
            value: {
                isLoading: true,
                pendingAction: enabled ? CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD : CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                errors: null,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: cardSettingsKey,
            value: {
                isLoading: false,
                pendingAction: null,
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: cardSettingsKey,
            value: {
                isLoading: false,
                pendingAction: null,
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
            },
        },
    ];

    const params: ToggleTravelInvoicingParams = {
        domainName,
        enabled,
    };

    API.write(WRITE_COMMANDS.TOGGLE_TRAVEL_INVOICING, params, {optimisticData, successData, failureData});
}

/**
 * Clears any errors from the Travel Invoicing toggle action.
 */
function clearToggleTravelInvoicingErrors(workspaceAccountID: number) {
    Onyx.merge(getTravelInvoicingCardSettingsKey(workspaceAccountID), {
        errors: null,
        pendingAction: null,
    });
}

export {openPolicyTravelPage, setTravelInvoicingSettlementAccount, clearTravelInvoicingSettlementAccountErrors, toggleTravelInvoicing, clearToggleTravelInvoicingErrors};

