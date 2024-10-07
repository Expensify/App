import resolveDuplicationConflictAction from '@libs/actions/RequestConflictUtils';
import type {WriteCommand} from '@libs/API/types';

describe('RequestConflictUtils', () => {
    it.each([['OpenApp'], ['ReconnectApp']])('resolveDuplicationConflictAction when %s do not exist in the queue should push %i', (command) => {
        const persistedRequests = [{command: 'OpenReport'}, {command: 'AddComment'}, {command: 'CloseAccount'}];
        const commandToFind = command as WriteCommand;
        const result = resolveDuplicationConflictAction(persistedRequests, commandToFind);
        expect(result).toEqual({conflictAction: {type: 'push'}});
    });

    it.each([
        ['OpenApp', 0],
        ['ReconnectApp', 2],
    ])('resolveDuplicationConflictAction when %s exist in the queue should replace at index %i', (command, index) => {
        const persistedRequests = [{command: 'OpenApp'}, {command: 'AddComment'}, {command: 'ReconnectApp'}];
        const commandToFind = command as WriteCommand;
        const result = resolveDuplicationConflictAction(persistedRequests, commandToFind);
        expect(result).toEqual({conflictAction: {type: 'replace', index}});
    });
});
