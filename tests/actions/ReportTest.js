import _ from 'underscore';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import moment from 'moment';
import {beforeEach, beforeAll, afterEach, describe, it, expect} from '@jest/globals';
import ONYXKEYS from '../../src/ONYXKEYS';
import CONST from '../../src/CONST';
import * as Report from '../../src/libs/actions/Report';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import PusherHelper from '../utils/PusherHelper';
import * as TestHelper from '../utils/TestHelper';
import Log from '../../src/libs/Log';
import * as PersistedRequests from '../../src/libs/actions/PersistedRequests';
import * as User from '../../src/libs/actions/User';
import * as ReportUtils from '../../src/libs/ReportUtils';
import DateUtils from '../../src/libs/DateUtils';

jest.mock('../../src/libs/actions/Report', () => {
    const originalModule = jest.requireActual('../../src/libs/actions/Report');

    return {
        ...originalModule,
        showReportActionNotification: jest.fn(),
    };
});

describe('actions/Report', () => {
    beforeAll(() => {
        PusherHelper.setup();
        Onyx.init({
            keys: ONYXKEYS,
            registerStorageEventListener: () => {},
        });
    });

    beforeEach(() => Onyx.clear().then(waitForPromisesToResolve));

    afterEach(PusherHelper.teardown);

    it('should store a new report action in Onyx when onyxApiUpdate event is handled via Pusher', () => {
        global.fetch = TestHelper.getGlobalFetchMock();

        const TEST_USER_ACCOUNT_ID = 1;
        const TEST_USER_LOGIN = 'test@test.com';
        const REPORT_ID = 1;
        let reportActionID;
        const REPORT_ACTION = {
            actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
            actorAccountID: TEST_USER_ACCOUNT_ID,
            automatic: false,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            message: [{type: 'COMMENT', html: 'Testing a comment', text: 'Testing a comment', translationKey: ''}],
            person: [{type: 'TEXT', style: 'strong', text: 'Test User'}],
            shouldShow: true,
        };

        let reportActions;
        Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
            callback: (val) => (reportActions = val),
        });

        // Set up Onyx with some test user data
        return TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN)
            .then(() => {
                User.subscribeToUserEvents();
                return waitForPromisesToResolve();
            })
            .then(() => TestHelper.setPersonalDetails(TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID))
            .then(() => {
                // This is a fire and forget response, but once it completes we should be able to verify that we
                // have an "optimistic" report action in Onyx.
                Report.addComment(REPORT_ID, 'Testing a comment');
                return waitForPromisesToResolve();
            })
            .then(() => {
                const resultAction = _.first(_.values(reportActions));
                reportActionID = resultAction.reportActionID;

                expect(resultAction.message).toEqual(REPORT_ACTION.message);
                expect(resultAction.person).toEqual(REPORT_ACTION.person);
                expect(resultAction.pendingAction).toBeNull();

                // We subscribed to the Pusher channel above and now we need to simulate a reportComment action
                // Pusher event so we can verify that action was handled correctly and merged into the reportActions.
                PusherHelper.emitOnyxUpdate([
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`,
                        value: {
                            reportID: REPORT_ID,
                            notificationPreference: 'always',
                            lastVisibleActionCreated: '2022-11-22 03:48:27.267',
                            lastMessageText: 'Testing a comment',
                            lastActorAccountID: TEST_USER_ACCOUNT_ID,
                        },
                    },
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
                        value: {
                            [reportActionID]: {pendingAction: null},
                        },
                    },
                ]);

                // Once a reportComment event is emitted to the Pusher channel we should see the comment get processed
                // by the Pusher callback and added to the storage so we must wait for promises to resolve again and
                // then verify the data is in Onyx.
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Verify there is only one action and our optimistic comment has been removed
                expect(_.size(reportActions)).toBe(1);

                const resultAction = reportActions[reportActionID];

                // Verify that our action is no longer in the loading state
                expect(resultAction.pendingAction).toBeNull();
            });
    });

    it('should update pins in Onyx when togglePinned is called', () => {
        const TEST_USER_ACCOUNT_ID = 1;
        const TEST_USER_LOGIN = 'test@test.com';
        const REPORT_ID = '1';

        let reportIsPinned;
        Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`,
            callback: (val) => (reportIsPinned = lodashGet(val, 'isPinned')),
        });

        // Set up Onyx with some test user data
        return TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN)
            .then(() => {
                Report.togglePinnedState(REPORT_ID, false);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Test that Onyx immediately updated the report pin state.
                expect(reportIsPinned).toEqual(true);
            });
    });

    it('Should not leave duplicate comments when logger sends packet because of calling process queue while processing the queue', () => {
        const TEST_USER_ACCOUNT_ID = 1;
        const TEST_USER_LOGIN = 'test@test.com';
        const REPORT_ID = '1';
        const LOGGER_MAX_LOG_LINES = 50;

        // GIVEN a test user with initial data
        return TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN)
            .then(() => TestHelper.setPersonalDetails(TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID))
            .then(() => {
                global.fetch = TestHelper.getGlobalFetchMock();

                // WHEN we add enough logs to send a packet
                for (let i = 0; i <= LOGGER_MAX_LOG_LINES; i++) {
                    Log.info('Test log info');
                }

                // And leave a comment on a report
                Report.addComment(REPORT_ID, 'Testing a comment');

                // Then we should expect that there is on persisted request
                expect(PersistedRequests.getAll().length).toBe(1);

                // When we wait for the queue to run
                return waitForPromisesToResolve();
            })
            .then(() => {
                // THEN only ONE call to AddComment will happen
                const URL_ARGUMENT_INDEX = 0;
                const addCommentCalls = _.filter(global.fetch.mock.calls, (callArguments) => callArguments[URL_ARGUMENT_INDEX].includes('AddComment'));
                expect(addCommentCalls.length).toBe(1);
            });
    });

    it('should be updated correctly when new comments are added, deleted or marked as unread', () => {
        const REPORT_ID = '1';
        let report;
        let reportActionCreatedDate;
        let currentTime;
        Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`,
            callback: (val) => (report = val),
        });

        let reportActions;
        Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
            callback: (val) => (reportActions = val),
        });

        const USER_1_LOGIN = 'user@test.com';
        const USER_1_ACCOUNT_ID = 1;
        const USER_2_ACCOUNT_ID = 2;
        return Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportName: 'Test', reportID: REPORT_ID})
            .then(() => TestHelper.signInWithTestUser(USER_1_ACCOUNT_ID, USER_1_LOGIN))
            .then(() => {
                // Given a test user that is subscribed to Pusher events
                User.subscribeToUserEvents();
                return waitForPromisesToResolve();
            })
            .then(() => TestHelper.setPersonalDetails(USER_1_LOGIN, USER_1_ACCOUNT_ID))
            .then(() => {
                // When a Pusher event is handled for a new report comment that includes a mention of the current user
                reportActionCreatedDate = DateUtils.getDBTime();
                PusherHelper.emitOnyxUpdate([
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`,
                        value: {
                            reportID: REPORT_ID,
                            notificationPreference: 'always',
                            lastMessageText: 'Comment 1',
                            lastActorAccountID: USER_2_ACCOUNT_ID,
                            lastVisibleActionCreated: reportActionCreatedDate,
                            lastMentionedTime: reportActionCreatedDate,
                            lastReadTime: DateUtils.subtractMillisecondsFromDateTime(reportActionCreatedDate, 1),
                        },
                    },
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
                        value: {
                            1: {
                                actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                                actorAccountID: USER_2_ACCOUNT_ID,
                                automatic: false,
                                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                                message: [{type: 'COMMENT', html: 'Comment 1', text: 'Comment 1'}],
                                person: [{type: 'TEXT', style: 'strong', text: 'Test User'}],
                                shouldShow: true,
                                created: reportActionCreatedDate,
                                reportActionID: '1',
                            },
                        },
                    },
                ]);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Then the report will be unread
                expect(ReportUtils.isUnread(report)).toBe(true);

                // And show a green dot for unread mentions in the LHN
                expect(ReportUtils.isUnreadWithMention(report)).toBe(true);

                // When the user visits the report
                jest.advanceTimersByTime(10);
                currentTime = DateUtils.getDBTime();
                Report.openReport(REPORT_ID);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // The report will be read
                expect(ReportUtils.isUnread(report)).toBe(false);
                expect(moment.utc(report.lastReadTime).valueOf()).toBeGreaterThanOrEqual(moment.utc(currentTime).valueOf());

                // And no longer show the green dot for unread mentions in the LHN
                expect(ReportUtils.isUnreadWithMention(report)).toBe(false);

                // When the user manually marks a message as "unread"
                jest.advanceTimersByTime(10);
                Report.markCommentAsUnread(REPORT_ID, reportActionCreatedDate);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Then the report will be unread and show the green dot for unread mentions in LHN
                expect(ReportUtils.isUnread(report)).toBe(true);
                expect(ReportUtils.isUnreadWithMention(report)).toBe(true);
                expect(report.lastReadTime).toBe(DateUtils.subtractMillisecondsFromDateTime(reportActionCreatedDate, 1));

                // When a new comment is added by the current user
                jest.advanceTimersByTime(10);
                currentTime = DateUtils.getDBTime();
                Report.addComment(REPORT_ID, 'Current User Comment 1');
                return waitForPromisesToResolve();
            })
            .then(() => {
                // The report will be read, the green dot for unread mentions will go away, and the lastReadTime updated
                expect(ReportUtils.isUnread(report)).toBe(false);
                expect(ReportUtils.isUnreadWithMention(report)).toBe(false);
                expect(moment.utc(report.lastReadTime).valueOf()).toBeGreaterThanOrEqual(moment.utc(currentTime).valueOf());
                expect(report.lastMessageText).toBe('Current User Comment 1');

                // When another comment is added by the current user
                jest.advanceTimersByTime(10);
                currentTime = DateUtils.getDBTime();
                Report.addComment(REPORT_ID, 'Current User Comment 2');
                return waitForPromisesToResolve();
            })
            .then(() => {
                // The report will be read and the lastReadTime updated
                expect(ReportUtils.isUnread(report)).toBe(false);
                expect(moment.utc(report.lastReadTime).valueOf()).toBeGreaterThanOrEqual(moment.utc(currentTime).valueOf());
                expect(report.lastMessageText).toBe('Current User Comment 2');

                // When another comment is added by the current user
                jest.advanceTimersByTime(10);
                currentTime = DateUtils.getDBTime();
                Report.addComment(REPORT_ID, 'Current User Comment 3');
                return waitForPromisesToResolve();
            })
            .then(() => {
                // The report will be read and the lastReadTime updated
                expect(ReportUtils.isUnread(report)).toBe(false);
                expect(moment.utc(report.lastReadTime).valueOf()).toBeGreaterThanOrEqual(moment.utc(currentTime).valueOf());
                expect(report.lastMessageText).toBe('Current User Comment 3');

                const USER_1_BASE_ACTION = {
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    actorAccountID: USER_1_ACCOUNT_ID,
                    automatic: false,
                    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                    person: [{type: 'TEXT', style: 'strong', text: 'Test User'}],
                    shouldShow: true,
                    created: DateUtils.getDBTime(Date.now() - 3),
                };

                jest.advanceTimersByTime(10);
                const optimisticReportActions = {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
                    value: {
                        200: {
                            ...USER_1_BASE_ACTION,
                            message: [{type: 'COMMENT', html: 'Current User Comment 1', text: 'Current User Comment 1'}],
                            created: DateUtils.getDBTime(Date.now() - 2),
                            reportActionID: '200',
                        },
                        300: {
                            ...USER_1_BASE_ACTION,
                            message: [{type: 'COMMENT', html: 'Current User Comment 2', text: 'Current User Comment 2'}],
                            created: DateUtils.getDBTime(Date.now() - 1),
                            reportActionID: '300',
                        },
                        400: {
                            ...USER_1_BASE_ACTION,
                            message: [{type: 'COMMENT', html: 'Current User Comment 3', text: 'Current User Comment 3'}],
                            created: DateUtils.getDBTime(),
                            reportActionID: '400',
                        },
                    },
                };
                jest.advanceTimersByTime(10);
                reportActionCreatedDate = DateUtils.getDBTime();
                optimisticReportActions.value[400].created = reportActionCreatedDate;

                // When we emit the events for these pending created actions to update them to not pending
                PusherHelper.emitOnyxUpdate([
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`,
                        value: {
                            reportID: REPORT_ID,
                            notificationPreference: 'always',
                            lastMessageText: 'Current User Comment 3',
                            lastActorAccountID: 1,
                            lastVisibleActionCreated: reportActionCreatedDate,
                            lastReadTime: reportActionCreatedDate,
                        },
                    },
                    optimisticReportActions,
                ]);

                return waitForPromisesToResolve();
            })
            .then(() => {
                // If the user deletes a comment that is before the last read
                Report.deleteReportComment(REPORT_ID, {...reportActions[200]});
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Then no change will occur
                expect(report.lastReadTime).toBe(reportActionCreatedDate);
                expect(ReportUtils.isUnread(report)).toBe(false);

                // When the user manually marks a message as "unread"
                Report.markCommentAsUnread(REPORT_ID, reportActionCreatedDate);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Then we should expect the report to be to be unread
                expect(ReportUtils.isUnread(report)).toBe(true);
                expect(report.lastReadTime).toBe(DateUtils.subtractMillisecondsFromDateTime(reportActionCreatedDate, 1));

                // If the user deletes the last comment after the lastReadTime the lastMessageText will reflect the new last comment
                Report.deleteReportComment(REPORT_ID, {...reportActions[400]});
                return waitForPromisesToResolve();
            })
            .then(() => {
                expect(ReportUtils.isUnread(report)).toBe(false);
                expect(report.lastMessageText).toBe('Current User Comment 2');
            });
    });

    it('Should properly update comment with links', () => {
        /* This tests a variety of scenarios when a user edits a comment.
         * We should generate a link when editing a message unless the link was
         * already in the comment and the user deleted it on purpose.
         */

        // User edits comment to add link
        // We should generate link
        let originalCommentHTML = 'Original Comment';
        let afterEditCommentText = 'Original Comment www.google.com';
        let newCommentHTML = Report.handleUserDeletedLinksInHtml(afterEditCommentText, originalCommentHTML);
        let expectedOutput = 'Original Comment <a href="https://www.google.com" target="_blank" rel="noreferrer noopener">www.google.com</a>';
        expect(newCommentHTML).toBe(expectedOutput);

        // User deletes www.google.com link from comment but keeps link text
        // We should not generate link
        originalCommentHTML = 'Comment <a href="https://www.google.com" target="_blank">www.google.com</a>';
        afterEditCommentText = 'Comment www.google.com';
        newCommentHTML = Report.handleUserDeletedLinksInHtml(afterEditCommentText, originalCommentHTML);
        expectedOutput = 'Comment www.google.com';
        expect(newCommentHTML).toBe(expectedOutput);

        // User Delete only () part of link but leaves the []
        // We should not generate link
        originalCommentHTML = 'Comment <a href="https://www.google.com" target="_blank">www.google.com</a>';
        afterEditCommentText = 'Comment [www.google.com]';
        newCommentHTML = Report.handleUserDeletedLinksInHtml(afterEditCommentText, originalCommentHTML);
        expectedOutput = 'Comment [www.google.com]';
        expect(newCommentHTML).toBe(expectedOutput);

        // User Generates multiple links in one edit
        // We should generate both links
        originalCommentHTML = 'Comment';
        afterEditCommentText = 'Comment www.google.com www.facebook.com';
        newCommentHTML = Report.handleUserDeletedLinksInHtml(afterEditCommentText, originalCommentHTML);
        expectedOutput =
            'Comment <a href="https://www.google.com" target="_blank" rel="noreferrer noopener">www.google.com</a> ' +
            '<a href="https://www.facebook.com" target="_blank" rel="noreferrer noopener">www.facebook.com</a>';
        expect(newCommentHTML).toBe(expectedOutput);

        // Comment has two links but user deletes only one of them
        // Should not generate link again for the deleted one
        originalCommentHTML = 'Comment <a href="https://www.google.com" target="_blank">www.google.com</a>  <a href="https://www.facebook.com" target="_blank">www.facebook.com</a>';
        afterEditCommentText = 'Comment www.google.com  [www.facebook.com](https://www.facebook.com)';
        newCommentHTML = Report.handleUserDeletedLinksInHtml(afterEditCommentText, originalCommentHTML);
        expectedOutput = 'Comment www.google.com  <a href="https://www.facebook.com" target="_blank" rel="noreferrer noopener">www.facebook.com</a>';
        expect(newCommentHTML).toBe(expectedOutput);

        // User edits and replaces comment with a link containing underscores
        // We should generate link
        originalCommentHTML = 'Comment';
        afterEditCommentText = 'https://www.facebook.com/hashtag/__main/?__eep__=6';
        newCommentHTML = Report.handleUserDeletedLinksInHtml(afterEditCommentText, originalCommentHTML);
        expectedOutput = '<a href="https://www.facebook.com/hashtag/__main/?__eep__=6" target="_blank" rel="noreferrer noopener">https://www.facebook.com/hashtag/__main/?__eep__=6</a>';
        expect(newCommentHTML).toBe(expectedOutput);

        // User edits and deletes the link containing underscores
        // We should not generate link
        originalCommentHTML = '<a href="https://www.facebook.com/hashtag/__main/?__eep__=6" target="_blank" rel="noreferrer noopener">https://www.facebook.com/hashtag/__main/?__eep__=6</a>';
        afterEditCommentText = 'https://www.facebook.com/hashtag/__main/?__eep__=6';
        newCommentHTML = Report.handleUserDeletedLinksInHtml(afterEditCommentText, originalCommentHTML);
        expectedOutput = 'https://www.facebook.com/hashtag/__main/?__eep__=6';
        expect(newCommentHTML).toBe(expectedOutput);

        // User edits and replaces comment with a link containing asterisks
        // We should generate link
        originalCommentHTML = 'Comment';
        afterEditCommentText = 'http://example.com/foo/*/bar/*/test.txt';
        newCommentHTML = Report.handleUserDeletedLinksInHtml(afterEditCommentText, originalCommentHTML);
        expectedOutput = '<a href="http://example.com/foo/*/bar/*/test.txt" target="_blank" rel="noreferrer noopener">http://example.com/foo/*/bar/*/test.txt</a>';
        expect(newCommentHTML).toBe(expectedOutput);

        // User edits and deletes the link containing asterisks
        // We should not generate link
        originalCommentHTML = '<a href="http://example.com/foo/*/bar/*/test.txt" target="_blank" rel="noreferrer noopener">http://example.com/foo/*/bar/*/test.txt</a>';
        afterEditCommentText = 'http://example.com/foo/*/bar/*/test.txt';
        newCommentHTML = Report.handleUserDeletedLinksInHtml(afterEditCommentText, originalCommentHTML);
        expectedOutput = 'http://example.com/foo/*/bar/*/test.txt';
        expect(newCommentHTML).toBe(expectedOutput);
    });

    it('should show a notification for report action updates with shouldNotify', () => {
        const TEST_USER_ACCOUNT_ID = 1;
        const REPORT_ID = '1';
        const REPORT_ACTION = {};

        // Setup user and pusher listeners
        return TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID)
            .then(() => {
                User.subscribeToUserEvents();
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Simulate a Pusher Onyx update with a report action with shouldNotify
                PusherHelper.emitOnyxUpdate([
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
                        value: {
                            1: REPORT_ACTION,
                        },
                        shouldNotify: true,
                    },
                ]);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Ensure we show a notification for this new report action
                expect(Report.showReportActionNotification).toBeCalledWith(REPORT_ID, REPORT_ACTION);
            });
    });

    it('should properly toggle reactions on a message', () => {
        global.fetch = TestHelper.getGlobalFetchMock();

        const TEST_USER_ACCOUNT_ID = 1;
        const TEST_USER_LOGIN = 'test@test.com';
        const REPORT_ID = 1;
        const EMOJI_CODE = '👍';
        const EMOJI_SKIN_TONE = 2;
        const EMOJI_NAME = '+1';
        const EMOJI = {
            code: EMOJI_CODE,
            name: EMOJI_NAME,
            types: ['👍🏿', '👍🏾', '👍🏽', '👍🏼', '👍🏻'],
        };

        let reportActions;
        Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
            callback: (val) => (reportActions = val),
        });
        const reportActionsReactions = {};
        Onyx.connect({
            key: ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS,
            callback: (val, key) => {
                reportActionsReactions[key] = val;
            },
        });
        let reportAction;
        let reportActionID;

        // Set up Onyx with some test user data
        return TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN)
            .then(() => {
                User.subscribeToUserEvents();
                return waitForPromisesToResolve();
            })
            .then(() => TestHelper.setPersonalDetails(TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID))
            .then(() => {
                // This is a fire and forget response, but once it completes we should be able to verify that we
                // have an "optimistic" report action in Onyx.
                Report.addComment(REPORT_ID, 'Testing a comment');
                return waitForPromisesToResolve();
            })
            .then(() => {
                reportAction = _.first(_.values(reportActions));
                reportActionID = reportAction.reportActionID;

                // Add a reaction to the comment
                Report.toggleEmojiReaction(REPORT_ID, reportActionID, EMOJI);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Expect the reaction to exist in the reportActionsReactions collection
                expect(reportActionsReactions).toHaveProperty(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`);

                // Expect the reaction to have the emoji on it
                const reportActionReaction = reportActionsReactions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`];
                expect(reportActionReaction).toHaveProperty(EMOJI.name);

                // Expect the emoji to have the user accountID
                const reportActionReactionEmoji = reportActionReaction[EMOJI.name];
                expect(reportActionReactionEmoji.users).toHaveProperty(`${TEST_USER_ACCOUNT_ID}`);

                // Now we remove the reaction
                Report.toggleEmojiReaction(REPORT_ID, reportActionID, EMOJI, reportActionReaction);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Expect the reaction to have null where the users reaction used to be
                expect(reportActionsReactions).toHaveProperty(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`);
                const reportActionReaction = reportActionsReactions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`];
                expect(reportActionReaction[EMOJI.name].users[TEST_USER_ACCOUNT_ID]).toBeNull();
            })
            .then(() => {
                // Add the same reaction to the same report action with a different skintone
                Report.toggleEmojiReaction(REPORT_ID, reportActionID, EMOJI);
                return waitForPromisesToResolve()
                    .then(() => {
                        const reportActionReaction = reportActionsReactions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`];
                        Report.toggleEmojiReaction(REPORT_ID, reportActionID, EMOJI, reportActionReaction, EMOJI_SKIN_TONE);
                        return waitForPromisesToResolve();
                    })
                    .then(() => {
                        // Expect the reaction to exist in the reportActionsReactions collection
                        expect(reportActionsReactions).toHaveProperty(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`);

                        // Expect the reaction to have the emoji on it
                        const reportActionReaction = reportActionsReactions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`];
                        expect(reportActionReaction).toHaveProperty(EMOJI.name);

                        // Expect the emoji to have the user accountID
                        const reportActionReactionEmoji = reportActionReaction[EMOJI.name];
                        expect(reportActionReactionEmoji.users).toHaveProperty(`${TEST_USER_ACCOUNT_ID}`);

                        // Expect two different skintone reactions
                        const reportActionReactionEmojiUserSkinTones = reportActionReactionEmoji.users[TEST_USER_ACCOUNT_ID].skinTones;
                        expect(reportActionReactionEmojiUserSkinTones).toHaveProperty('-1');
                        expect(reportActionReactionEmojiUserSkinTones).toHaveProperty('2');

                        // Now we remove the reaction, and expect that both variations are removed
                        Report.toggleEmojiReaction(REPORT_ID, reportActionID, EMOJI, reportActionReaction);
                        return waitForPromisesToResolve();
                    })
                    .then(() => {
                        // Expect the reaction to have null where the users reaction used to be
                        expect(reportActionsReactions).toHaveProperty(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`);
                        const reportActionReaction = reportActionsReactions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`];
                        expect(reportActionReaction[EMOJI.name].users[TEST_USER_ACCOUNT_ID]).toBeNull();
                    });
            });
    });

    it("shouldn't add the same reaction twice when changing preferred skin color and reaction doesn't support skin colors", () => {
        global.fetch = TestHelper.getGlobalFetchMock();

        const TEST_USER_ACCOUNT_ID = 1;
        const TEST_USER_LOGIN = 'test@test.com';
        const REPORT_ID = 1;
        const EMOJI_CODE = '😄';
        const EMOJI_NAME = 'smile';
        const EMOJI = {
            code: EMOJI_CODE,
            name: EMOJI_NAME,
        };

        let reportActions;
        Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
            callback: (val) => (reportActions = val),
        });
        const reportActionsReactions = {};
        Onyx.connect({
            key: ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS,
            callback: (val, key) => {
                reportActionsReactions[key] = val;
            },
        });

        let resultAction;

        // Set up Onyx with some test user data
        return TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN)
            .then(() => {
                User.subscribeToUserEvents();
                return waitForPromisesToResolve();
            })
            .then(() => TestHelper.setPersonalDetails(TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID))
            .then(() => {
                // This is a fire and forget response, but once it completes we should be able to verify that we
                // have an "optimistic" report action in Onyx.
                Report.addComment(REPORT_ID, 'Testing a comment');
                return waitForPromisesToResolve();
            })
            .then(() => {
                resultAction = _.first(_.values(reportActions));

                // Add a reaction to the comment
                Report.toggleEmojiReaction(REPORT_ID, resultAction.reportActionID, EMOJI, {});
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Now we toggle the reaction while the skin tone has changed.
                // As the emoji doesn't support skin tones, the emoji
                // should get removed instead of added again.
                const reportActionReaction = reportActionsReactions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${resultAction.reportActionID}`];
                Report.toggleEmojiReaction(REPORT_ID, resultAction.reportActionID, EMOJI, reportActionReaction, 2);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Expect the reaction to have null where the users reaction used to be
                expect(reportActionsReactions).toHaveProperty(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${resultAction.reportActionID}`);
                const reportActionReaction = reportActionsReactions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${resultAction.reportActionID}`];
                expect(reportActionReaction[EMOJI.name].users[TEST_USER_ACCOUNT_ID]).toBeNull();
            });
    });
});
