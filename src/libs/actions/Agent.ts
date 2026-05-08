import Onyx from 'react-native-onyx';
import {read, write} from '@libs/API';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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

export {openAgentsPage, createAgent, clearAgentError};
