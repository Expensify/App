import {
    enablePolicyFeatureCommand,
    resolveCommentDeletionConflicts,
    resolveDetachReceiptConflicts,
    resolveDuplicationConflictAction,
    resolveEditCommentWithNewAddCommentRequest,
    resolveEnableFeatureConflicts,
    resolveOpenAppDuplicationConflictAction,
    resolveOpenReportDuplicationConflictAction,
    resolveReconnectDuplicationConflictAction,
} from '@libs/actions/RequestConflictUtils';
import {WRITE_COMMANDS} from '@libs/API/types';

import type {AnyRequest} from '@src/types/onyx/Request';

import type {OnyxKey} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

describe('RequestConflictUtils', () => {
    it.each([['OpenApp'], ['ReconnectApp']])('resolveDuplicationConflictAction when %s do not exist in the queue should push %i', (command) => {
        const persistedRequests = [{command: 'OpenReport'}, {command: 'AddComment'}, {command: 'CloseAccount'}];
        const result = resolveDuplicationConflictAction(persistedRequests, (request) => request.command === command);
        expect(result).toEqual({conflictAction: {type: 'push'}});
    });

    it.each([
        ['OpenApp', 0],
        ['ReconnectApp', 2],
    ])('resolveDuplicationConflictAction when %s exist in the queue should replace at index %i', (command, index) => {
        const persistedRequests = [{command: 'OpenApp'}, {command: 'AddComment'}, {command: 'ReconnectApp'}];
        const result = resolveDuplicationConflictAction(persistedRequests, (request) => request.command === command);
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

    it('resolveEditCommentWithNewAddCommentRequest should drop the queued attachment when the edit removed it', () => {
        const reportActionID = '2';
        const persistedRequests = [{command: 'AddTextAndAttachment', data: {reportActionID, reportComment: 'test', file: {uri: 'blob:local'}, attachmentID: '5'}}, {command: 'OpenReport'}];
        const parameters = {reportID: '1', reportActionID, reportComment: 'attachment removed'};
        const result = resolveEditCommentWithNewAddCommentRequest(persistedRequests, parameters, reportActionID, 0, true);
        expect(result).toEqual({
            conflictAction: {
                type: 'replace',
                index: 0,
                request: {command: 'AddComment', data: {reportID: '1', reportActionID, reportComment: 'attachment removed'}},
            },
        });
    });

    it('resolveEditCommentWithNewAddCommentRequest should rename the queued attachment when the edit renamed it', () => {
        const reportActionID = '2';
        const persistedRequests = [{command: 'AddTextAndAttachment', data: {reportActionID, reportComment: 'test', file: {uri: 'blob:local', name: 'data.csv'}, attachmentID: '5'}}, {command: 'OpenReport'}];
        const parameters = {reportID: '1', reportActionID, reportComment: 'text edited'};
        const result = resolveEditCommentWithNewAddCommentRequest(persistedRequests, parameters, reportActionID, 0, false, 'renamed.csv');
        expect(result).toEqual({
            conflictAction: {
                type: 'replace',
                index: 0,
                request: {
                    command: 'AddTextAndAttachment',
                    data: {reportID: '1', reportActionID, reportComment: 'text edited', file: {uri: 'blob:local', name: 'renamed.csv'}, attachmentID: '5'},
                },
            },
        });
    });

    it('resolveEditCommentWithNewAddCommentRequest should rebuild a renamed File, whose name cannot be reassigned', () => {
        const reportActionID = '2';
        const file = new File(['id,total\n1,2'], 'data.csv', {type: 'text/csv'});
        const queuedRequest = {command: 'AddTextAndAttachment', data: {reportActionID, reportComment: 'test', file, attachmentID: '5'}};
        const persistedRequests = [queuedRequest, {command: 'OpenReport'}];
        const parameters = {reportID: '1', reportActionID, reportComment: 'text edited'};
        resolveEditCommentWithNewAddCommentRequest(persistedRequests, parameters, reportActionID, 0, false, 'renamed.csv');
        const renamedFile = queuedRequest.data.file;

        expect(renamedFile).toBeInstanceOf(File);
        expect(renamedFile.name).toBe('renamed.csv');
        expect(renamedFile.type).toBe('text/csv');
    });

    it('resolveEditCommentWithNewAddCommentRequest should keep the queued attachment when the edit kept it', () => {
        const reportActionID = '2';
        const persistedRequests = [{command: 'AddTextAndAttachment', data: {reportActionID, reportComment: 'test', file: {uri: 'blob:local'}, attachmentID: '5'}}, {command: 'OpenReport'}];
        const parameters = {reportID: '1', reportActionID, reportComment: 'text edited'};
        const result = resolveEditCommentWithNewAddCommentRequest(persistedRequests, parameters, reportActionID, 0);
        expect(result).toEqual({
            conflictAction: {
                type: 'replace',
                index: 0,
                request: {
                    command: 'AddTextAndAttachment',
                    data: {reportID: '1', reportActionID, reportComment: 'text edited', file: {uri: 'blob:local'}, attachmentID: '5'},
                },
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
            const result = resolveOpenReportDuplicationConflictAction<OnyxKey>(persistedRequests, {reportID: '1'});
            expect(result).toEqual({conflictAction: {type: 'push'}});
        });

        it('returns noAction when the queued OpenReport carries guidedSetupData', () => {
            const persistedRequests = [{command: WRITE_COMMANDS.OPEN_REPORT, data: {reportID: '1', guidedSetupData: '[{}]'}}];
            const result = resolveOpenReportDuplicationConflictAction<OnyxKey>(persistedRequests, {reportID: '1'});
            expect(result).toEqual({conflictAction: {type: 'noAction'}});
        });

        it('returns noAction when the queued request carries accountIDList but the new one has no participants', () => {
            const persistedRequests = [{command: WRITE_COMMANDS.OPEN_REPORT, data: {reportID: '1', accountIDList: '10,20'}}];
            const result = resolveOpenReportDuplicationConflictAction<OnyxKey>(persistedRequests, {reportID: '1'});
            expect(result).toEqual({conflictAction: {type: 'noAction'}});
        });

        it('replaces when the new request also carries an accountIDList', () => {
            const persistedRequests = [{command: WRITE_COMMANDS.OPEN_REPORT, data: {reportID: '1', accountIDList: '10,20'}}];
            const result = resolveOpenReportDuplicationConflictAction<OnyxKey>(persistedRequests, {reportID: '1', accountIDList: '10,20'});
            expect(result).toEqual({conflictAction: {type: 'replace', index: 0}});
        });

        it('replaces when neither queued nor new request has participants', () => {
            const persistedRequests = [{command: 'OpenApp'}, {command: WRITE_COMMANDS.OPEN_REPORT, data: {reportID: '1'}}];
            const result = resolveOpenReportDuplicationConflictAction<OnyxKey>(persistedRequests, {reportID: '1'});
            expect(result).toEqual({conflictAction: {type: 'replace', index: 1}});
        });

        it('replaces when the queued request has no participants but the new request does', () => {
            const persistedRequests = [{command: WRITE_COMMANDS.OPEN_REPORT, data: {reportID: '1'}}];
            const result = resolveOpenReportDuplicationConflictAction<OnyxKey>(persistedRequests, {reportID: '1', accountIDList: '10,20'});
            expect(result).toEqual({conflictAction: {type: 'replace', index: 0}});
        });
    });

    describe('resolveDetachReceiptConflicts', () => {
        it('returns push when no replace-receipt requests match transactionID', () => {
            const persistedRequests = [{command: 'OpenReport'}, {command: WRITE_COMMANDS.REPLACE_RECEIPT, data: {transactionID: '2'}}, {command: 'CloseAccount'}];
            const result = resolveDetachReceiptConflicts<OnyxKey>(persistedRequests, {transactionID: '1', reportActionID: '1'});
            expect(result).toEqual({conflictAction: {type: 'push'}});
        });

        it('returns push when exactly one replace-receipt request matches transactionID', () => {
            const persistedRequests = [{command: WRITE_COMMANDS.REPLACE_RECEIPT, data: {transactionID: '1'}}];
            const result = resolveDetachReceiptConflicts<OnyxKey>(persistedRequests, {transactionID: '1', reportActionID: '1'});
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

            const result = resolveDetachReceiptConflicts<OnyxKey>(persistedRequests, {transactionID: '1', reportActionID: '1'});
            expect(result).toEqual({conflictAction: {type: 'delete', indices: [0, 2], pushNewRequest: true}});
        });
    });

    const openApp = (): AnyRequest => ({command: WRITE_COMMANDS.OPEN_APP});
    const fullReconnect = (): AnyRequest => ({command: WRITE_COMMANDS.RECONNECT_APP});
    const drop = {conflictAction: {type: 'noAction'}};
    const push = {conflictAction: {type: 'push'}};

    describe('resolveReconnectDuplicationConflictAction', () => {
        const incrementalReconnect = (updateIDFrom: number): AnyRequest => ({command: WRITE_COMMANDS.RECONNECT_APP, data: {updateIDFrom}});

        // Redundant incoming reconnect is dropped (noAction); a wider one is pushed. A wider one also
        // deletes a narrower request that is only queued (redundant now), but can't delete an in-flight one.
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
        // re-fetches everything). An incoming OpenApp does not use this resolver: it goes through
        // resolveOpenAppDuplicationConflictAction, covered below and end-to-end by "OpenApp should replace
        // same requests" in tests/actions/SessionTest.ts.
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

    describe('resolveOpenAppDuplicationConflictAction', () => {
        const replaceQueued = (index: number) => ({conflictAction: {type: 'replace', index}});
        it.each([
            ['an OpenApp is in flight', [], openApp(), true, drop],
            ['an OpenApp is in flight and the caller opted out', [], openApp(), false, push],
            ['an OpenApp is both in flight and queued', [openApp()], openApp(), true, drop],
            ['only a reconnect is in flight', [], fullReconnect(), true, push],
            ['nothing is live', [], null, true, push],
            ['an OpenApp is queued behind unrelated commands', [{command: 'AddComment'}, openApp()], null, true, replaceQueued(1)],
            ['an OpenApp is queued and the caller opted out', [openApp()], null, false, replaceQueued(0)],
        ])('%s', (_case, persistedRequests: AnyRequest[], ongoingRequest: AnyRequest | null, shouldDedupeWithInFlight: boolean, expected) => {
            expect(resolveOpenAppDuplicationConflictAction(persistedRequests, ongoingRequest, shouldDedupeWithInFlight)).toEqual(expected);
        });
    });
});
