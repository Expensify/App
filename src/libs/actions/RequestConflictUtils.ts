import {WRITE_COMMANDS} from '@libs/API/types';
import type OnyxRequest from '@src/types/onyx/Request';
import type {ConflictActionData} from '@src/types/onyx/Request';

function createUpdateCommentMatcher(reportActionID: string) {
    return function (request: OnyxRequest) {
        return request.command === WRITE_COMMANDS.UPDATE_COMMENT && request.data?.reportActionID === reportActionID;
    };
}

/**
 * Resolves duplication conflicts between persisted requests and a given command.
 *
 * This method checks if a specific command exists within a list of persisted requests.
 * - If the command is not found, it suggests adding the command to the list, indicating a 'push' action.
 * - If the command is found, it suggests updating the existing entry, indicating a 'replace' action at the found index.
 */

type RequestMatcher = (request: OnyxRequest) => boolean;

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

export {resolveDuplicationConflictAction, createUpdateCommentMatcher};
