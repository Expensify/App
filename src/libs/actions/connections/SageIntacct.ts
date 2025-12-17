import type {CONST as COMMON_CONST} from 'expensify-common';
import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as API from '@libs/API';
import type {ConnectPolicyToSageIntacctParams} from '@libs/API/parameters';
import type UpdateSageIntacctAccountingMethodParams from '@libs/API/parameters/UpdateSageIntacctAccountingMethodParams';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type {
    Connections,
    SageIntacctConnectionsConfig,
    SageIntacctDimension,
    SageIntacctExportConfig,
    SageIntacctMappingName,
    SageIntacctMappingType,
    SageIntacctMappingValue,
    SageIntacctOfflineStateKeys,
} from '@src/types/onyx/Policy';

type SageIntacctCredentials = {companyID: string; userID: string; password: string};

function connectToSageIntacct(policyID: string, credentials: SageIntacctCredentials) {
    const parameters: ConnectPolicyToSageIntacctParams = {
        policyID,
        intacctCompanyID: credentials.companyID,
        intacctUserID: credentials.userID,
        intacctPassword: credentials.password,
    };
    API.write(WRITE_COMMANDS.CONNECT_POLICY_TO_SAGE_INTACCT, parameters, {});
}

function prepareOnyxDataForMappingUpdate(
    policyID: string,
    mappingName: keyof SageIntacctMappingType,
    mappingValue: boolean | SageIntacctMappingValue,
    oldMappingValue?: boolean | SageIntacctMappingValue,
) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    intacct: {
                        config: {
                            mappings: {
                                [mappingName]: mappingValue,
                            },
                            pendingFields: {
                                [mappingName]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [mappingName]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    intacct: {
                        config: {
                            mappings: {
                                [mappingName]: oldMappingValue ?? null,
                            },
                            pendingFields: {
                                [mappingName]: null,
                            },
                            errorFields: {
                                [mappingName]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    intacct: {
                        config: {
                            pendingFields: {
                                [mappingName]: null,
                            },
                            errorFields: {
                                [mappingName]: undefined,
                            },
                        },
                    },
                },
            },
        },
    ];

    return {optimisticData, failureData, successData};
}

function updateSageIntacctBillable(policyID: string | undefined, enabled: boolean) {
    if (!policyID) {
        return;
    }
    const parameters = {
        policyID,
        enabled,
    };
    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_BILLABLE, parameters, prepareOnyxDataForMappingUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.SYNC_ITEMS, enabled, !enabled));
}

function getCommandForMapping(mappingName: ValueOf<typeof CONST.SAGE_INTACCT_CONFIG.MAPPINGS>) {
    switch (mappingName) {
        case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
            return WRITE_COMMANDS.UPDATE_SAGE_INTACCT_DEPARTMENT_MAPPING;
        case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
            return WRITE_COMMANDS.UPDATE_SAGE_INTACCT_CLASSES_MAPPING;
        case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
            return WRITE_COMMANDS.UPDATE_SAGE_INTACCT_LOCATIONS_MAPPING;
        case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
            return WRITE_COMMANDS.UPDATE_SAGE_INTACCT_CUSTOMERS_MAPPING;
        case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
            return WRITE_COMMANDS.UPDATE_SAGE_INTACCT_PROJECTS_MAPPING;
        default:
            return undefined;
    }
}

function updateSageIntacctMappingValue(policyID: string | undefined, mappingName: SageIntacctMappingName, mappingValue: SageIntacctMappingValue, oldMappingValue?: SageIntacctMappingValue) {
    if (!policyID) {
        return;
    }
    const command = getCommandForMapping(mappingName);
    if (!command) {
        return;
    }

    const onyxData = prepareOnyxDataForMappingUpdate(policyID, mappingName, mappingValue, oldMappingValue);
    API.write(
        command,
        {
            policyID,
            mapping: mappingValue,
        },
        onyxData,
    );
}

