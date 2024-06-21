import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SageIntacctMappingType, SageIntacctMappingValue} from '@src/types/onyx/Policy';

function prepareOnyxDataForUpdate(policyID: string, mappingName: keyof SageIntacctMappingType, mappingValue: SageIntacctMappingValue | boolean) {
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
                                    [mappingName]: null,
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

function updateSageIntacctBillable(policyID: string, mappingValue: boolean) {
    const parameters = {
        policyID,
    };
    API.write(WRITE_COMMANDS.UPDATE_POLICY_CONNECTION_CONFIG, parameters, prepareOnyxDataForUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS, mappingValue)); // this will be changed to another API call when BE is ready
}

function updateSageIntacctDepartmentsMapping(policyID: string, mappingValue: SageIntacctMappingValue) {
    const parameters = {
        policyID,
    };
    API.write(WRITE_COMMANDS.UPDATE_POLICY_CONNECTION_CONFIG, parameters, prepareOnyxDataForUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS, mappingValue)); // this will be changed to another API call when BE is ready
}

function updateSageIntacctClassesMapping(policyID: string, mappingValue: SageIntacctMappingValue) {
    const parameters = {
        policyID,
    };
    API.write(WRITE_COMMANDS.UPDATE_POLICY_CONNECTION_CONFIG, parameters, prepareOnyxDataForUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES, mappingValue)); // this will be changed to another API call when BE is ready
}

function updateSageIntacctLocationsMapping(policyID: string, mappingValue: SageIntacctMappingValue) {
    const parameters = {
        policyID,
    };
    API.write(WRITE_COMMANDS.UPDATE_POLICY_CONNECTION_CONFIG, parameters, prepareOnyxDataForUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS, mappingValue)); // this will be changed to another API call when BE is ready
}

function updateSageIntacctCustomersMapping(policyID: string, mappingValue: SageIntacctMappingValue) {
    const parameters = {
        policyID,
    };
    API.write(WRITE_COMMANDS.UPDATE_POLICY_CONNECTION_CONFIG, parameters, prepareOnyxDataForUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS, mappingValue)); // this will be changed to another API call when BE is ready
}

function updateSageIntacctProjectsMapping(policyID: string, mappingValue: SageIntacctMappingValue) {
    const parameters = {
        policyID,
    };
    API.write(WRITE_COMMANDS.UPDATE_POLICY_CONNECTION_CONFIG, parameters, prepareOnyxDataForUpdate(policyID, CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS, mappingValue)); // this will be changed to another API call when BE is ready
}

function getUpdateFunctionForMapping(mappingName: ValueOf<typeof CONST.SAGE_INTACCT_CONFIG.MAPPINGS>) {
    switch (mappingName) {
        case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
            return updateSageIntacctDepartmentsMapping;
        case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
            return updateSageIntacctClassesMapping;
        case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
            return updateSageIntacctCustomersMapping;
        case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
            return updateSageIntacctLocationsMapping;
        case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
            return updateSageIntacctProjectsMapping;
        default:
            return undefined;
    }
}

export {
    updateSageIntacctBillable,
    updateSageIntacctDepartmentsMapping,
    updateSageIntacctClassesMapping,
    updateSageIntacctLocationsMapping,
    updateSageIntacctCustomersMapping,
    updateSageIntacctProjectsMapping,
    getUpdateFunctionForMapping,
};
