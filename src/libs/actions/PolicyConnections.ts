import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import type {OpenPolicyAccountingPageParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as Policy from '@src/types/onyx/Policy';
import {updateManyPolicyConnectionConfigs} from './connections';
import type {ConnectionNameExceptNetSuite} from './connections';

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

function updateConnectionConfig<TConnectionName extends ConnectionNameExceptNetSuite, TConfigUpdate extends Partial<Policy.Connections[TConnectionName]['config']>>(
    policyID: string,
    connectionName: TConnectionName,
    configUpdate: TConfigUpdate,
    configCurrentData: TConfigUpdate,
) {
    updateManyPolicyConnectionConfigs(policyID, connectionName, configUpdate, configCurrentData);
}

export {openPolicyAccountingPage, updateConnectionConfig};
