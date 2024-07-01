import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as API from '@libs/API';
import type {ConnectPolicyToSageIntacctParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SageIntacctDimension, SageIntacctMappingType, SageIntacctMappingValue} from '@src/types/onyx/Policy';

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

function prepareOnyxDataForUpdate(policyID: string, mappingName: keyof SageIntacctMappingType, mappingValue: boolean | SageIntacctMappingValue) {
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
                                [mappingName]: mappingValue,
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
                                [mappingName]: mappingValue,
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
        },
    ];

    return {optimisticData, failureData, successData};
}

function updateSageIntacctBillable(policyID: string, enabled: boolean) {
    const parameters = {
        policyID,
        enabled,
    };
    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_BILLABLE, parameters, prepareOnyxDataForUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.SYNC_ITEMS, enabled));
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

function updateSageIntacctMappingValue(policyID: string, mappingName: ValueOf<typeof CONST.SAGE_INTACCT_CONFIG.MAPPINGS>, mappingValue: SageIntacctMappingValue) {
    const command = getCommandForMapping(mappingName);
    if (!command) {
        return;
    }

    const onyxData = prepareOnyxDataForUpdate(policyID, mappingName, mappingValue);
    API.write(
        command,
        {
            policyID,
            mapping: mappingValue,
        },
        onyxData,
    );
}

function clearSageIntacctMappingsErrorField(policyID: string, fieldName: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {connections: {intacct: {config: {mappings: {errorFields: {[fieldName]: null}}}}}});
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
                            tax: {
                                syncTax: enabled,
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
                            tax: {
                                syncTax: enabled,
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
    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_SYNC_TAX_CONFIGURATION, {policyID, enabled}, {optimisticData, failureData, successData});
}

function clearSageIntacctTaxErrorField(policyID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {connections: {intacct: {config: {errorFields: {tax: null}}}}});
}

function addSageIntacctUserDimensions(
    policyID: string,
    name: string,
    mapping: typeof CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.TAG | typeof CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.REPORT_FIELD,
    existingUserDimensions: SageIntacctDimension[],
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
                                dimensions: [...existingUserDimensions, {name, mapping, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}],
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
                                dimensions: [
                                    ...existingUserDimensions,
                                    {name, mapping, pendingAction: null, errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                                ],
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
                                dimensions: [...existingUserDimensions, {name, mapping, pendingAction: null, errors: undefined}],
                            },
                        },
                    },
                },
            },
        },
    ];

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_USER_DIMENSION, {policyID, name, mapping}, {optimisticData, successData, failureData});
}

function editSageIntacctUserDimensions(
    policyID: string,
    previousName: string,
    name: string,
    mapping: typeof CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.TAG | typeof CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.REPORT_FIELD,
    existingUserDimensions: SageIntacctDimension[],
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
                                dimensions: existingUserDimensions.map((userDimension) => {
                                    if (userDimension.name === previousName) {
                                        return {name, mapping, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, errors: undefined};
                                    }
                                    return userDimension;
                                }),
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
                                dimensions: existingUserDimensions.map((userDimension) => {
                                    if (userDimension.name === previousName) {
                                        return {name, mapping, pendingAction: null, errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')};
                                    }
                                    return userDimension;
                                }),
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
                                dimensions: existingUserDimensions.map((userDimension) => {
                                    if (userDimension.name === previousName) {
                                        return {name, mapping, pendingAction: null, errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')};
                                    }
                                    return userDimension;
                                }),
                            },
                        },
                    },
                },
            },
        },
    ];

    API.write(WRITE_COMMANDS.UPDATE_SAGE_INTACCT_USER_DIMENSION, {policyID, name, mapping}, {optimisticData, successData, failureData});
}

function clearSageIntacctUserDimensionErrorField(policyID: string, dimensions: SageIntacctDimension[], dimensionName: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        connections: {
            intacct: {
                config: {
                    mappings: {
                        dimensions: dimensions.map((dimension) => {
                            if (dimension.name === dimensionName) {
                                return {...dimension, errors: undefined};
                            }
                            return dimension;
                        }),
                    },
                },
            },
        },
    });
}

export {
    connectToSageIntacct,
    updateSageIntacctBillable,
    updateSageIntacctSyncTaxConfiguration,
    addSageIntacctUserDimensions,
    updateSageIntacctMappingValue,
    editSageIntacctUserDimensions,
    clearSageIntacctMappingsErrorField,
    clearSageIntacctTaxErrorField,
    clearSageIntacctUserDimensionErrorField,
};
