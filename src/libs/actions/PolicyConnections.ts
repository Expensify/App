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

/**
 * Marks a policy's connection data as stale for a bounded window, so `usePolicyConnectionsPrefetch` re-reads
 * it the next time the app or the screen regains focus.
 *
 * Call this whenever NewDot hands the user off to an external accounting setup flow. `openPolicyAccountingPage`
 * sets `policyHasConnectionsDataBeenFetched_<policyID>` write-once and nothing invalidates it, so without this
 * marker the client keeps serving the copy it fetched *before* the connection existed and never picks up the
 * config that the setup produces.
 *
 * This is a deadline rather than a one-shot flag on purpose. The sync the setup starts is asynchronous, so the
 * user can be back in NewDot before it lands; a one-shot refresh would then read a connection that is still not
 * configured, consume itself, and leave the stale value in place until a manual re-sync. It also makes the
 * marker immune to the refetch that the still-mounted screen fires the moment it is set — that read is simply
 * one of several attempts within the window rather than the only one.
 */
function markPolicyConnectionsAsStale(policyID: string) {
    Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CONNECTIONS_REFRESH_DEADLINE}${policyID}`, Date.now() + CONST.POLICY.CONNECTIONS.REFRESH_AFTER_SETUP_WINDOW_MS);
}

/** Drops the stale marker set by `markPolicyConnectionsAsStale`, once the refresh has served its purpose or its window has passed. */
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
