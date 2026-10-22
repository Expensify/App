import * as API from '@libs/API';
import type {EnablePolicyTravelParams, SetPolicyTravelMemberAccessParams, SetPolicyTravelMemberRoleParams, SetPolicyTravelSettingsParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import {getObjectKeys} from '@libs/ObjectUtils';
import {canMemberUseTravel, getTravelMemberRole, goBackWhenEnableFeature} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {ErrorFields, PendingFields} from '@src/types/onyx/OnyxCommon';
import type {OnyxData} from '@src/types/onyx/Request';
import {isEmptyValueObject} from '@src/types/utils/EmptyObject';

import type {NullishDeep, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

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

type TravelMemberAccessTarget = {
    /** The member's login, used as the employeeList key. */
    email: string;

    /** The member's accountID, which the server matches the member by. */
    accountID: number;
};

/**
 * Turn travel booking on or off for one or more workspace members. The single command covers both a member's own
 * toggle and the toggle for every member. A workspace where every member can book starts limiting travel to enabled
 * members the first time an admin turns someone off, and the server marks every other member as enabled so their
 * access doesn't change. That switch is applied optimistically too, so the list doesn't flicker while the request runs.
 */
function setPolicyTravelMemberAccess(policy: OnyxEntry<OnyxTypes.Policy>, members: TravelMemberAccessTarget[], enabled: boolean) {
    const policyID = policy?.id;
    if (!policyID) {
        return;
    }
    const isRestricted = !!policy?.travelSettings?.restrictToEnabledMembers;
    const employeeList = policy?.employeeList ?? {};

    const targets = members.filter((member) => !!employeeList[member.email] && canMemberUseTravel(policy, member.email) !== enabled);
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
        employeeListFailureUpdate[target.email] = {
            canUseTravel: employeeList[target.email]?.canUseTravel ?? null,
            pendingFields: {canUseTravel: null},
            errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.editor.genericFailureMessage'),
        };
    }

    if (!isRestricted) {
        const targetEmails = new Set(targets.map((target) => target.email));
        for (const [email, employee] of Object.entries(employeeList)) {
            if (targetEmails.has(email) || isEmptyValueObject(employee)) {
                continue;
            }
            employeeListOptimisticUpdate[email] = {canUseTravel: true};
            employeeListFailureUpdate[email] = {canUseTravel: employee.canUseTravel ?? null};
        }
    }

    const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const;
    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    employeeList: employeeListOptimisticUpdate,
                    ...(!isRestricted && {travelSettings: {restrictToEnabledMembers: true}}),
                },
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
                value: {
                    employeeList: employeeListFailureUpdate,
                    ...(!isRestricted && {travelSettings: {restrictToEnabledMembers: null}}),
                },
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

/**
 * Change members' roles in Expensify Travel. The role is stored on each member even when it matches the role their
 * workspace role gives them, so a later workspace role change does not change their travel role.
 */
function setPolicyTravelMemberRole(policy: OnyxEntry<OnyxTypes.Policy>, members: TravelMemberAccessTarget[], travelRole: ValueOf<typeof CONST.TRAVEL.MEMBER_ROLE>) {
    const policyID = policy?.id;
    const employeeList = policy?.employeeList ?? {};
    const targets = members.filter((member) => !!employeeList[member.email] && getTravelMemberRole(policy, member.email) !== travelRole);
    if (!policyID || targets.length === 0) {
        return;
    }

    const employeeListOptimisticUpdate: Record<string, NullishDeep<OnyxTypes.PolicyEmployee>> = {};
    const employeeListSuccessUpdate: Record<string, NullishDeep<OnyxTypes.PolicyEmployee>> = {};
    const employeeListFailureUpdate: Record<string, NullishDeep<OnyxTypes.PolicyEmployee>> = {};
    for (const target of targets) {
        employeeListOptimisticUpdate[target.email] = {
            travelRole,
            pendingFields: {travelRole: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
        };
        employeeListSuccessUpdate[target.email] = {pendingFields: {travelRole: null}};
        employeeListFailureUpdate[target.email] = {
            travelRole: employeeList[target.email]?.travelRole ?? null,
            pendingFields: {travelRole: null},
            errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.editor.genericFailureMessage'),
        };
    }

    const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const;
    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
        optimisticData: [{onyxMethod: Onyx.METHOD.MERGE, key: policyKey, value: {employeeList: employeeListOptimisticUpdate}}],
        successData: [{onyxMethod: Onyx.METHOD.MERGE, key: policyKey, value: {employeeList: employeeListSuccessUpdate}}],
        failureData: [{onyxMethod: Onyx.METHOD.MERGE, key: policyKey, value: {employeeList: employeeListFailureUpdate}}],
    };

    const parameters: SetPolicyTravelMemberRoleParams = {
        policyID,
        employeeAccountIDList: targets.map((target) => target.accountID).join(','),
        travelRole,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_TRAVEL_MEMBER_ROLE, parameters, onyxData);
}

/** Dismiss the error left on a member after their travel access or travel role failed to update. */
function clearPolicyTravelMemberAccessError(policyID: string, login: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        employeeList: {
            [login]: {errors: null},
        },
    });
}

export {enablePolicyTravel, setPolicyTravelSettings, setPolicyTravelMemberAccess, setPolicyTravelMemberRole, clearPolicyTravelMemberAccessError};
export type {TravelMemberAccessTarget};
