import * as API from '@libs/API';
import type {OpenPolicyAccountingPageParams, OpenPolicyHRPageParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as Policy from '@src/types/onyx/Policy';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import type {ConnectionNameExceptNetSuite} from './connections';

import {updateManyPolicyConnectionConfigs} from './connections';

function openPolicyAccountingPage(policyID: string) {
    const hasConnectionsDataBeenFetchedKey = `${ONYXKEYS.COLLECTION.POLICY_HAS_CONNECTIONS_DATA_BEEN_FETCHED}${policyID}` as const;

    const successData: Array<OnyxUpdate<typeof hasConnectionsDataBeenFetchedKey>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: hasConnectionsDataBeenFetchedKey,
            value: true,
        },
    ];
    const failureData: Array<OnyxUpdate<typeof hasConnectionsDataBeenFetchedKey>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: hasConnectionsDataBeenFetchedKey,
            value: false,
        },
    ];

    const parameters: OpenPolicyAccountingPageParams = {
        policyID,
    };

    API.read(READ_COMMANDS.OPEN_POLICY_ACCOUNTING_PAGE, parameters, {
        successData,
        failureData,
    });
}

function markPolicyConnectionsAsStale(policyID: string) {
    Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CONNECTIONS_REFRESH_DEADLINE}${policyID}`, Date.now() + CONST.POLICY.CONNECTIONS.REFRESH_AFTER_SETUP_WINDOW_MS);
}

function clearPolicyConnectionsStaleMarker(policyID: string) {
    Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CONNECTIONS_REFRESH_DEADLINE}${policyID}`, null);
}

function openPolicyHRPage(policyID: string) {
    const hasConnectionsDataBeenFetchedKey = `${ONYXKEYS.COLLECTION.POLICY_HAS_CONNECTIONS_DATA_BEEN_FETCHED}${policyID}` as const;

    const successData: Array<OnyxUpdate<typeof hasConnectionsDataBeenFetchedKey>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: hasConnectionsDataBeenFetchedKey,
            value: true,
        },
    ];
    const failureData: Array<OnyxUpdate<typeof hasConnectionsDataBeenFetchedKey>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: hasConnectionsDataBeenFetchedKey,
            value: false,
        },
    ];

    const parameters: OpenPolicyHRPageParams = {
        policyID,
    };

    API.read(READ_COMMANDS.OPEN_POLICY_HR_PAGE, parameters, {
        successData,
        failureData,
    });
}

function updateConnectionConfig<TConnectionName extends ConnectionNameExceptNetSuite, TConfigUpdate extends Partial<Policy.Connections[TConnectionName]['config']>>(
    policyID: string,
    connectionName: TConnectionName,
    configUpdate: TConfigUpdate,
    configCurrentData: TConfigUpdate,
) {
    updateManyPolicyConnectionConfigs(policyID, connectionName, configUpdate, configCurrentData);
}

export {openPolicyAccountingPage, openPolicyHRPage, updateConnectionConfig, markPolicyConnectionsAsStale, clearPolicyConnectionsStaleMarker};
