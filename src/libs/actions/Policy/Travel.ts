import * as API from '@libs/API';
import type {EnablePolicyTravelParams, SetPolicyTravelAutoEnableNewMembersParams, SetPolicyTravelMemberAccessParams, SetPolicyTravelSettingsParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import {getObjectKeys} from '@libs/ObjectUtils';
import {goBackWhenEnableFeature} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {ErrorFields, PendingFields} from '@src/types/onyx/OnyxCommon';
import type {OnyxData} from '@src/types/onyx/Request';

import type {NullishDeep, OnyxEntry} from 'react-native-onyx';

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

    // Pending and error state is tracked per setting so that updating one setting does not
    // put every other travel setting's row into a pending or failed state.
    const pendingSettings: PendingFields<keyof OnyxTypes.WorkspaceTravelSettings> = {};
    const clearedSettingFields: Record<string, null> = {};
    const settingErrors: ErrorFields = {};

    for (const key of getObjectKeys(settings)) {
        (revertedSettings as Record<string, unknown>)[key] = previousTravelSettings?.[key] ?? null;
        pendingSettings[key] = CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;
        clearedSettingFields[key] = null;
        settingErrors[key] = ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage');
    }

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    travelSettings: {...previousTravelSettings, ...settings},
                    pendingFields: pendingSettings,
                    errorFields: clearedSettingFields,
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    pendingFields: clearedSettingFields,
                    errorFields: clearedSettingFields,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    travelSettings: revertedSettings,
                    pendingFields: clearedSettingFields,
                    errorFields: settingErrors,
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

/**
 * Sets whether members get travel turned on as soon as they join the workspace. It has its own command so travel admins,
 * who can't save other workspace settings, can change it.
 */
function setPolicyTravelAutoEnableNewMembers(policy: OnyxEntry<OnyxTypes.Policy>, enabled: boolean) {
    if (!policy?.id) {
        return;
    }
    const policyID = policy.id;

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    travelSettings: {autoEnableNewMembers: enabled},
                    pendingFields: {autoEnableNewMembers: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                    errorFields: {autoEnableNewMembers: null},
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    pendingFields: {autoEnableNewMembers: null},
                    errorFields: {autoEnableNewMembers: null},
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    travelSettings: {autoEnableNewMembers: policy.travelSettings?.autoEnableNewMembers ?? null},
                    pendingFields: {autoEnableNewMembers: null},
                    errorFields: {autoEnableNewMembers: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                },
            },
        ],
    };

    const parameters: SetPolicyTravelAutoEnableNewMembersParams = {policyID, enabled};

    API.write(WRITE_COMMANDS.SET_POLICY_TRAVEL_AUTO_ENABLE_NEW_MEMBERS, parameters, onyxData);
}

type TravelMemberAccessTarget = {
    /** The member's login, used as the employeeList key. */
    email: string;

    /** The member's accountID, which the server matches the member by. */
    accountID: number;
};

/** Turn travel booking on or off for one or more workspace members. */
function setPolicyTravelMemberAccess(policy: OnyxEntry<OnyxTypes.Policy>, members: TravelMemberAccessTarget[], enabled: boolean) {
    const policyID = policy?.id;
    if (!policyID) {
        return;
    }
    const employeeList = policy?.employeeList ?? {};

    // Compare with the stored value rather than whether the member can use travel, so turning off a member without a
    // stored value still stores false, the same way the server does
    const targets = members.filter((member) => !!employeeList[member.email] && employeeList[member.email]?.canUseTravel !== enabled);
    if (targets.length === 0) {
        return;
    }

    const employeeListOptimisticUpdate: Record<string, NullishDeep<OnyxTypes.PolicyEmployee>> = {};
    const employeeListSuccessUpdate: Record<string, NullishDeep<OnyxTypes.PolicyEmployee>> = {};
    const employeeListFailureUpdate: Record<string, NullishDeep<OnyxTypes.PolicyEmployee>> = {};
    for (const target of targets) {
        employeeListOptimisticUpdate[target.email] = {
            canUseTravel: enabled,
            pendingFields: {canUseTravel: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
        };
        employeeListSuccessUpdate[target.email] = {pendingFields: {canUseTravel: null}};

        // The update pending action makes dismissing the error clear it, like a failed role change, instead of
        // treating the member as one that failed to be added
        employeeListFailureUpdate[target.email] = {
            canUseTravel: employeeList[target.email]?.canUseTravel ?? null,
            pendingFields: {canUseTravel: null},
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.editor.genericFailureMessage'),
        };
    }

    const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const;
    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {employeeList: employeeListOptimisticUpdate},
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {employeeList: employeeListSuccessUpdate},
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {employeeList: employeeListFailureUpdate},
            },
        ],
    };

    const parameters: SetPolicyTravelMemberAccessParams = {
        policyID,
        employeeAccountIDList: targets.map((target) => target.accountID).join(','),
        enabled,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_TRAVEL_MEMBER_ACCESS, parameters, onyxData);
}

export {enablePolicyTravel, setPolicyTravelSettings, setPolicyTravelAutoEnableNewMembers, setPolicyTravelMemberAccess};
export type {TravelMemberAccessTarget};
