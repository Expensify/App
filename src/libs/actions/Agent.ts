import {read, write} from '@libs/API';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {AGENT_AVATARS} from '@libs/Avatars/AgentAvatarCatalog';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID} from '@libs/ReportUtils';
import type {AvatarSource} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type PolicyEmployee from '@src/types/onyx/PolicyEmployee';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

import type {OnyxCollection, OnyxCollectionInputValue, OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

function openAgentsPage() {
    const finallyData: Array<OnyxUpdate<typeof ONYXKEYS.ARE_AGENTS_LOADED>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ARE_AGENTS_LOADED,
            value: true,
        },
    ];

    read(READ_COMMANDS.OPEN_AGENTS_PAGE, null, {finallyData});
}

function openProfilePage() {
    read(READ_COMMANDS.OPEN_PROFILE_PAGE, null);
}

function createAgent(
    firstName: string | undefined,
    prompt: string,
    customExpensifyAvatarID?: string,
    file?: File | CustomRNImageManipulatorResult,
    optimisticAvatarURI?: string,
    policyID?: string,
) {
    const optimisticAccountID = Number(generateReportID());

    let avatarURI: string | undefined;
    if (customExpensifyAvatarID) {
        avatarURI = AGENT_AVATARS.resolveURI(customExpensifyAvatarID);
    } else {
        avatarURI = optimisticAvatarURI;
    }

    // Optimistic row for Settings > Agents until CREATE_AGENT responds. Omit `login` (server-assigned).
    const optimisticPersonalDetail = {
        accountID: optimisticAccountID,
        displayName: firstName,
        isOptimisticPersonalDetail: true,
        ...(avatarURI ? {avatar: avatarURI, avatarThumbnail: avatarURI} : {}),
    };

    const optimisticData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {[optimisticAccountID]: optimisticPersonalDetail},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`,
            value: {prompt, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
        },
    ];

    const successData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {[optimisticAccountID]: null},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`,
            value: null,
        },
    ];

    const failureData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {[optimisticAccountID]: optimisticPersonalDetail},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`,
            value: {
                prompt,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                errors: getMicroSecondOnyxErrorWithTranslationKey('agentsPage.error.genericAdd'),
            },
        },
    ];

    write(
        // Flag this as the user's personal agent; the backend makes personal agents a full co-pilot of the creator.
        WRITE_COMMANDS.CREATE_AGENT,
        {firstName, prompt, customExpensifyAvatarID, file, policyID, optimisticAccountID: String(optimisticAccountID), isPersonalAgent: true},
        {optimisticData, successData, failureData},
    );

    return {optimisticAccountID, avatarURI};
}

function clearAgentError(optimisticAccountID: number) {
    Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[optimisticAccountID]: null});
    Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`, null);
}

function clearAgentUpdateError(accountID: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`, {errors: null, nameErrors: null, promptErrors: null, avatarErrors: null});
}

function clearAgentNameUpdateError(accountID: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`, {nameErrors: null});
}

function clearAgentPromptUpdateError(accountID: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`, {promptErrors: null});
}

function clearAgentDeleteError(accountID: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`, {pendingAction: null, errors: null});
}

function updateAgentName(accountID: number, firstName: string, originalFirstName: string) {
    const optimisticData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {[accountID]: {displayName: firstName}},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`,
            value: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, errors: null, nameErrors: null},
        },
    ];

    const successData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`,
            value: {pendingAction: null, nameErrors: null},
        },
    ];

    const failureData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {[accountID]: {displayName: originalFirstName}},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`,
            value: {pendingAction: null, nameErrors: getMicroSecondOnyxErrorWithTranslationKey('agentsPage.error.updateName')},
        },
    ];

    write(WRITE_COMMANDS.UPDATE_AGENT_NAME, {agentAccountID: accountID, firstName}, {optimisticData, successData, failureData});
}

function updateAgentPrompt(accountID: number, prompt: string, originalPrompt: string) {
    const onyxKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`;
    const optimisticData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: onyxKey,
            value: {prompt, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, errors: null},
        },
    ];

    const successData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: onyxKey,
            value: {pendingAction: null, promptErrors: null},
        },
    ];

    const failureData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: onyxKey,
            value: {prompt: originalPrompt, pendingAction: null, promptErrors: getMicroSecondOnyxErrorWithTranslationKey('agentsPage.error.updatePrompt')},
        },
    ];

    write(WRITE_COMMANDS.UPDATE_AGENT_PROMPT, {agentAccountID: accountID, prompt}, {optimisticData, successData, failureData});
}

