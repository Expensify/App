<<<<<<< HEAD
import type {WriteCommand} from '@libs/API/types';
import type OnyxRequest from '@src/types/onyx/Request';
import type {ConflictActionData} from '@src/types/onyx/Request';

/**
 * Resolves duplication conflicts between persisted requests and a given command.
 *
 * This method checks if a specific command exists within a list of persisted requests.
 * - If the command is not found, it suggests adding the command to the list, indicating a 'push' action.
 * - If the command is found, it suggests updating the existing entry, indicating a 'replace' action at the found index.
 */
function resolveDuplicationConflictAction(persistedRequests: OnyxRequest[], commandToFind: WriteCommand): ConflictActionData {
    const index = persistedRequests.findIndex((request) => request.command === commandToFind);
=======
import type OnyxRequest from '@src/types/onyx/Request';
import type {ConflictActionData} from '@src/types/onyx/Request';

type RequestMatcher = (request: OnyxRequest) => boolean;

/**
 * Determines the appropriate action for handling duplication conflicts in persisted requests.
 *
 * This method checks if any request in the list of persisted requests matches the criteria defined by the request matcher function.
 * - If no match is found, it suggests adding the request to the list, indicating a 'push' action.
 * - If a match is found, it suggests updating the existing entry, indicating a 'replace' action at the found index.
 */
function resolveDuplicationConflictAction(persistedRequests: OnyxRequest[], requestMatcher: RequestMatcher): ConflictActionData {
    const index = persistedRequests.findIndex(requestMatcher);
>>>>>>> main
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

export default resolveDuplicationConflictAction;
