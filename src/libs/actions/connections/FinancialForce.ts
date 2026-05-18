import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {read, write} from '@libs/API';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {openLink} from '@userActions/Link';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {FinancialForceConnectionConfig} from '@src/types/onyx/Policy';

function prepareOnyxDataForFinancialForceCodingUpdate<K extends keyof FinancialForceConnectionConfig['coding']>(
    policyID: string,
    settingName: K,
    settingValue: FinancialForceConnectionConfig['coding'][K],
    oldSettingValue?: FinancialForceConnectionConfig['coding'][K],
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CERTINIA]: {
                        config: {
                            coding: {
                                [settingName]: settingValue,
                            },
                            pendingFields: {
                                [settingName]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [settingName]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CERTINIA]: {
                        config: {
                            coding: {
                                [settingName]: oldSettingValue ?? null,
                            },
                            pendingFields: {
                                [settingName]: null,
                            },
                            errorFields: {
                                [settingName]: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CERTINIA]: {
                        config: {
                            pendingFields: {
                                [settingName]: null,
                            },
                            errorFields: {
                                [settingName]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    return {optimisticData, failureData, successData};
}

function prepareOnyxDataForFinancialForceExportUpdate<K extends keyof FinancialForceConnectionConfig['export']>(
    policyID: string,
    settingName: K,
    settingValue: FinancialForceConnectionConfig['export'][K],
    oldSettingValue?: FinancialForceConnectionConfig['export'][K],
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CERTINIA]: {
                        config: {
                            export: {
                                [settingName]: settingValue,
                            },
                            pendingFields: {
                                [settingName]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [settingName]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CERTINIA]: {
                        config: {
                            export: {
                                [settingName]: oldSettingValue ?? null,
                            },
                            pendingFields: {
                                [settingName]: null,
                            },
                            errorFields: {
                                [settingName]: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CERTINIA]: {
                        config: {
                            pendingFields: {
                                [settingName]: null,
                            },
                            errorFields: {
                                [settingName]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    return {optimisticData, failureData, successData};
}

function getFinancialForceSetupLink(policyID: string, isSandbox = false) {
    const commandURL = getCommandURL({
        command: READ_COMMANDS.CONNECT_POLICY_TO_FINANCIAL_FORCE,
        shouldSkipWebProxy: true,
    });
    const params = new URLSearchParams({policyID, isSandbox: String(isSandbox)});
    return commandURL + params.toString();
}

function connectPolicyToFinancialForce(policyID: string, isSandbox: boolean, environmentURL: string) {
    openLink(getFinancialForceSetupLink(policyID, isSandbox), environmentURL);
}

function clearFinancialForceErrorField(policyID: string | undefined, fieldName: string) {
    if (!policyID) {
        return;
    }
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        connections: {[CONST.POLICY.CONNECTIONS.NAME.CERTINIA]: {config: {errorFields: {[fieldName]: null}}}},
    });
}

function syncPolicyToFinancialForce(policyID: string) {
    read(READ_COMMANDS.SYNC_POLICY_TO_FINANCIAL_FORCE, {policyID}, {});
}

function updateFinancialForceDimension1Mapping(policyID: string, value: ValueOf<typeof CONST.CERTINIA_MAPPING_VALUE>, previousValue: ValueOf<typeof CONST.CERTINIA_MAPPING_VALUE> | null) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForFinancialForceCodingUpdate(policyID, CONST.CERTINIA_CONFIG.CODING_DIMENSION1, value, previousValue ?? undefined);
    write(WRITE_COMMANDS.UPDATE_FINANCIAL_FORCE_DIMENSION1_MAPPING, {policyID, value}, {optimisticData, failureData, successData});
}

function updateFinancialForceDimension2Mapping(policyID: string, value: ValueOf<typeof CONST.CERTINIA_MAPPING_VALUE>, previousValue: ValueOf<typeof CONST.CERTINIA_MAPPING_VALUE> | null) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForFinancialForceCodingUpdate(policyID, CONST.CERTINIA_CONFIG.CODING_DIMENSION2, value, previousValue ?? undefined);
    write(WRITE_COMMANDS.UPDATE_FINANCIAL_FORCE_DIMENSION2_MAPPING, {policyID, value}, {optimisticData, failureData, successData});
}

function updateFinancialForceDimension3Mapping(policyID: string, value: ValueOf<typeof CONST.CERTINIA_MAPPING_VALUE>, previousValue: ValueOf<typeof CONST.CERTINIA_MAPPING_VALUE> | null) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForFinancialForceCodingUpdate(policyID, CONST.CERTINIA_CONFIG.CODING_DIMENSION3, value, previousValue ?? undefined);
    write(WRITE_COMMANDS.UPDATE_FINANCIAL_FORCE_DIMENSION3_MAPPING, {policyID, value}, {optimisticData, failureData, successData});
}

function updateFinancialForceDimension4Mapping(policyID: string, value: ValueOf<typeof CONST.CERTINIA_MAPPING_VALUE>, previousValue: ValueOf<typeof CONST.CERTINIA_MAPPING_VALUE> | null) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForFinancialForceCodingUpdate(policyID, CONST.CERTINIA_CONFIG.CODING_DIMENSION4, value, previousValue ?? undefined);
    write(WRITE_COMMANDS.UPDATE_FINANCIAL_FORCE_DIMENSION4_MAPPING, {policyID, value}, {optimisticData, failureData, successData});
}

function updateFinancialForceSyncTax(policyID: string, enabled: boolean, previousValue?: boolean) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForFinancialForceCodingUpdate(policyID, CONST.CERTINIA_CONFIG.SYNC_TAX, enabled, previousValue);
    write(WRITE_COMMANDS.UPDATE_FINANCIAL_FORCE_SYNC_TAX, {policyID, enabled}, {optimisticData, failureData, successData});
}

function updateFinancialForceExporter(policyID: string, exporter: string, previousExporter: string | null) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForFinancialForceExportUpdate(policyID, CONST.CERTINIA_CONFIG.EXPORTER, exporter, previousExporter ?? undefined);
    write(WRITE_COMMANDS.UPDATE_FINANCIAL_FORCE_EXPORTER, {policyID, email: exporter}, {optimisticData, failureData, successData});
}

function updateFinancialForceExportStatus(policyID: string, status: ValueOf<typeof CONST.CERTINIA_EXPORT_STATUS>, previousStatus: ValueOf<typeof CONST.CERTINIA_EXPORT_STATUS> | null) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForFinancialForceExportUpdate(policyID, CONST.CERTINIA_CONFIG.EXPORT_STATUS, status, previousStatus ?? undefined);
    write(WRITE_COMMANDS.UPDATE_FINANCIAL_FORCE_EXPORT_STATUS, {policyID, value: status}, {optimisticData, failureData, successData});
}

function updateFinancialForceExportDate(policyID: string, date: ValueOf<typeof CONST.CERTINIA_EXPORT_DATE>, previousDate: ValueOf<typeof CONST.CERTINIA_EXPORT_DATE> | null) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForFinancialForceExportUpdate(policyID, CONST.CERTINIA_CONFIG.EXPORT_DATE, date, previousDate ?? undefined);
    write(WRITE_COMMANDS.UPDATE_FINANCIAL_FORCE_EXPORT_DATE, {policyID, value: date}, {optimisticData, failureData, successData});
}

function updateFinancialForceDefaultVendor(policyID: string, vendorAccountID: string, previousVendorAccountID: string | null) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForFinancialForceExportUpdate(
        policyID,
        CONST.CERTINIA_CONFIG.VENDOR_ACCOUNT,
        vendorAccountID,
        previousVendorAccountID ?? undefined,
    );
    write(WRITE_COMMANDS.UPDATE_FINANCIAL_FORCE_DEFAULT_VENDOR, {policyID, vendorID: vendorAccountID}, {optimisticData, failureData, successData});
}

function updateFinancialForceAutoSync(policyID: string, enabled: boolean, previousValue?: boolean) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CERTINIA]: {
                        config: {
                            autoSync: {
                                enabled,
                            },
                            pendingFields: {
                                [CONST.CERTINIA_CONFIG.AUTO_SYNC_ENABLED]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [CONST.CERTINIA_CONFIG.AUTO_SYNC_ENABLED]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CERTINIA]: {
                        config: {
                            autoSync: {
                                enabled: previousValue,
                            },
                            pendingFields: {
                                [CONST.CERTINIA_CONFIG.AUTO_SYNC_ENABLED]: null,
                            },
                            errorFields: {
                                [CONST.CERTINIA_CONFIG.AUTO_SYNC_ENABLED]: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CERTINIA]: {
                        config: {
                            pendingFields: {
                                [CONST.CERTINIA_CONFIG.AUTO_SYNC_ENABLED]: null,
                            },
                            errorFields: {
                                [CONST.CERTINIA_CONFIG.AUTO_SYNC_ENABLED]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    write(WRITE_COMMANDS.UPDATE_FINANCIAL_FORCE_AUTO_SYNC, {policyID, enabled}, {optimisticData, failureData, successData});
}

function updateFinancialForceSyncReimbursedReports(policyID: string, enabled: boolean, previousValue?: boolean) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CERTINIA]: {
                        config: {
                            advanced: {
                                syncReimbursedReports: enabled,
                            },
                            pendingFields: {
                                [CONST.CERTINIA_CONFIG.SYNC_REIMBURSED_REPORTS]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [CONST.CERTINIA_CONFIG.SYNC_REIMBURSED_REPORTS]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CERTINIA]: {
                        config: {
                            advanced: {
                                syncReimbursedReports: previousValue,
                            },
                            pendingFields: {
                                [CONST.CERTINIA_CONFIG.SYNC_REIMBURSED_REPORTS]: null,
                            },
                            errorFields: {
                                [CONST.CERTINIA_CONFIG.SYNC_REIMBURSED_REPORTS]: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.CERTINIA]: {
                        config: {
                            pendingFields: {
                                [CONST.CERTINIA_CONFIG.SYNC_REIMBURSED_REPORTS]: null,
                            },
                            errorFields: {
                                [CONST.CERTINIA_CONFIG.SYNC_REIMBURSED_REPORTS]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    write(WRITE_COMMANDS.UPDATE_FINANCIAL_FORCE_SYNC_REIMBURSED_REPORTS, {policyID, enabled}, {optimisticData, failureData, successData});
}

export {
    clearFinancialForceErrorField,
    connectPolicyToFinancialForce,
    syncPolicyToFinancialForce,
    updateFinancialForceAutoSync,
    updateFinancialForceDefaultVendor,
    updateFinancialForceDimension1Mapping,
    updateFinancialForceDimension2Mapping,
    updateFinancialForceDimension3Mapping,
    updateFinancialForceDimension4Mapping,
    updateFinancialForceExportDate,
    updateFinancialForceExporter,
    updateFinancialForceExportStatus,
    updateFinancialForceSyncReimbursedReports,
    updateFinancialForceSyncTax,
};
