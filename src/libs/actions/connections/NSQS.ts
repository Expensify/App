import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import type {PartialDeep, ValueOf} from 'type-fest';
import * as API from '@libs/API';
import type {ConnectPolicyToNSQSParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Connections} from '@src/types/onyx/Policy';

function connectPolicyToNSQS(policyID: string, nsqsAccountID: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
            value: {
                stageInProgress: CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.NSQS_SYNC_CONNECTION,
                connectionName: CONST.POLICY.CONNECTIONS.NAME.NSQS,
                timestamp: new Date().toISOString(),
            },
        },

        // s77rt remove the following optimistic data (for testing only)
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.NSQS]: {
                        lastSync: {
                            isAuthenticationError: false,
                            isSuccessful: true,
                            source: 'DIRECT',
                        },
                        data: {
                            payableList: [],
                        },
                        config: {
                            autoSync: {
                                jobID: '',
                                enabled: true,
                            },
                            syncOptions: {
                                mapping: {
                                    customers: CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT,
                                    projects: CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT,
                                },
                            },
                            currency: 'USD',
                            exporter: '',
                            exportDate: CONST.NSQS_EXPORT_DATE.LAST_EXPENSE,
                            credentials: {
                                accessToken: '',
                                companyID: '',
                                expires: '',
                                scope: '',
                                tokenType: '',
                            },
                            isConfigured: true,
                            approvalAccount: '',
                        },
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
            value: {
                stageInProgress: null,
                connectionName: CONST.POLICY.CONNECTIONS.NAME.NSQS,
                timestamp: new Date().toISOString(),
            },
        },
    ];

    const params: ConnectPolicyToNSQSParams = {
        policyID,
        netSuiteAccountID: nsqsAccountID,
    };

    API.write(WRITE_COMMANDS.CONNECT_POLICY_TO_NSQS, params, {optimisticData});
}

function buildOnyxDataForNSQSConfiguration<TSettingName extends keyof Connections['nsqs']['config']>(
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

function updateNSQSCustomersMapping(policyID: string, mapping: ValueOf<typeof CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES>, oldMapping: ValueOf<typeof CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES>) {
    const onyxData = buildOnyxDataForNSQSConfiguration(
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

    API.write(WRITE_COMMANDS.UPDATE_NSQS_CUSTOMERS_MAPPING, params, onyxData);
}

function updateNSQSProjectsMapping(policyID: string, mapping: ValueOf<typeof CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES>, oldMapping: ValueOf<typeof CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES>) {
    const onyxData = buildOnyxDataForNSQSConfiguration(
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

    API.write(WRITE_COMMANDS.UPDATE_NSQS_PROJECTS_MAPPING, params, onyxData);
}

function updateNSQSExporter(policyID: string, email: string, oldEmail: string) {
    const onyxData = buildOnyxDataForNSQSConfiguration(policyID, 'exporter', email, oldEmail, CONST.NSQS_CONFIG.EXPORTER);

    const params = {
        policyID,
        email,
    };

    API.write(WRITE_COMMANDS.UPDATE_NSQS_EXPORTER, params, onyxData);
}

function updateNSQSExportDate(policyID: string, value: ValueOf<typeof CONST.NSQS_EXPORT_DATE>, oldValue: ValueOf<typeof CONST.NSQS_EXPORT_DATE>) {
    const onyxData = buildOnyxDataForNSQSConfiguration(policyID, 'exportDate', value, oldValue, CONST.NSQS_CONFIG.EXPORT_DATE);

    const params = {
        policyID,
        value,
    };

    API.write(WRITE_COMMANDS.UPDATE_NSQS_EXPORT_DATE, params, onyxData);
}

function updateNSQSAutoSync(policyID: string, enabled: boolean) {
    const onyxData = buildOnyxDataForNSQSConfiguration(policyID, 'autoSync', {enabled}, {enabled: !enabled}, CONST.NSQS_CONFIG.AUTO_SYNC);

    const params = {
        policyID,
        enabled,
    };

    API.write(WRITE_COMMANDS.UPDATE_NSQS_AUTO_SYNC, params, onyxData);
}

function updateNSQSApprovalAccount(policyID: string, value: string, oldValue: string) {
    const onyxData = buildOnyxDataForNSQSConfiguration(policyID, 'approvalAccount', value, oldValue, CONST.NSQS_CONFIG.APPROVAL_ACCOUNT);

    const params = {
        policyID,
        value,
    };

    API.write(WRITE_COMMANDS.UPDATE_NSQS_APPROVAL_ACCOUNT, params, onyxData);
}

export {connectPolicyToNSQS, updateNSQSCustomersMapping, updateNSQSProjectsMapping, updateNSQSExporter, updateNSQSExportDate, updateNSQSAutoSync, updateNSQSApprovalAccount};
