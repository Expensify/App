import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {WRITE_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type OnyxRequest from '@src/types/onyx/Request';
import type {ConflictActionData} from '@src/types/onyx/Request';

type RequestMatcher = (request: OnyxRequest) => boolean;

const addNewMessage = new Set<string>([WRITE_COMMANDS.ADD_COMMENT, WRITE_COMMANDS.ADD_ATTACHMENT, WRITE_COMMANDS.ADD_TEXT_AND_ATTACHMENT]);

const commentsToBeDeleted = new Set<string>([
    WRITE_COMMANDS.ADD_COMMENT,
    WRITE_COMMANDS.ADD_ATTACHMENT,
    WRITE_COMMANDS.ADD_TEXT_AND_ATTACHMENT,
    WRITE_COMMANDS.UPDATE_COMMENT,
    WRITE_COMMANDS.ADD_EMOJI_REACTION,
    WRITE_COMMANDS.REMOVE_EMOJI_REACTION,
]);

function createUpdateCommentMatcher(reportActionID: string) {
    return function (request: OnyxRequest) {
        return request.command === WRITE_COMMANDS.UPDATE_COMMENT && request.data?.reportActionID === reportActionID;
    };
}

/**
 * Determines the appropriate action for handling duplication conflicts in persisted requests.
 *
 * This method checks if any request in the list of persisted requests matches the criteria defined by the request matcher function.
 * - If no match is found, it suggests adding the request to the list, indicating a 'push' action.
 * - If a match is found, it suggests updating the existing entry, indicating a 'replace' action at the found index.
 */
function resolveDuplicationConflictAction(persistedRequests: OnyxRequest[], requestMatcher: RequestMatcher): ConflictActionData {
    const index = persistedRequests.findIndex(requestMatcher);
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
    const commentIndicesToDelete: number[] = [];
    const commentCouldBeThread: Record<string, number> = {};
    let addCommentFound = false;
    persistedRequests.forEach((request, index) => {
        // If the request will open a Thread, we should not delete the comment and we should send all the requests
        if (request.command === WRITE_COMMANDS.OPEN_REPORT && request.data?.parentReportActionID === reportActionID && reportActionID in commentCouldBeThread) {
            const indexToRemove = commentCouldBeThread[reportActionID];
            commentIndicesToDelete.splice(indexToRemove, 1);
            // The new message performs some changes in Onyx, we want to keep those changes.
            addCommentFound = false;
            return;
        }

        if (!commentsToBeDeleted.has(request.command) || request.data?.reportActionID !== reportActionID) {
            return;
        }

        // If we find a new message, we probably want to remove it and not perform any request given that the server
        // doesn't know about it yet.
        if (addNewMessage.has(request.command) && !request.isRollbacked) {
            addCommentFound = true;
            commentCouldBeThread[reportActionID] = commentIndicesToDelete.length;
        }
        commentIndicesToDelete.push(index);
    });

    if (commentIndicesToDelete.length === 0) {
        return {
            conflictAction: {
                type: 'push',
            },
        };
    }

    if (addCommentFound) {
        // The new message performs some changes in Onyx, so we need to rollback those changes.
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
            indices: commentIndicesToDelete,
            pushNewRequest: !addCommentFound,
        },
    };
}

export {resolveDuplicationConflictAction, resolveCommentDeletionConflicts, createUpdateCommentMatcher};
