import * as API from '@libs/API';
import type {EnablePolicyTravelParams, SetPolicyTravelSettingsParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import {getObjectKeys} from '@libs/ObjectUtils';
import {goBackWhenEnableFeature} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {OnyxData} from '@src/types/onyx/Request';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

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
                    errorFields: {
                        isTravelEnabled: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                    },
                },
            },
        ],
    };

    const parameters: EnablePolicyTravelParams = {policyID, enabled};

    API.writeWithNoDuplicatesEnableFeatureConflicts(WRITE_COMMANDS.ENABLE_POLICY_TRAVEL, parameters, onyxData);

    if (enabled && getIsNarrowLayout()) {
        goBackWhenEnableFeature();
    }
}

function setPolicyTravelSettings(policy: OnyxEntry<OnyxTypes.Policy>, settings: Partial<OnyxTypes.WorkspaceTravelSettings>) {
    if (!policy?.id) {
        return;
    }
    const policyID = policy.id;
    const previousTravelSettings = policy?.travelSettings;

    // Revert each changed key to its prior value, defaulting to null so a key that was absent
    // before the optimistic update (e.g. a toggle that reads as off) is cleared by the merge
    // instead of being left at its optimistic value.
    const revertedSettings: Partial<OnyxTypes.WorkspaceTravelSettings> = {};
    for (const key of getObjectKeys(settings)) {
        (revertedSettings as Record<string, unknown>)[key] = previousTravelSettings?.[key] ?? null;
    }

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    travelSettings: {...previousTravelSettings, ...settings},
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
                    travelSettings: revertedSettings,
                    pendingFields: {
                        travelSettings: null,
                    },
                    errorFields: {
                        travelSettings: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
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
