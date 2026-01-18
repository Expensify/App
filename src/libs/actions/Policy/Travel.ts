import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {EnablePolicyTravelParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import {goBackWhenEnableFeature} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxData} from '@src/types/onyx/Request';

function enablePolicyTravel(policyID: string, enabled: boolean) {
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    isTravelEnabled: enabled,
                    pendingFields: {
                        isTravelEnabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    pendingFields: {
                        isTravelEnabled: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    isTravelEnabled: !enabled,
                    pendingFields: {
                        isTravelEnabled: null,
                    },
                },
            },
        ],
    };

    const parameters: EnablePolicyTravelParams = {policyID, enabled};

    API.writeWithNoDuplicatesEnableFeatureConflicts(WRITE_COMMANDS.ENABLE_POLICY_TRAVEL, parameters, onyxData);

    if (enabled && getIsNarrowLayout()) {
        goBackWhenEnableFeature(policyID);
    }
}

// eslint-disable-next-line import/prefer-default-export
export {enablePolicyTravel};
