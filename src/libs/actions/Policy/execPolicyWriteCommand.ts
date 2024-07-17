import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {ApiRequestCommandParameters, WriteCommand} from '@libs/API/types';
import * as NetworkStore from '@libs/Network/NetworkStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {OnyxData} from '@src/types/onyx/Request';

let allPolicies: OnyxCollection<Policy>;

Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => (allPolicies = value),
});

function execPolicyWriteCommand<TCommand extends WriteCommand>(commandName: TCommand, params: ApiRequestCommandParameters[TCommand], onyxData: OnyxData = {}, policyID?: string) {
    const extendedParams: (typeof params & {lastModified?: string | number}) | null = params && {...params};
    if (NetworkStore.isOffline() && extendedParams) {
        const respectivePolicyID = policyID ?? (params as {policyID?: string})?.policyID;
        const lastModified = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${respectivePolicyID}`]?.lastModified ?? '1';
        extendedParams.lastModified = lastModified;
    }

    API.write(commandName, extendedParams, onyxData);
}

// eslint-disable-next-line import/prefer-default-export
export default execPolicyWriteCommand;
