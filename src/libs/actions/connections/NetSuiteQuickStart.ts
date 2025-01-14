import Onyx, {OnyxUpdate} from 'react-native-onyx';
import {PartialDeep, ValueOf} from 'type-fest';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {Connections} from '@src/types/onyx/Policy';

function buildOnyxDataForNetSuiteQuickStartConfiguration<TSettingName extends keyof Connections['nsqs']['config']>(
    policyID: string,
    settingName: TSettingName,
    settingValue: PartialDeep<Connections['nsqs']['config'][TSettingName]>,
    oldSettingValue: PartialDeep<Connections['nsqs']['config'][TSettingName]>,
    fieldName: string,
) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.NSQS]: {
                        config: {
                            [settingName]: settingValue ?? null,
                            pendingFields: {
                                [fieldName]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [fieldName]: null,
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
                    [CONST.POLICY.CONNECTIONS.NAME.NSQS]: {
                        config: {
                            [settingName]: oldSettingValue ?? null,
                            pendingFields: {
                                [fieldName]: null,
                            },
                            errorFields: {
                                [fieldName]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
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
                    [CONST.POLICY.CONNECTIONS.NAME.NSQS]: {
                        config: {
                            pendingFields: {
                                [fieldName]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    return {
        optimisticData,
        failureData,
        successData,
    };
}

function updateNetSuiteQuickStartCustomersMapping(
    policyID: string,
    mapping: ValueOf<typeof CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES>,
    oldMapping: ValueOf<typeof CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES>,
) {
    const onyxData = buildOnyxDataForNetSuiteQuickStartConfiguration(
        policyID,
        'syncOptions',
        {mapping: {customers: mapping}},
        {mapping: {customers: oldMapping}},
        CONST.NSQS_CONFIG.SYNC_OPTIONS.MAPPING.CUSTOMERS,
    );

    const params = {
        policyID,
        mapping,
    };

    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_QUICKSTART_CUSTOMERS_MAPPING, params, onyxData);
}

function updateNetSuiteQuickStartProjectsMapping(
    policyID: string,
    mapping: ValueOf<typeof CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES>,
    oldMapping: ValueOf<typeof CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES>,
) {
    const onyxData = buildOnyxDataForNetSuiteQuickStartConfiguration(
        policyID,
        'syncOptions',
        {mapping: {projects: mapping}},
        {mapping: {projects: oldMapping}},
        CONST.NSQS_CONFIG.SYNC_OPTIONS.MAPPING.PROJECTS,
    );

    const params = {
        policyID,
        mapping,
    };

    API.write(WRITE_COMMANDS.UPDATE_NETSUITE_QUICKSTART_PROJECTS_MAPPING, params, onyxData);
}

export {updateNetSuiteQuickStartCustomersMapping, updateNetSuiteQuickStartProjectsMapping};
