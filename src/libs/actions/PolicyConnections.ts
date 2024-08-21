import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import type {OpenPolicyAccountingPageParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';

function openPolicyAccountingPage(policyID: string) {
    const hasConnectionsDataBeenFetchedKey = `${ONYXKEYS.COLLECTION.POLICY_HAS_CONNECTIONS_DATA_BEEN_FETCHED}${policyID}` as const;

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: hasConnectionsDataBeenFetchedKey,
            value: true,
        },
    ];
    const failureData: OnyxUpdate[] = [
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

// More action functions will be added later
// eslint-disable-next-line import/prefer-default-export
export {openPolicyAccountingPage};
