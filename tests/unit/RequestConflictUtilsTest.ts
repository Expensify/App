import {
    enablePolicyFeatureCommand,
    resolveCommentDeletionConflicts,
    resolveDetachReceiptConflicts,
    resolveDuplicationConflictAction,
    resolveEditCommentWithNewAddCommentRequest,
    resolveEnableFeatureConflicts,
    resolveOpenReportDuplicationConflictAction,
    resolveReconnectDuplicationConflictAction,
} from '@libs/actions/RequestConflictUtils';
import {WRITE_COMMANDS} from '@libs/API/types';
import type {WriteCommand} from '@libs/API/types';

import type {AnyRequest} from '@src/types/onyx/Request';

import Onyx from 'react-native-onyx';

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

    it.each([
        ['push when accountIDList differs', {emailList: '', accountIDList: '483'}, {emailList: '', accountIDList: ''}, {type: 'noAction'}],
        ['replace when accountIDList matches', {emailList: '', accountIDList: '483'}, {emailList: '', accountIDList: '483'}, {type: 'replace', index: 0}],
        ['replace when optional participant lists are empty', {}, {emailList: '', accountIDList: ''}, {type: 'replace', index: 0}],
    ])('resolveOpenReportDuplicationConflictAction should %s', (_description, queuedData, nextData, expectedConflictAction) => {
        const reportID = '8071514414018373';

        // Given an existing OpenReport request
        const persistedRequests = [
            {
                command: WRITE_COMMANDS.OPEN_REPORT,
                data: {
                    reportID,
                    ...queuedData,
                },
            },
        ];

        // When another OpenReport is queued for the same report
        const result = resolveOpenReportDuplicationConflictAction(persistedRequests, {
            reportID,
            ...nextData,
        });

        // Then the request should only replace when participant identifiers match
        expect(result).toEqual({conflictAction: expectedConflictAction});
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

    it('resolveCommentDeletionConflicts should return push when an OpenReport as thread is found', () => {
        const reportActionID = '2';
        const persistedRequests = [
            {command: 'CloseAccount'},
            {command: 'AddComment', data: {reportActionID}},
            {command: 'OpenReport', data: {parentReportActionID: reportActionID}},
            {command: 'AddComment', data: {reportActionID: '3'}},
            {command: 'OpenReport'},
        ];
        const originalReportID = '1';
        const result = resolveCommentDeletionConflicts(persistedRequests, reportActionID, originalReportID);
        expect(result).toEqual({conflictAction: {type: 'push'}});
    });

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

    it.each(enablePolicyFeatureCommand)('resolveEnableFeatureConflicts should return push when the same enable feature API is not found', (commandName) => {
        const persistedRequests = [{command: commandName, data: {policyID: '1', enabled: true}}];
        const parameters = {policyID: '2', enabled: false};
        const result = resolveEnableFeatureConflicts(commandName, persistedRequests, parameters);
        expect(result).toEqual({conflictAction: {type: 'push'}});
    });

    it.each(enablePolicyFeatureCommand)('resolveEnableFeatureConflicts should return delete when the same enable feature API is found', (commandName) => {
        const persistedRequests = [{command: commandName, data: {policyID: '1', enabled: true}}];
        const parameters = {policyID: '1', enabled: false};
        const result = resolveEnableFeatureConflicts(commandName, persistedRequests, parameters);
        expect(result).toEqual({
            conflictAction: {
                type: 'delete',
                indices: [0],
                pushNewRequest: false,
            },
        });
    });

    describe('resolveOpenReportDuplicationConflictAction', () => {
        it('returns push when no matching OpenReport for the reportID exists in the queue', () => {
            const persistedRequests = [{command: 'OpenApp'}, {command: WRITE_COMMANDS.OPEN_REPORT, data: {reportID: '2'}}];
            const result = resolveOpenReportDuplicationConflictAction(persistedRequests, {reportID: '1'} as never);
            expect(result).toEqual({conflictAction: {type: 'push'}});
        });

        it('returns noAction when the queued OpenReport carries guidedSetupData', () => {
            const persistedRequests = [{command: WRITE_COMMANDS.OPEN_REPORT, data: {reportID: '1', guidedSetupData: '[{}]'}}];
            const result = resolveOpenReportDuplicationConflictAction(persistedRequests, {reportID: '1'} as never);
            expect(result).toEqual({conflictAction: {type: 'noAction'}});
        });

        it('returns noAction when the queued request carries accountIDList but the new one has no participants', () => {
            const persistedRequests = [{command: WRITE_COMMANDS.OPEN_REPORT, data: {reportID: '1', accountIDList: '10,20'}}];
            const result = resolveOpenReportDuplicationConflictAction(persistedRequests, {reportID: '1'} as never);
            expect(result).toEqual({conflictAction: {type: 'noAction'}});
        });

        it('replaces when the new request also carries an accountIDList', () => {
            const persistedRequests = [{command: WRITE_COMMANDS.OPEN_REPORT, data: {reportID: '1', accountIDList: '10,20'}}];
            const result = resolveOpenReportDuplicationConflictAction(persistedRequests, {reportID: '1', accountIDList: '10,20'} as never);
            expect(result).toEqual({conflictAction: {type: 'replace', index: 0}});
        });

        it('replaces when neither queued nor new request has participants', () => {
            const persistedRequests = [{command: 'OpenApp'}, {command: WRITE_COMMANDS.OPEN_REPORT, data: {reportID: '1'}}];
            const result = resolveOpenReportDuplicationConflictAction(persistedRequests, {reportID: '1'} as never);
            expect(result).toEqual({conflictAction: {type: 'replace', index: 1}});
        });

        it('replaces when the queued request has no participants but the new request does', () => {
            const persistedRequests = [{command: WRITE_COMMANDS.OPEN_REPORT, data: {reportID: '1'}}];
            const result = resolveOpenReportDuplicationConflictAction(persistedRequests, {reportID: '1', accountIDList: '10,20'} as never);
            expect(result).toEqual({conflictAction: {type: 'replace', index: 0}});
        });

        it('should return noAction when queued request has participants but new follow-up request has empty participant strings', () => {
            const persistedRequests = [{command: WRITE_COMMANDS.OPEN_REPORT, data: {reportID: '1', accountIDList: '483'}}];
            const result = resolveOpenReportDuplicationConflictAction(persistedRequests, {reportID: '1', emailList: '', accountIDList: ''} as never);
            expect(result).toEqual({conflictAction: {type: 'noAction'}});
        });

        it('should push when accountIDList genuinely differs (distinct active lists)', () => {
            const persistedRequests = [{command: WRITE_COMMANDS.OPEN_REPORT, data: {reportID: '1', accountIDList: '483'}}];
            const result = resolveOpenReportDuplicationConflictAction(persistedRequests, {reportID: '1', accountIDList: '484'} as never);
            expect(result).toEqual({conflictAction: {type: 'push'}});
        });
    });

    describe('resolveDetachReceiptConflicts', () => {
        it('returns push when no replace-receipt requests match transactionID', () => {
            const persistedRequests = [{command: 'OpenReport'}, {command: WRITE_COMMANDS.REPLACE_RECEIPT, data: {transactionID: '2'}}, {command: 'CloseAccount'}];
            const result = resolveDetachReceiptConflicts(persistedRequests, {transactionID: '1'} as never);
            expect(result).toEqual({conflictAction: {type: 'push'}});
        });

        it('returns push when exactly one replace-receipt request matches transactionID', () => {
            const persistedRequests = [{command: WRITE_COMMANDS.REPLACE_RECEIPT, data: {transactionID: '1'}}];
            const result = resolveDetachReceiptConflicts(persistedRequests, {transactionID: '1'} as never);
            expect(result).toEqual({conflictAction: {type: 'push'}});
        });

        it('deletes all but the last matching replace-receipt request and pushes new request', () => {
            const persistedRequests = [
                {command: WRITE_COMMANDS.REPLACE_RECEIPT, data: {transactionID: '1'}},
                {command: 'OpenReport'},
                {command: WRITE_COMMANDS.REPLACE_RECEIPT, data: {transactionID: '1'}},
                {command: WRITE_COMMANDS.REPLACE_RECEIPT, data: {transactionID: '2'}},
                {command: WRITE_COMMANDS.REPLACE_RECEIPT, data: {transactionID: '1'}},
            ];

            const result = resolveDetachReceiptConflicts(persistedRequests, {transactionID: '1'} as never);
            expect(result).toEqual({conflictAction: {type: 'delete', indices: [0, 2], pushNewRequest: true}});
        });
    });

    describe('resolveReconnectDuplicationConflictAction', () => {
        const openApp = (): AnyRequest => ({command: WRITE_COMMANDS.OPEN_APP});
        const fullReconnect = (): AnyRequest => ({command: WRITE_COMMANDS.RECONNECT_APP});
        const incrementalReconnect = (updateIDFrom: number): AnyRequest => ({command: WRITE_COMMANDS.RECONNECT_APP, data: {updateIDFrom}});

        // Redundant incoming reconnect is dropped (noAction); a wider one is pushed. A wider one also
        // deletes a narrower request that is only queued (redundant now), but can't delete an in-flight one.
        const drop = {conflictAction: {type: 'noAction'}};
        const push = {conflictAction: {type: 'push'}};
        const replaceQueued = {conflictAction: {type: 'delete', indices: [0], pushNewRequest: true}};
        it.each([
            ['full', 'full', drop, drop, fullReconnect(), fullReconnect()],
            ['full', 'incremental', drop, drop, fullReconnect(), incrementalReconnect(500)],
            ['incremental(500)', 'incremental(600)', drop, drop, incrementalReconnect(500), incrementalReconnect(600)],
            ['incremental(500)', 'incremental(500)', drop, drop, incrementalReconnect(500), incrementalReconnect(500)],
            ['incremental(500)', 'full', push, replaceQueued, incrementalReconnect(500), fullReconnect()],
            ['incremental(500)', 'incremental(400)', push, replaceQueued, incrementalReconnect(500), incrementalReconnect(400)],
            ['OpenApp', 'incremental', drop, drop, openApp(), incrementalReconnect(500)],
        ])('live %s vs incoming reconnect %s', (_live, _incoming, expectedOngoing, expectedQueued, live: AnyRequest, incoming: AnyRequest) => {
            // Decided against the in-flight (ongoing) request, which can never be deleted.
            expect(resolveReconnectDuplicationConflictAction([], live, incoming)).toEqual(expectedOngoing);
            // And against a waiting-queue request, which a wider incoming one can replace.
            expect(resolveReconnectDuplicationConflictAction([live], null, incoming)).toEqual(expectedQueued);
        });

        // OpenApp only ever appears on the live side here (it covers an incoming reconnect because it
        // re-fetches everything). An incoming OpenApp does not use this resolver: it dedupes through the
        // generic resolveDuplicationConflictAction, covered by the resolveDuplicationConflictAction tests
        // above and end-to-end by "OpenApp should replace same requests" in tests/actions/SessionTest.ts.
        it('pushes when no reconnect-family request is live', () => {
            expect(resolveReconnectDuplicationConflictAction([], null, fullReconnect())).toEqual({conflictAction: {type: 'push'}});
        });

        it('ignores unrelated commands in the queue when deciding coverage', () => {
            const persistedRequests: AnyRequest[] = [{command: 'AddComment'}, {command: 'OpenReport', data: {reportID: '1'}}];
            // No reconnect-family request is live, so an incoming reconnect is pushed.
            expect(resolveReconnectDuplicationConflictAction(persistedRequests, null, fullReconnect())).toEqual({conflictAction: {type: 'push'}});
            // A queued full reconnect alongside unrelated commands still covers an incoming incremental one.
            expect(resolveReconnectDuplicationConflictAction([...persistedRequests, fullReconnect()], null, incrementalReconnect(500))).toEqual({conflictAction: {type: 'noAction'}});
        });
    });
});
