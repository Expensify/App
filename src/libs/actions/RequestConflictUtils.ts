import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {WRITE_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type OnyxRequest from '@src/types/onyx/Request';
import type {ConflictActionData} from '@src/types/onyx/Request';

const addNewMessage = new Set<string>([WRITE_COMMANDS.ADD_COMMENT, WRITE_COMMANDS.ADD_ATTACHMENT, WRITE_COMMANDS.ADD_TEXT_AND_ATTACHMENT]);

const commentsToBeDeleted = new Set<string>([
    WRITE_COMMANDS.ADD_COMMENT,
    WRITE_COMMANDS.ADD_ATTACHMENT,
    WRITE_COMMANDS.ADD_TEXT_AND_ATTACHMENT,
    WRITE_COMMANDS.UPDATE_COMMENT,
    WRITE_COMMANDS.ADD_EMOJI_REACTION,
    WRITE_COMMANDS.REMOVE_EMOJI_REACTION,
]);

/**
 * Resolves duplication conflicts between persisted requests and a given command.
 *
 * This method checks if a specific command exists within a list of persisted requests.
 * - If the command is not found, it suggests adding the command to the list, indicating a 'push' action.
 * - If the command is found, it suggests updating the existing entry, indicating a 'replace' action at the found index.
 */
function resolveDuplicationConflictAction(persistedRequests: OnyxRequest[], commandToFind: WriteCommand): ConflictActionData {
    const index = persistedRequests.findIndex((request) => request.command === commandToFind);
    if (index === -1) {
        return {
            conflictAction: {
                type: 'push',
            },
        };
    }

    return {
        conflictAction: {
            type: 'replace',
            index,
        },
    };
}

function resolveCommentDeletionConflicts(persistedRequests: OnyxRequest[], reportActionID: string, originalReportID: string): ConflictActionData {
    const indices: number[] = [];
    let addCommentFound = false;

    persistedRequests.forEach((request, index) => {
        if (!commentsToBeDeleted.has(request.command) || request.data?.reportActionID !== reportActionID) {
            return;
        }
        if (addNewMessage.has(request.command)) {
            addCommentFound = true;
        }
        indices.push(index);
    });

    if (indices.length === 0) {
        return {
            conflictAction: {
                type: 'push',
            },
        };
    }

    if (addCommentFound) {
        const rollbackData: OnyxUpdate[] = [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`,
                value: {
                    [reportActionID]: null,
                },
            },
        ];
        Onyx.update(rollbackData);
    }

    return {
        conflictAction: {
            type: 'delete',
            indices,
            pushNewRequest: !addCommentFound,
        },
    };
}

export {resolveDuplicationConflictAction, resolveCommentDeletionConflicts};
