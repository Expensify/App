/** Actions that connect a workspace to Odoo and update its Odoo settings. */
import {write} from '@libs/API';
import type {ConnectPolicyToOdooParams, UpdateOdooSubsidiaryParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OdooConnectionsConfig} from '@src/types/onyx/Policy';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

function connectToOdoo(policyID: string, odooURL: string, apiKey: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
            value: {
                stageInProgress: CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.ODOO_SYNC_CONNECTION,
                connectionName: CONST.POLICY.CONNECTIONS.NAME.ODOO,
                timestamp: new Date().toISOString(),
            },
        },
    ];
    // A rejected URL or API key never starts a sync, so the progress is cleared instead of left spinning
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
            value: null,
        },
    ];
    const parameters: ConnectPolicyToOdooParams = {
        policyID,
        odooURL,
        apiKey,
    };
    write(WRITE_COMMANDS.CONNECT_POLICY_TO_ODOO, parameters, {optimisticData, failureData});
}

function clearOdooErrorField(policyID: string, fieldName: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        connections: {
            [CONST.POLICY.CONNECTIONS.NAME.ODOO]: {
                config: {errorFields: {[fieldName]: null}},
            },
        },
    });
}

function updateOdooSubsidiary(policyID: string, subsidiaryID: OdooConnectionsConfig['subsidiaryID'], oldSubsidiaryID?: OdooConnectionsConfig['subsidiaryID']) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.ODOO]: {
                        config: {
                            subsidiaryID,
                            pendingFields: {[CONST.ODOO_CONFIG.SUBSIDIARY_ID]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                            errorFields: {[CONST.ODOO_CONFIG.SUBSIDIARY_ID]: null},
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
                    [CONST.POLICY.CONNECTIONS.NAME.ODOO]: {
                        config: {
                            pendingFields: {[CONST.ODOO_CONFIG.SUBSIDIARY_ID]: null},
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
                    [CONST.POLICY.CONNECTIONS.NAME.ODOO]: {
                        config: {
                            subsidiaryID: oldSubsidiaryID ?? null,
                            pendingFields: {[CONST.ODOO_CONFIG.SUBSIDIARY_ID]: null},
                            errorFields: {[CONST.ODOO_CONFIG.SUBSIDIARY_ID]: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                        },
                    },
                },
            },
        },
    ];

    const parameters: UpdateOdooSubsidiaryParams = {
        policyID,
        subsidiaryID,
    };
    write(WRITE_COMMANDS.UPDATE_ODOO_SUBSIDIARY, parameters, {optimisticData, successData, failureData});
}

export {connectToOdoo, clearOdooErrorField, updateOdooSubsidiary};