function changeMappingsValueFromDefaultToTag(policyID: string, mappings?: SageIntacctMappingType) {
    if (mappings?.departments === CONST.SAGE_INTACCT_MAPPING_VALUE.DEFAULT) {
        updateSageIntacctMappingValue(policyID, CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS, CONST.SAGE_INTACCT_MAPPING_VALUE.TAG, CONST.SAGE_INTACCT_MAPPING_VALUE.DEFAULT);
    }
    if (mappings?.classes === CONST.SAGE_INTACCT_MAPPING_VALUE.DEFAULT) {
        updateSageIntacctMappingValue(policyID, CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES, CONST.SAGE_INTACCT_MAPPING_VALUE.TAG, CONST.SAGE_INTACCT_MAPPING_VALUE.DEFAULT);
    }
    if (mappings?.locations === CONST.SAGE_INTACCT_MAPPING_VALUE.DEFAULT) {
        updateSageIntacctMappingValue(policyID, CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS, CONST.SAGE_INTACCT_MAPPING_VALUE.TAG, CONST.SAGE_INTACCT_MAPPING_VALUE.DEFAULT);
    }
}

function UpdateSageIntacctTaxSolutionID(policyID: string | undefined, taxSolutionID: string) {
    if (!policyID) {
        return;
    }
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    intacct: {
                        config: {
                            tax: {
                                taxSolutionID,
                            },
                            pendingFields: {
                                tax: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                taxSolutionID: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    intacct: {
                        config: {
                            tax: {
                                taxSolutionID: null,
                            },
                            pendingFields: {
                                tax: null,
                            },
                            errorFields: {
                                taxSolutionID: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    intacct: {
                        config: {
                            pendingFields: {
                                tax: null,
                            },
                            errorFields: {
                                taxSolutionID: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_TAX_SOLUTION_ID, {policyID, taxSolutionID}, {optimisticData, failureData, successData});
}

function updateSageIntacctSyncTaxConfiguration(policyID: string | undefined, enabled: boolean) {
    if (!policyID) {
        return;
    }
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    intacct: {
                        config: {
                            tax: {
                                syncTax: enabled,
                            },
                            pendingFields: {
                                tax: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                tax: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    intacct: {
                        config: {
                            tax: {
                                syncTax: !enabled,
                            },
                            pendingFields: {
                                tax: null,
                            },
                            errorFields: {
                                tax: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    intacct: {
                        config: {
                            pendingFields: {
                                tax: null,
                            },
                            errorFields: {
                                tax: undefined,
                            },
                        },
                    },
                },
            },
        },
    ];
    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_SYNC_TAX_CONFIGURATION, {policyID, enabled}, {optimisticData, failureData, successData});
}

function prepareOnyxDataForUserDimensionUpdate(
    policyID: string,
    dimensionName: string,
    newDimensions: SageIntacctDimension[],
    oldDimensions: SageIntacctDimension[],
    oldDimensionName: string,
    pendingAction: OnyxCommon.PendingAction,
) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    intacct: {
                        config: {
                            mappings: {
                                dimensions: newDimensions,
                            },
                            pendingFields: {[`${CONST.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX}${dimensionName}`]: pendingAction},
                            errorFields: {[`${CONST.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX}${dimensionName}`]: null},
                        },
                    },
                },
            },
        },
    ];

    const pendingActionAfterFailure = pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD ? pendingAction : null;

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    intacct: {
                        config: {
                            mappings: {
                                dimensions: oldDimensions,
                            },
                            pendingFields: {[`${CONST.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX}${oldDimensionName}`]: pendingActionAfterFailure},
                            errorFields: {
                                [`${CONST.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX}${oldDimensionName}`]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    intacct: {
                        config: {
                            mappings: {
                                dimensions: newDimensions,
                            },
                            pendingFields: {[`${CONST.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX}${dimensionName}`]: null},
                            errorFields: {[`${CONST.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX}${dimensionName}`]: null},
                        },
                    },
                },
            },
        },
    ];

    return {optimisticData, failureData, successData};
}

function addSageIntacctUserDimensions(
    policyID: string,
    dimensionName: string,
    mapping: typeof CONST.SAGE_INTACCT_MAPPING_VALUE.TAG | typeof CONST.SAGE_INTACCT_MAPPING_VALUE.REPORT_FIELD,
    existingUserDimensions: SageIntacctDimension[],
) {
    const newDimensions = [...existingUserDimensions, {mapping, dimension: dimensionName}];

    API.write(
        WRITE_COMMANDS.UPDATE_SAGE_INTACCT_USER_DIMENSION,
        {policyID, dimensions: JSON.stringify(newDimensions)},
        prepareOnyxDataForUserDimensionUpdate(policyID, dimensionName, newDimensions, newDimensions, dimensionName, CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD),
    );
}

function editSageIntacctUserDimensions(
    policyID: string,
    previousName: string,
    name: string,
    mapping: typeof CONST.SAGE_INTACCT_MAPPING_VALUE.TAG | typeof CONST.SAGE_INTACCT_MAPPING_VALUE.REPORT_FIELD,
    existingUserDimensions: SageIntacctDimension[],
) {
    const newDimensions = existingUserDimensions.map((userDimension) => {
        if (userDimension.dimension === previousName) {
            return {dimension: name, mapping};
        }
        return userDimension;
    });

    API.write(
        WRITE_COMMANDS.UPDATE_SAGE_INTACCT_USER_DIMENSION,
        {policyID, dimensions: JSON.stringify(newDimensions)},
        prepareOnyxDataForUserDimensionUpdate(policyID, name, newDimensions, existingUserDimensions, previousName, CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE),
    );
}

function removeSageIntacctUserDimensions(policyID: string, dimensionName: string, existingUserDimensions: SageIntacctDimension[]) {
    const newDimensions = existingUserDimensions.filter((userDimension) => dimensionName !== userDimension.dimension);

    API.write(
        WRITE_COMMANDS.UPDATE_SAGE_INTACCT_USER_DIMENSION,
        {policyID, dimensions: JSON.stringify(newDimensions)},
        prepareOnyxDataForUserDimensionUpdate(policyID, dimensionName, newDimensions, existingUserDimensions, dimensionName, CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
    );
}

function prepareOnyxDataForExportUpdate(policyID: string, settingName: keyof SageIntacctExportConfig, settingValue: string | null, oldSettingValue?: string | null) {
    const exporterOptimisticData = settingName === CONST.SAGE_INTACCT_CONFIG.EXPORTER ? {exporter: settingValue} : {};
    const exporterErrorData = settingName === CONST.SAGE_INTACCT_CONFIG.EXPORTER ? {exporter: oldSettingValue} : {};

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                ...exporterOptimisticData,
                connections: {
                    intacct: {
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

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                ...exporterErrorData,
                connections: {
                    intacct: {
                        config: {
                            export: {
                                [settingName]: oldSettingValue ?? null,
                            },
                            pendingFields: {
                                [settingName]: null,
                            },
                            errorFields: {
                                [settingName]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    intacct: {
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

function updateSageIntacctExporter(policyID: string, exporter: string, oldExporter?: string) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForExportUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.EXPORTER, exporter, oldExporter);
    const parameters = {
        policyID,
        email: exporter,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_EXPORTER, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctExportDate(policyID: string, date: ValueOf<typeof CONST.SAGE_INTACCT_EXPORT_DATE>, oldDate?: ValueOf<typeof CONST.SAGE_INTACCT_EXPORT_DATE>) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForExportUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.EXPORT_DATE, date, oldDate);
    const parameters = {
        policyID,
        value: date,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_EXPORT_DATE, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctReimbursableExpensesExportDestination(
    policyID: string,
    reimbursable: ValueOf<typeof CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE>,
    oldReimbursable?: ValueOf<typeof CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE>,
) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForExportUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE, reimbursable, oldReimbursable);
    const parameters = {
        policyID,
        value: reimbursable,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctNonreimbursableExpensesExportDestination(
    policyID: string,
    nonReimbursable: ValueOf<typeof CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE>,
    oldNonReimbursable?: ValueOf<typeof CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE>,
) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForExportUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE, nonReimbursable, oldNonReimbursable);
    const parameters = {
        policyID,
        value: nonReimbursable,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctReimbursableExpensesReportExportDefaultVendor(policyID: string, vendor: string, oldVendor?: string) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForExportUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR, vendor, oldVendor);
    const parameters = {
        policyID,
        vendorID: vendor,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_REIMBURSABLE_EXPENSES_REPORT_EXPORT_DEFAULT_VENDOR, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctNonreimbursableExpensesCreditCardChargeExportDefaultVendor(policyID: string, vendor: string, oldVendor?: string) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForExportUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR, vendor, oldVendor);
    const parameters = {
        policyID,
        vendorID: vendor,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES_CREDIT_CARD_CHARGE_EXPORT_DEFAULT_VENDOR, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctNonreimbursableExpensesExportAccount(policyID: string, nonReimbursableAccount: string, oldReimbursableAccount?: string) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForExportUpdate(
        policyID,
        CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_ACCOUNT,
        nonReimbursableAccount,
        oldReimbursableAccount,
    );
    const parameters = {
        policyID,
        creditCardAccountID: nonReimbursableAccount,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES_EXPORT_ACCOUNT, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctNonreimbursableExpensesExportVendor(policyID: string, vendor: string, oldVendor?: string) {
    const {optimisticData, failureData, successData} = prepareOnyxDataForExportUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_VENDOR, vendor, oldVendor);
    const parameters = {
        policyID,
        vendorID: vendor,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES_EXPORT_VENDOR, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctDefaultVendor(policyID: string, settingName: keyof SageIntacctExportConfig, vendor: string, oldVendor?: string) {
    if (settingName === CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR) {
        updateSageIntacctReimbursableExpensesReportExportDefaultVendor(policyID, vendor, oldVendor);
    } else if (settingName === CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR) {
        updateSageIntacctNonreimbursableExpensesCreditCardChargeExportDefaultVendor(policyID, vendor, oldVendor);
    } else if (settingName === CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_VENDOR) {
        updateSageIntacctNonreimbursableExpensesExportVendor(policyID, vendor, oldVendor);
    }
}

function clearSageIntacctErrorField(policyID: string | undefined, key: SageIntacctOfflineStateKeys | keyof SageIntacctConnectionsConfig) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {connections: {intacct: {config: {errorFields: {[key]: null}}}}});
}

function clearSageIntacctPendingField(policyID: string, key: SageIntacctOfflineStateKeys | keyof SageIntacctConnectionsConfig) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {connections: {intacct: {config: {pendingFields: {[key]: null}}}}});
}

function removeSageIntacctUserDimensionsByName(dimensions: SageIntacctDimension[], policyID: string, dimensionName: string) {
    const Dimensions = dimensions.filter((dimension) => dimension.dimension !== dimensionName);
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {connections: {intacct: {config: {mappings: {dimensions: Dimensions}}}}});
}

function prepareOnyxDataForConfigUpdate(policyID: string, settingName: keyof SageIntacctConnectionsConfig, settingValue: string | boolean | null, oldSettingValue?: string | boolean | null) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    intacct: {
                        config: {
                            [settingName]: settingValue,
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

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    intacct: {
                        config: {
                            [settingName]: oldSettingValue ?? null,
                            pendingFields: {
                                [settingName]: null,
                            },
                            errorFields: {
                                [settingName]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    intacct: {
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

function prepareOnyxDataForSyncUpdate(policyID: string, settingName: keyof Connections['intacct']['config']['sync'], settingValue: string | boolean, oldSettingValue?: string | boolean) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    intacct: {
                        config: {
                            sync: {
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

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    intacct: {
                        config: {
                            sync: {
                                [settingName]: oldSettingValue ?? null,
                            },
                            pendingFields: {
                                [settingName]: null,
                            },
                            errorFields: {
                                [settingName]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    intacct: {
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

function prepareOnyxDataForAutoSyncUpdate(policyID: string, settingName: keyof Connections['intacct']['config']['autoSync'], settingValue: boolean) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    intacct: {
                        config: {
                            autoSync: {
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

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    intacct: {
                        config: {
                            autoSync: {
                                [settingName]: !settingValue,
                            },
                            pendingFields: {
                                [settingName]: null,
                            },
                            errorFields: {
                                [settingName]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    intacct: {
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

function updateSageIntacctAutoSync(policyID: string | undefined, enabled: boolean) {
    if (!policyID) {
        return;
    }

    const {optimisticData, failureData, successData} = prepareOnyxDataForAutoSyncUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.AUTO_SYNC_ENABLED, enabled);
    const parameters = {
        policyID,
        enabled,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_AUTO_SYNC, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctImportEmployees(policyID: string | undefined, enabled: boolean) {
    if (!policyID) {
        return;
    }

    const {optimisticData, failureData, successData} = prepareOnyxDataForConfigUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.IMPORT_EMPLOYEES, enabled, !enabled);
    const parameters = {
        policyID,
        enabled,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_IMPORT_EMPLOYEES, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctApprovalMode(policyID: string | undefined, enabled: boolean) {
    if (!policyID) {
        return;
    }

    const approvalModeSettingValue = enabled ? CONST.SAGE_INTACCT.APPROVAL_MODE.APPROVAL_MANUAL : '';
    const oldApprovalModeSettingValue = enabled ? '' : CONST.SAGE_INTACCT.APPROVAL_MODE.APPROVAL_MANUAL;
    const {optimisticData, failureData, successData} = prepareOnyxDataForConfigUpdate(
        policyID,
        CONST.SAGE_INTACCT_CONFIG.APPROVAL_MODE,
        approvalModeSettingValue,
        oldApprovalModeSettingValue,
    );
    const parameters = {
        policyID,
        value: approvalModeSettingValue,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_APPROVAL_MODE, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctSyncReimbursedReports(policyID: string | undefined, enabled: boolean) {
    if (!policyID) {
        return;
    }

    const {optimisticData, failureData, successData} = prepareOnyxDataForSyncUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.SYNC_REIMBURSED_REPORTS, enabled, !enabled);
    const parameters = {
        policyID,
        enabled,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_SYNC_REIMBURSED_REPORTS, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctSyncReimbursementAccountID(policyID: string | undefined, vendorID: string | undefined, oldVendorID?: string) {
    if (!policyID || !vendorID) {
        return;
    }

    const {optimisticData, failureData, successData} = prepareOnyxDataForSyncUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.REIMBURSEMENT_ACCOUNT_ID, vendorID, oldVendorID);
    const parameters = {
        policyID,
        vendorID,
    };

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_SYNC_REIMBURSEMENT_ACCOUNT_ID, parameters, {optimisticData, failureData, successData});
}

function updateSageIntacctEntity(policyID: string | undefined, entity: string, oldEntity: string) {
    if (!policyID) {
        return;
    }

    const parameters = {
        policyID,
        entity,
    };
    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_ENTITY, parameters, prepareOnyxDataForConfigUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.ENTITY, entity, oldEntity));
}

function updateSageIntacctAccountingMethod(
    policyID: string | undefined,
    accountingMethod: ValueOf<typeof COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD>,
    oldAccountingMethod: ValueOf<typeof COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD>,
) {
    if (!policyID) {
        return;
    }

    const parameters: UpdateSageIntacctAccountingMethodParams = {
        policyID,
        accountingMethod,
    };

    const {optimisticData, failureData, successData} = prepareOnyxDataForExportUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.ACCOUNTING_METHOD, accountingMethod, oldAccountingMethod);

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_ACCOUNTING_METHOD, parameters, {optimisticData, failureData, successData});
}

export {
    connectToSageIntacct,
    updateSageIntacctBillable,
    updateSageIntacctSyncTaxConfiguration,
    addSageIntacctUserDimensions,
    updateSageIntacctMappingValue,
    editSageIntacctUserDimensions,
    removeSageIntacctUserDimensions,
    removeSageIntacctUserDimensionsByName,
    updateSageIntacctExporter,
    clearSageIntacctErrorField,
    clearSageIntacctPendingField,
    updateSageIntacctExportDate,
    updateSageIntacctReimbursableExpensesExportDestination,
    updateSageIntacctNonreimbursableExpensesExportDestination,
    updateSageIntacctNonreimbursableExpensesExportAccount,
    updateSageIntacctDefaultVendor,
    updateSageIntacctAutoSync,
    updateSageIntacctImportEmployees,
    updateSageIntacctApprovalMode,
    updateSageIntacctSyncReimbursedReports,
    updateSageIntacctSyncReimbursementAccountID,
    updateSageIntacctEntity,
    updateSageIntacctAccountingMethod,
    changeMappingsValueFromDefaultToTag,
    UpdateSageIntacctTaxSolutionID,
};
