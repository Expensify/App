import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {EnablePolicyTravelParams, SetPolicyTravelSettingsParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import {goBackWhenEnableFeature} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {OnyxData} from '@src/types/onyx/Request';

function enablePolicyTravel(policyID: string, enabled: boolean) {
    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
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

function setPolicyTravelSettings(policyID: string, settings: Partial<OnyxTypes.WorkspaceTravelSettings>) {
    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    travelSettings: settings,
                    pendingFields: {
                        travelSettings: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
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
                        travelSettings: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    pendingFields: {
                        travelSettings: null,
                    },
                },
            },
        ],
    };

    const parameters: SetPolicyTravelSettingsParams = {
        policyID,
        travelSettings: JSON.stringify(settings),
    };

    API.write(WRITE_COMMANDS.SET_POLICY_TRAVEL_SETTINGS, parameters, onyxData);
}

export {enablePolicyTravel, setPolicyTravelSettings};