function clearAgentAvatarUpdateError(accountID: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`, {avatarErrors: null});
}

function updateAgentAvatar(
    accountID: number,
    update: {customExpensifyAvatarID: string; uri: string} | {file: File | CustomRNImageManipulatorResult; uri: string},
    currentAvatar: AvatarSource | undefined,
) {
    const isCustomExpensifyAvatar = 'customExpensifyAvatarID' in update;

    const optimisticData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [accountID]: {
                    avatar: update.uri,
                    avatarThumbnail: update.uri,
                    pendingFields: {avatar: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                    errorFields: {avatar: null},
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`,
            value: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, errors: null, avatarErrors: null},
        },
    ];

    const successData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [accountID]: {
                    pendingFields: {avatar: null},
                    errorFields: {avatar: null},
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`,
            value: {pendingAction: null, avatarErrors: null},
        },
    ];

    const failureData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [accountID]: {
                    avatar: currentAvatar,
                    avatarThumbnail: typeof currentAvatar === 'string' ? currentAvatar : undefined,
                    pendingFields: {avatar: null},
                    errorFields: {avatar: null},
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`,
            value: {pendingAction: null, avatarErrors: getMicroSecondOnyxErrorWithTranslationKey('agentsPage.error.updateAvatar')},
        },
    ];

    const params = isCustomExpensifyAvatar ? {agentAccountID: accountID, customExpensifyAvatarID: update.customExpensifyAvatarID} : {agentAccountID: accountID, file: update.file};

    write(WRITE_COMMANDS.UPDATE_AGENT_AVATAR, params, {optimisticData, successData, failureData});
}

function deleteAgent(accountID: number, agentLogin?: string, allPolicies?: OnyxCollection<Policy>, shouldNavigateBack = true) {
    const optimisticData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`,
            value: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
        },
    ];

    const successData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {[accountID]: null},
        },
    ];

    const failureData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`,
            value: {
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
            },
        },
    ];

    // Mark the agent's row pending-delete on every policy it belongs to so workflow cards render
    // the agent's approver row with strikethrough/RBR while DELETE_AGENT is in flight.
    if (agentLogin && allPolicies) {
        for (const policy of Object.values(allPolicies)) {
            if (!policy?.id || !policy.employeeList?.[agentLogin]) {
                continue;
            }
            const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policy.id}` as const;
            const optimisticEmployees: OnyxCollectionInputValue<PolicyEmployee> = {
                [agentLogin]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
            };
            const successEmployees: OnyxCollectionInputValue<PolicyEmployee> = {[agentLogin]: null};
            const failureEmployees: OnyxCollectionInputValue<PolicyEmployee> = {
                [agentLogin]: {
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            };

            optimisticData.push({onyxMethod: Onyx.METHOD.MERGE, key: policyKey, value: {employeeList: optimisticEmployees}});
            successData.push({onyxMethod: Onyx.METHOD.MERGE, key: policyKey, value: {employeeList: successEmployees}});
            failureData.push({onyxMethod: Onyx.METHOD.MERGE, key: policyKey, value: {employeeList: failureEmployees}});
        }
    }

    write(WRITE_COMMANDS.DELETE_AGENT, {agentAccountID: accountID}, {optimisticData, successData, failureData});
    // Callers that end the copilot session right after deleting (e.g. deleting the agent you're copiloting into)
    // don't want the extra navigation, since the delegate transition resets navigation on its own.
    if (shouldNavigateBack) {
        Navigation.goBack(ROUTES.SETTINGS_AGENTS);
    }
}

export {
    openAgentsPage,
    openProfilePage,
    createAgent,
    clearAgentError,
    clearAgentUpdateError,
    clearAgentNameUpdateError,
    clearAgentPromptUpdateError,
    clearAgentAvatarUpdateError,
    clearAgentDeleteError,
    updateAgentName,
    updateAgentPrompt,
    updateAgentAvatar,
    deleteAgent,
};
