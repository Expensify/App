import Onyx from 'react-native-onyx';
import {resolveCommentDeletionConflicts, resolveDuplicationConflictAction, resolveEditCommentWithNewAddCommentRequest} from '@libs/actions/RequestConflictUtils';
import type {WriteCommand} from '@libs/API/types';

describe('RequestConflictUtils', () => {
    it.each([['OpenApp'], ['ReconnectApp']])('resolveDuplicationConflictAction when %s do not exist in the queue should push %i', (command) => {
        const persistedRequests = [{command: 'OpenReport'}, {command: 'AddComment'}, {command: 'CloseAccount'}];
        const commandToFind = command as WriteCommand;
        const result = resolveDuplicationConflictAction(persistedRequests, (request) => request.command === commandToFind);
        expect(result).toEqual({conflictAction: {type: 'push'}});
    });

    it.each([
        ['OpenApp', 0],
        ['ReconnectApp', 2],
    ])('resolveDuplicationConflictAction when %s exist in the queue should replace at index %i', (command, index) => {
        const persistedRequests = [{command: 'OpenApp'}, {command: 'AddComment'}, {command: 'ReconnectApp'}];
        const commandToFind = command as WriteCommand;
        const result = resolveDuplicationConflictAction(persistedRequests, (request) => request.command === commandToFind);
        expect(result).toEqual({conflictAction: {type: 'replace', index}});
    });

    it('replaces the first OpenReport command with reportID 1 in case of duplication conflict', () => {
        const persistedRequests = [
            {command: 'OpenApp'},
            {command: 'AddComment'},
            {command: 'OpenReport', data: {reportID: 1}},
            {command: 'OpenReport', data: {reportID: 2}},
            {command: 'OpenReport', data: {reportID: 3}},
            {command: 'ReconnectApp'},
        ];
        const reportID = 1;
        const result = resolveDuplicationConflictAction(persistedRequests, (request) => request.command === 'OpenReport' && request.data?.reportID === reportID);
        expect(result).toEqual({conflictAction: {type: 'replace', index: 2}});
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

    it('resolveEditCommentWithNewAddCommentRequest should return delete and replace when update comment are found and new comment is added', () => {
        const reportActionID = '2';
        const persistedRequests = [
            {command: 'AddComment', data: {reportActionID, reportComment: 'test'}},
            {command: 'UpdateComment', data: {reportActionID, reportComment: 'test edit'}},
            {command: 'UpdateComment', data: {reportActionID, reportComment: 'test edit edit'}},
            {command: 'CloseAccount'},
            {command: 'OpenReport'},
        ];
        const parameters = {reportID: '1', reportActionID, reportComment: 'new edit comment'};
        const addCommentIndex = 0;
        const result = resolveEditCommentWithNewAddCommentRequest(persistedRequests, parameters, reportActionID, addCommentIndex);
        expect(result).toEqual({
            conflictAction: {
                type: 'delete',
                indices: [1, 2],
                pushNewRequest: false,
                nextAction: {
                    type: 'replace',
                    index: addCommentIndex,
                    request: {command: 'AddComment', data: {reportID: '1', reportActionID, reportComment: 'new edit comment'}},
                },
            },
        });
    });

    it('resolveEditCommentWithNewAddCommentRequest should only replace the add comment with the update comment text when no other update comments are found', () => {
        const reportActionID = '2';
        const persistedRequests = [{command: 'AddComment', data: {reportActionID, reportComment: 'test'}}, {command: 'CloseAccount'}, {command: 'OpenReport'}];
        const parameters = {reportID: '1', reportActionID, reportComment: 'new edit comment'};
        const addCommentIndex = 0;
        const result = resolveEditCommentWithNewAddCommentRequest(persistedRequests, parameters, reportActionID, addCommentIndex);
        expect(result).toEqual({
            conflictAction: {
                type: 'replace',
                index: addCommentIndex,
                request: {command: 'AddComment', data: {reportID: '1', reportActionID, reportComment: 'new edit comment'}},
            },
        });
    });
});
