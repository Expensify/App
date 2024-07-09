import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as API from '@libs/API';
import type {ConnectPolicyToSageIntacctParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {
    SageIntacctConnectiosConfig,
    SageIntacctDimension,
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

function prepareOnyxDataForMappingUpdate(policyID: string, mappingName: keyof SageIntacctMappingType, mappingValue: boolean | SageIntacctMappingValue) {
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

function updateSageIntacctBillable(policyID: string, enabled: boolean) {
    const parameters = {
        policyID,
        enabled,
    };
    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_BILLABLE, parameters, prepareOnyxDataForMappingUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.SYNC_ITEMS, enabled));
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

function updateSageIntacctMappingValue(policyID: string, mappingName: SageIntacctMappingName, mappingValue: SageIntacctMappingValue) {
    const command = getCommandForMapping(mappingName);
    if (!command) {
        return;
    }

    const onyxData = prepareOnyxDataForMappingUpdate(policyID, mappingName, mappingValue);
    API.write(
        command,
        {
            policyID,
            mapping: mappingValue,
        },
        onyxData,
    );
}

function updateSageIntacctSyncTaxConfiguration(policyID: string, enabled: boolean) {
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

function prepareOnyxDataForUserDimensionUpdate(policyID: string, dimensionName: string, newDimensions: SageIntacctDimension[]) {
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
                            pendingFields: {[`dimension_${dimensionName}`]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                            errorFields: {[`dimension_${dimensionName}`]: null},
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
                                dimensions: newDimensions,
                            },
                            pendingFields: {[`dimension_${dimensionName}`]: null},
                            errorFields: {[`dimension_${dimensionName}`]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
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
                            pendingFields: {[`dimension_${dimensionName}`]: null},
                            errorFields: {[`dimension_${dimensionName}`]: null},
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

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_USER_DIMENSION, {policyID, dimensions: newDimensions}, prepareOnyxDataForUserDimensionUpdate(policyID, dimensionName, newDimensions));
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

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_USER_DIMENSION, {policyID, dimensions: newDimensions}, prepareOnyxDataForUserDimensionUpdate(policyID, name, newDimensions));
}

function removeSageIntacctUserDimensions(policyID: string, dimensionName: string, existingUserDimensions: SageIntacctDimension[]) {
    const newDimensions = existingUserDimensions.filter((userDimension) => dimensionName !== userDimension.dimension);

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_USER_DIMENSION, {policyID, dimensions: newDimensions}, prepareOnyxDataForUserDimensionUpdate(policyID, dimensionName, newDimensions));
}

function clearSageIntacctErrorField(policyID: string, key: SageIntacctOfflineStateKeys | keyof SageIntacctConnectiosConfig) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {connections: {intacct: {config: {errorFields: {[key]: null}}}}});
}

export {
    connectToSageIntacct,
    updateSageIntacctBillable,
    updateSageIntacctSyncTaxConfiguration,
    addSageIntacctUserDimensions,
    updateSageIntacctMappingValue,
    editSageIntacctUserDimensions,
    clearSageIntacctErrorField,
    removeSageIntacctUserDimensions,
};
