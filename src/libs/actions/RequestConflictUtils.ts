import type {WriteCommand} from '@libs/API/types';
import type OnyxRequest from '@src/types/onyx/Request';
import type {ConflictActionData} from '@src/types/onyx/Request';

function resolveDuplicationConflictAction(persistedRequests: OnyxRequest[], commandToFind: WriteCommand): ConflictActionData {
    console.log('resolveDuplicationConflictAction -> ', commandToFind);
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

export {resolveDuplicationConflictAction};
