import Onyx from 'react-native-onyx';
import {resolveCommentDeletionConflicts, resolveDuplicationConflictAction} from '@libs/actions/RequestConflictUtils';
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

    it('resolveCommentDeletionConflicts should return push when no special comments are found', () => {
        const persistedRequests = [{command: 'OpenReport'}, {command: 'AddComment', data: {reportActionID: 2}}, {command: 'CloseAccount'}];
        const reportActionID = '1';
        const originalReportID = '1';
        const result = resolveCommentDeletionConflicts(persistedRequests, reportActionID, originalReportID);
        expect(result).toEqual({conflictAction: {type: 'push'}});
    });

    it('resolveCommentDeletionConflicts should return delete when special comments are found', () => {
        const persistedRequests = [{command: 'AddComment', data: {reportActionID: '2'}}, {command: 'CloseAccount'}, {command: 'OpenReport'}];
        const reportActionID = '2';
        const originalReportID = '1';
        const result = resolveCommentDeletionConflicts(persistedRequests, reportActionID, originalReportID);
        expect(result).toEqual({conflictAction: {type: 'delete', indices: [0], pushNewRequest: false}});
    });

    it.each([['AddComment'], ['AddAttachment'], ['AddTextAndAttachment']])(
        'resolveCommentDeletionConflicts should return delete when special comments are found and %s is true',
        (commandName) => {
            const updateSpy = jest.spyOn(Onyx, 'update');
            const persistedRequests = [
                {command: commandName, data: {reportActionID: '2'}},
                {command: 'UpdateComment', data: {reportActionID: '2'}},
                {command: 'CloseAccount'},
                {command: 'OpenReport'},
            ];
            const reportActionID = '2';
            const originalReportID = '1';
            const result = resolveCommentDeletionConflicts(persistedRequests, reportActionID, originalReportID);
            expect(result).toEqual({conflictAction: {type: 'delete', indices: [0, 1], pushNewRequest: false}});
            expect(updateSpy).toHaveBeenCalledTimes(1);
            updateSpy.mockClear();
        },
    );

    it.each([['UpdateComment'], ['AddEmojiReaction'], ['RemoveEmojiReaction']])(
        'resolveCommentDeletionConflicts should return delete when special comments are found and %s is false',
        (commandName) => {
            const persistedRequests = [{command: commandName, data: {reportActionID: '2'}}, {command: 'CloseAccount'}, {command: 'OpenReport'}];
            const reportActionID = '2';
            const originalReportID = '1';
            const result = resolveCommentDeletionConflicts(persistedRequests, reportActionID, originalReportID);
            expect(result).toEqual({conflictAction: {type: 'delete', indices: [0], pushNewRequest: true}});
        },
    );
});
