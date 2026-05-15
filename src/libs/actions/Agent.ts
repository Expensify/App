import Onyx from 'react-native-onyx';
import {read, write} from '@libs/API';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

function openAgentsPage() {
    read(READ_COMMANDS.OPEN_AGENTS_PAGE, null);
}

function createAgent(firstName: string | undefined, prompt: string, customExpensifyAvatarID?: string) {
    const optimisticAccountID = -Math.round(Math.random() * 1000000);

    const optimisticData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [optimisticAccountID]: {
                    accountID: optimisticAccountID,
                    displayName: firstName,
                    isOptimisticPersonalDetail: true,
                },
            },
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
            value: {
                [optimisticAccountID]: null,
            },
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
            value: {
                [optimisticAccountID]: {
                    accountID: optimisticAccountID,
                    displayName: firstName,
                    isOptimisticPersonalDetail: true,
                },
            },
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

    write(WRITE_COMMANDS.CREATE_AGENT, {firstName, prompt, customExpensifyAvatarID}, {optimisticData, successData, failureData});
}

function clearAgentError(optimisticAccountID: number) {
    Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[optimisticAccountID]: null});
    Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`, null);
}

function clearAgentUpdateError(accountID: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`, {errors: null, nameErrors: null, promptErrors: null});
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
    const optimisticData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`,
            value: {prompt, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, errors: null},
        },
    ];

    const successData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`,
            value: {pendingAction: null, promptErrors: null},
        },
    ];

    const failureData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`,
            value: {prompt: originalPrompt, pendingAction: null, promptErrors: getMicroSecondOnyxErrorWithTranslationKey('agentsPage.error.updatePrompt')},
        },
    ];

    write(WRITE_COMMANDS.UPDATE_AGENT_PROMPT, {agentAccountID: accountID, prompt}, {optimisticData, successData, failureData});
}

function deleteAgent(accountID: number) {
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

    write(WRITE_COMMANDS.DELETE_AGENT, {agentAccountID: accountID}, {optimisticData, successData, failureData});
    Navigation.navigate(ROUTES.SETTINGS_AGENTS);
}

export {
    openAgentsPage,
    createAgent,
    clearAgentError,
    clearAgentUpdateError,
    clearAgentNameUpdateError,
    clearAgentPromptUpdateError,
    clearAgentDeleteError,
    updateAgentName,
    updateAgentPrompt,
    deleteAgent,
};
