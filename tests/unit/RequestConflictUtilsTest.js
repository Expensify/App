"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_onyx_1 = require("react-native-onyx");
var RequestConflictUtils_1 = require("@libs/actions/RequestConflictUtils");
describe('RequestConflictUtils', function () {
    it.each([['OpenApp'], ['ReconnectApp']])('resolveDuplicationConflictAction when %s do not exist in the queue should push %i', function (command) {
        var persistedRequests = [{ command: 'OpenReport' }, { command: 'AddComment' }, { command: 'CloseAccount' }];
        var commandToFind = command;
        var result = (0, RequestConflictUtils_1.resolveDuplicationConflictAction)(persistedRequests, function (request) { return request.command === commandToFind; });
        expect(result).toEqual({ conflictAction: { type: 'push' } });
    });
    it.each([
        ['OpenApp', 0],
        ['ReconnectApp', 2],
    ])('resolveDuplicationConflictAction when %s exist in the queue should replace at index %i', function (command, index) {
        var persistedRequests = [{ command: 'OpenApp' }, { command: 'AddComment' }, { command: 'ReconnectApp' }];
        var commandToFind = command;
        var result = (0, RequestConflictUtils_1.resolveDuplicationConflictAction)(persistedRequests, function (request) { return request.command === commandToFind; });
        expect(result).toEqual({ conflictAction: { type: 'replace', index: index } });
    });
    it('replaces the first OpenReport command with reportID 1 in case of duplication conflict', function () {
        var persistedRequests = [
            { command: 'OpenApp' },
            { command: 'AddComment' },
            { command: 'OpenReport', data: { reportID: 1 } },
            { command: 'OpenReport', data: { reportID: 2 } },
            { command: 'OpenReport', data: { reportID: 3 } },
            { command: 'ReconnectApp' },
        ];
        var reportID = 1;
        var result = (0, RequestConflictUtils_1.resolveDuplicationConflictAction)(persistedRequests, function (request) { var _a; return request.command === 'OpenReport' && ((_a = request.data) === null || _a === void 0 ? void 0 : _a.reportID) === reportID; });
        expect(result).toEqual({ conflictAction: { type: 'replace', index: 2 } });
    });
    it('resolveCommentDeletionConflicts should return push when no special comments are found', function () {
        var persistedRequests = [{ command: 'OpenReport' }, { command: 'AddComment', data: { reportActionID: 2 } }, { command: 'CloseAccount' }];
        var reportActionID = '1';
        var originalReportID = '1';
        var result = (0, RequestConflictUtils_1.resolveCommentDeletionConflicts)(persistedRequests, reportActionID, originalReportID);
        expect(result).toEqual({ conflictAction: { type: 'push' } });
    });
    it('resolveCommentDeletionConflicts should return delete when special comments are found', function () {
        var persistedRequests = [{ command: 'AddComment', data: { reportActionID: '2' } }, { command: 'CloseAccount' }, { command: 'OpenReport' }];
        var reportActionID = '2';
        var originalReportID = '1';
        var result = (0, RequestConflictUtils_1.resolveCommentDeletionConflicts)(persistedRequests, reportActionID, originalReportID);
        expect(result).toEqual({ conflictAction: { type: 'delete', indices: [0], pushNewRequest: false } });
    });
    it.each([['AddComment'], ['AddAttachment'], ['AddTextAndAttachment']])('resolveCommentDeletionConflicts should return delete when special comments are found and %s is true', function (commandName) {
        var updateSpy = jest.spyOn(react_native_onyx_1.default, 'update');
        var persistedRequests = [
            { command: commandName, data: { reportActionID: '2' } },
            { command: 'UpdateComment', data: { reportActionID: '2' } },
            { command: 'CloseAccount' },
            { command: 'OpenReport' },
        ];
        var reportActionID = '2';
        var originalReportID = '1';
        var result = (0, RequestConflictUtils_1.resolveCommentDeletionConflicts)(persistedRequests, reportActionID, originalReportID);
        expect(result).toEqual({ conflictAction: { type: 'delete', indices: [0, 1], pushNewRequest: false } });
        expect(updateSpy).toHaveBeenCalledTimes(1);
        updateSpy.mockClear();
    });
    it.each([['UpdateComment'], ['AddEmojiReaction'], ['RemoveEmojiReaction']])('resolveCommentDeletionConflicts should return delete when special comments are found and %s is false', function (commandName) {
        var persistedRequests = [{ command: commandName, data: { reportActionID: '2' } }, { command: 'CloseAccount' }, { command: 'OpenReport' }];
        var reportActionID = '2';
        var originalReportID = '1';
        var result = (0, RequestConflictUtils_1.resolveCommentDeletionConflicts)(persistedRequests, reportActionID, originalReportID);
        expect(result).toEqual({ conflictAction: { type: 'delete', indices: [0], pushNewRequest: true } });
    });
    it('resolveCommentDeletionConflicts should return push when an OpenReport as thread is found', function () {
        var reportActionID = '2';
        var persistedRequests = [
            { command: 'CloseAccount' },
            { command: 'AddComment', data: { reportActionID: reportActionID } },
            { command: 'OpenReport', data: { parentReportActionID: reportActionID } },
            { command: 'AddComment', data: { reportActionID: '3' } },
            { command: 'OpenReport' },
        ];
        var originalReportID = '1';
        var result = (0, RequestConflictUtils_1.resolveCommentDeletionConflicts)(persistedRequests, reportActionID, originalReportID);
        expect(result).toEqual({ conflictAction: { type: 'push' } });
    });
    it('resolveEditCommentWithNewAddCommentRequest should return delete and replace when update comment are found and new comment is added', function () {
        var reportActionID = '2';
        var persistedRequests = [
            { command: 'AddComment', data: { reportActionID: reportActionID, reportComment: 'test' } },
            { command: 'UpdateComment', data: { reportActionID: reportActionID, reportComment: 'test edit' } },
            { command: 'UpdateComment', data: { reportActionID: reportActionID, reportComment: 'test edit edit' } },
            { command: 'CloseAccount' },
            { command: 'OpenReport' },
        ];
        var parameters = { reportID: '1', reportActionID: reportActionID, reportComment: 'new edit comment' };
        var addCommentIndex = 0;
        var result = (0, RequestConflictUtils_1.resolveEditCommentWithNewAddCommentRequest)(persistedRequests, parameters, reportActionID, addCommentIndex);
        expect(result).toEqual({
            conflictAction: {
                type: 'delete',
                indices: [1, 2],
                pushNewRequest: false,
                nextAction: {
                    type: 'replace',
                    index: addCommentIndex,
                    request: { command: 'AddComment', data: { reportID: '1', reportActionID: reportActionID, reportComment: 'new edit comment' } },
                },
            },
        });
    });
    it('resolveEditCommentWithNewAddCommentRequest should only replace the add comment with the update comment text when no other update comments are found', function () {
        var reportActionID = '2';
        var persistedRequests = [{ command: 'AddComment', data: { reportActionID: reportActionID, reportComment: 'test' } }, { command: 'CloseAccount' }, { command: 'OpenReport' }];
        var parameters = { reportID: '1', reportActionID: reportActionID, reportComment: 'new edit comment' };
        var addCommentIndex = 0;
        var result = (0, RequestConflictUtils_1.resolveEditCommentWithNewAddCommentRequest)(persistedRequests, parameters, reportActionID, addCommentIndex);
        expect(result).toEqual({
            conflictAction: {
                type: 'replace',
                index: addCommentIndex,
                request: { command: 'AddComment', data: { reportID: '1', reportActionID: reportActionID, reportComment: 'new edit comment' } },
            },
        });
    });
    it.each(RequestConflictUtils_1.enablePolicyFeatureCommand)('resolveEnableFeatureConflicts should return push when the same enable feature API is not found', function (commandName) {
        var persistedRequests = [{ command: commandName, data: { policyID: '1', enabled: true } }];
        var parameters = { policyID: '2', enabled: false };
        var result = (0, RequestConflictUtils_1.resolveEnableFeatureConflicts)(commandName, persistedRequests, parameters);
        expect(result).toEqual({ conflictAction: { type: 'push' } });
    });
    it.each(RequestConflictUtils_1.enablePolicyFeatureCommand)('resolveEnableFeatureConflicts should return delete when the same enable feature API is found', function (commandName) {
        var persistedRequests = [{ command: commandName, data: { policyID: '1', enabled: true } }];
        var parameters = { policyID: '1', enabled: false };
        var result = (0, RequestConflictUtils_1.resolveEnableFeatureConflicts)(commandName, persistedRequests, parameters);
        expect(result).toEqual({
            conflictAction: {
                type: 'delete',
                indices: [0],
                pushNewRequest: false,
            },
        });
    });
});
