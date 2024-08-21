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
    const currentTs = new Date().getTime().toString();
    const respectivePolicyID = policyID ?? (params as {policyID?: string})?.policyID;
    const currentPolicyLastModified = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${respectivePolicyID}`]?.lastModified;

    const optimisticData = onyxData.optimisticData ?? [];
    const failureData = onyxData.failureData ?? [];

    if (currentPolicyLastModified) {
        extendedParams.lastModified = currentTs;
        optimisticData.push({
            key: `${ONYXKEYS.COLLECTION.POLICY}${respectivePolicyID}`,
            onyxMethod: Onyx.METHOD.MERGE,
            value: {
                lastModified: currentTs.toString(),
            },
        });
        failureData.push({
            key: `${ONYXKEYS.COLLECTION.POLICY}${respectivePolicyID}`,
            onyxMethod: Onyx.METHOD.MERGE,
            value: {
                lastModified: currentPolicyLastModified,
            },
        });
    }

    API.write(commandName, extendedParams, {
        ...onyxData,
        optimisticData,
        failureData,
    });
}

// eslint-disable-next-line import/prefer-default-export
export default execPolicyWriteCommand;
