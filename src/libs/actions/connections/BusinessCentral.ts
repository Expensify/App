import {write} from '@libs/API';
import type {ConnectPolicyToBusinessCentralParams, UpdateBusinessCentralCompanyParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

type BusinessCentralCredentials = Omit<ConnectPolicyToBusinessCentralParams, 'policyID'>;

function connectToBusinessCentral(policyID: string, credentials: BusinessCentralCredentials) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
            value: {
                stageInProgress: CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.BUSINESS_CENTRAL_SYNC_CONNECTION,
                connectionName: CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL,
                timestamp: new Date().toISOString(),
            },
        },
    ];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
            value: null,
        },
    ];
    const parameters: ConnectPolicyToBusinessCentralParams = {
        policyID,
        tenantID: credentials.tenantID,
        environmentName: credentials.environmentName,
        clientID: credentials.clientID,
        clientSecret: credentials.clientSecret,
    };
    write(WRITE_COMMANDS.CONNECT_POLICY_TO_BUSINESS_CENTRAL, parameters, {optimisticData, failureData});
}

function clearBusinessCentralErrorField(policyID: string, fieldName: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        connections: {
            [CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL]: {
                config: {errorFields: {[fieldName]: null}},
            },
        },
    });
}

function updateBusinessCentralCompany(policyID: string, companyID: string, oldCompanyID?: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL]: {
                        config: {
                            [CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID]: companyID,
                            pendingFields: {
                                [CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID]: null,
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
                    [CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL]: {
                        config: {
                            pendingFields: {
                                [CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID]: null,
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
                    [CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL]: {
                        config: {
                            [CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID]: oldCompanyID ?? null,
                            pendingFields: {
                                [CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID]: null,
                            },
                            errorFields: {
                                [CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID]: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const parameters: UpdateBusinessCentralCompanyParams = {policyID, companyID};
    write(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_COMPANY, parameters, {optimisticData, successData, failureData});
}

export {connectToBusinessCentral, clearBusinessCentralErrorField, updateBusinessCentralCompany};
