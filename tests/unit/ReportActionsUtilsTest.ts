import Onyx from 'react-native-onyx';
import CONST from '../../src/CONST';
import * as ReportActionsUtils from '../../src/libs/ReportActionsUtils';
import ONYXKEYS from '../../src/ONYXKEYS';
import type {Report, ReportAction} from '../../src/types/onyx';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

describe('ReportActionsUtils', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
            safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        }),
    );

    beforeEach(() => {
        // Wrap Onyx each onyx action with waitForBatchedUpdates
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        // Initialize the network key for OfflineWithFeedback
        return Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
    });

    // Clear out Onyx after each test so that each test starts with a clean slate
    afterEach(() => {
        Onyx.clear();
    });

    describe('getSortedReportActions', () => {
        const cases = [
            [
                [
                    // This is the highest created timestamp, so should appear last
                    {
                        created: '2022-11-09 22:27:01.825',
                        reportActionID: '8401445780099176',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:27:01.600',
                        reportActionID: '6401435781022176',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },

                    // These reportActions were created in the same millisecond so should appear ordered by reportActionID
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '2962390724708756',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '1609646094152486',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '1661970171066218',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                ],
                [
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '1609646094152486',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '1661970171066218',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '2962390724708756',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:27:01.600',
                        reportActionID: '6401435781022176',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:27:01.825',
                        reportActionID: '8401445780099176',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                ],
            ],
            [
                [
                    // Given three reportActions with the same timestamp
                    {
                        created: '2023-01-10 22:25:47.132',
                        reportActionID: '3',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2023-01-10 22:25:47.132',
                        reportActionID: '2',
                        actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2023-01-10 22:25:47.132',
                        reportActionID: '1',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                ],
                [
                    // The CREATED action should appear first, then we should sort by reportActionID
                    {
                        created: '2023-01-10 22:25:47.132',
                        reportActionID: '2',
                        actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2023-01-10 22:25:47.132',
                        reportActionID: '1',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2023-01-10 22:25:47.132',
                        reportActionID: '3',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                ],
            ],
        ];

        test.each(cases)('sorts by created, then actionName, then reportActionID', (input, expectedOutput) => {
            const result = ReportActionsUtils.getSortedReportActions(input);
            expect(result).toStrictEqual(expectedOutput);
        });

        test.each(cases)('in descending order', (input, expectedOutput) => {
            const result = ReportActionsUtils.getSortedReportActions(input, true);
            expect(result).toStrictEqual(expectedOutput.reverse());
        });
    });

    describe('getSortedReportActionsForDisplay', () => {
        it('should filter out non-whitelisted actions', () => {
            const input: ReportAction[] = [
                {
                    created: '2022-11-13 22:27:01.825',
                    reportActionID: '8401445780099176',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-12 22:27:01.825',
                    reportActionID: '6401435781022176',
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-11 22:27:01.825',
                    reportActionID: '2962390724708756',
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    originalMessage: {
                        amount: 0,
                        currency: 'USD',
                        type: 'split', // change to const
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-10 22:27:01.825',
                    reportActionID: '1609646094152486',
                    actionName: CONST.REPORT.ACTIONS.TYPE.RENAMED,
                    originalMessage: {
                        html: 'Hello world',
                        lastModified: '2022-11-10 22:27:01.825',
                        oldName: 'old name',
                        newName: 'new name',
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-09 22:27:01.825',
                    reportActionID: '8049485084562457',
                    actionName: CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG.UPDATE_FIELD,
                    originalMessage: {},
                    message: [{html: 'updated the Approval Mode from "Submit and Approve" to "Submit and Close"', type: 'Action type', text: 'Action text'}],
                },
                {
                    created: '2022-11-08 22:27:06.825',
                    reportActionID: '1661970171066216',
                    actionName: CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENTQUEUED,
                    originalMessage: {
                        paymentType: 'ACH',
                    },
                    message: [{html: 'Waiting for the bank account', type: 'Action type', text: 'Action text'}],
                },
                {
                    created: '2022-11-06 22:27:08.825',
                    reportActionID: '1661970171066220',
                    actionName: CONST.REPORT.ACTIONS.TYPE.TASKEDITED,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [{html: 'I have changed the task', type: 'Action type', text: 'Action text'}],
                },
            ];

            const result = ReportActionsUtils.getSortedReportActionsForDisplay(input);
            expect(result).toStrictEqual(input);
        });

        it('should filter out closed actions', () => {
            const input: ReportAction[] = [
                {
                    created: '2022-11-13 22:27:01.825',
                    reportActionID: '8401445780099176',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-12 22:27:01.825',
                    reportActionID: '6401435781022176',
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-11 22:27:01.825',
                    reportActionID: '2962390724708756',
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    originalMessage: {
                        amount: 0,
                        currency: 'USD',
                        type: 'split', // change to const
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-10 22:27:01.825',
                    reportActionID: '1609646094152486',
                    actionName: CONST.REPORT.ACTIONS.TYPE.RENAMED,
                    originalMessage: {
                        html: 'Hello world',
                        lastModified: '2022-11-10 22:27:01.825',
                        oldName: 'old name',
                        newName: 'new name',
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-09 22:27:01.825',
                    reportActionID: '1661970171066218',
                    actionName: CONST.REPORT.ACTIONS.TYPE.CLOSED,
                    originalMessage: {
                        policyName: 'default', // change to const
                        reason: 'default', // change to const
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
            ];
            const result = ReportActionsUtils.getSortedReportActionsForDisplay(input);
            input.pop();
            expect(result).toStrictEqual(input);
        });

        it('should filter out deleted, non-pending comments', () => {
            const input: ReportAction[] = [
                {
                    created: '2022-11-13 22:27:01.825',
                    reportActionID: '8401445780099176',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    created: '2022-11-12 22:27:01.825',
                    reportActionID: '8401445780099175',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [{html: '', type: 'Action type', text: 'Action text'}],
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
                {
                    created: '2022-11-11 22:27:01.825',
                    reportActionID: '8401445780099174',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [{html: '', type: 'Action type', text: 'Action text'}],
                },
            ];
            const result = ReportActionsUtils.getSortedReportActionsForDisplay(input);
            input.pop();
            expect(result).toStrictEqual(input);
        });
    });
    describe('getContinuousReportActionChain', () => {
        it('given an input ID of 1, ..., 7 it will return the report actions with id 1 - 7', () => {
            const input: ReportAction[] = [
                // Given these sortedReportActions
                {
                    reportActionID: '1',
                    previousReportActionID: undefined,
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '2',
                    previousReportActionID: '1',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '3',
                    previousReportActionID: '2',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '4',
                    previousReportActionID: '3',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '5',
                    previousReportActionID: '4',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '6',
                    previousReportActionID: '5',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '7',
                    previousReportActionID: '6',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },

                // Note: there's a "gap" here because the previousReportActionID (8) does not match the ID of the previous reportAction in the array (7)
                {
                    reportActionID: '9',
                    previousReportActionID: '8',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '10',
                    previousReportActionID: '9',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '11',
                    previousReportActionID: '10',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '12',
                    previousReportActionID: '11',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },

                // Note: another gap
                {
                    reportActionID: '14',
                    previousReportActionID: '13',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '15',
                    previousReportActionID: '14',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '16',
                    previousReportActionID: '15',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '17',
                    previousReportActionID: '16',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
            ];

            const expectedResult = [
                {
                    reportActionID: '1',
                    previousReportActionID: undefined,
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '2',
                    previousReportActionID: '1',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '3',
                    previousReportActionID: '2',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '4',
                    previousReportActionID: '3',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '5',
                    previousReportActionID: '4',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '6',
                    previousReportActionID: '5',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '7',
                    previousReportActionID: '6',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
            ];
            // Reversing the input array to simulate descending order sorting as per our data structure
            const result = ReportActionsUtils.getContinuousReportActionChain(input.reverse(), '3');
            input.pop();
            expect(result).toStrictEqual(expectedResult.reverse());
        });

        it('given an input ID of 9, ..., 12 it will return the report actions with id 9 - 12', () => {
            const input: ReportAction[] = [
                // Given these sortedReportActions
                {
                    reportActionID: '1',
                    previousReportActionID: undefined,
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '2',
                    previousReportActionID: '1',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '3',
                    previousReportActionID: '2',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '4',
                    previousReportActionID: '3',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '5',
                    previousReportActionID: '4',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '6',
                    previousReportActionID: '5',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '7',
                    previousReportActionID: '6',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },

                // Note: there's a "gap" here because the previousReportActionID (8) does not match the ID of the previous reportAction in the array (7)
                {
                    reportActionID: '9',
                    previousReportActionID: '8',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '10',
                    previousReportActionID: '9',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '11',
                    previousReportActionID: '10',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '12',
                    previousReportActionID: '11',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },

                // Note: another gap
                {
                    reportActionID: '14',
                    previousReportActionID: '13',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '15',
                    previousReportActionID: '14',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '16',
                    previousReportActionID: '15',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '17',
                    previousReportActionID: '16',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
            ];

            const expectedResult = [
                {
                    reportActionID: '9',
                    previousReportActionID: '8',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '10',
                    previousReportActionID: '9',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '11',
                    previousReportActionID: '10',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '12',
                    previousReportActionID: '11',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
            ];
            // Reversing the input array to simulate descending order sorting as per our data structure
            const result = ReportActionsUtils.getContinuousReportActionChain(input.reverse(), '10');
            input.pop();
            expect(result).toStrictEqual(expectedResult.reverse());
        });

        it('given an input ID of 14, ..., 17 it will return the report actions with id 14 - 17', () => {
            const input = [
                // Given these sortedReportActions
                {
                    reportActionID: '1',
                    previousReportActionID: undefined,
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '2',
                    previousReportActionID: '1',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '3',
                    previousReportActionID: '2',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '4',
                    previousReportActionID: '3',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '5',
                    previousReportActionID: '4',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '6',
                    previousReportActionID: '5',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '7',
                    previousReportActionID: '6',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },

                // Note: there's a "gap" here because the previousReportActionID (8) does not match the ID of the previous reportAction in the array (7)
                {
                    reportActionID: '9',
                    previousReportActionID: '8',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '10',
                    previousReportActionID: '9',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '11',
                    previousReportActionID: '10',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '12',
                    previousReportActionID: '11',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },

                // Note: another gap
                {
                    reportActionID: '14',
                    previousReportActionID: '13',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '15',
                    previousReportActionID: '14',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '16',
                    previousReportActionID: '15',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '17',
                    previousReportActionID: '16',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
            ];

            const expectedResult = [
                {
                    reportActionID: '14',
                    previousReportActionID: '13',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '15',
                    previousReportActionID: '14',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '16',
                    previousReportActionID: '15',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '17',
                    previousReportActionID: '16',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
            ];
            // Reversing the input array to simulate descending order sorting as per our data structure
            const result = ReportActionsUtils.getContinuousReportActionChain(input.reverse(), '16');
            input.pop();
            expect(result).toStrictEqual(expectedResult.reverse());
        });

        it('given an input ID of 8 or 13 which are not exist in Onyx it will return an empty array', () => {
            const input: ReportAction[] = [
                // Given these sortedReportActions
                {
                    reportActionID: '1',
                    previousReportActionID: undefined,
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '2',
                    previousReportActionID: '1',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '3',
                    previousReportActionID: '2',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '4',
                    previousReportActionID: '3',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '5',
                    previousReportActionID: '4',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '6',
                    previousReportActionID: '5',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '7',
                    previousReportActionID: '6',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },

                // Note: there's a "gap" here because the previousReportActionID (8) does not match the ID of the previous reportAction in the array (7)
                {
                    reportActionID: '9',
                    previousReportActionID: '8',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '10',
                    previousReportActionID: '9',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '11',
                    previousReportActionID: '10',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '12',
                    previousReportActionID: '11',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },

                // Note: another gap
                {
                    reportActionID: '14',
                    previousReportActionID: '13',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '15',
                    previousReportActionID: '14',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '16',
                    previousReportActionID: '15',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
                {
                    reportActionID: '17',
                    previousReportActionID: '16',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                },
            ];

            const expectedResult: ReportAction[] = [];
            // Reversing the input array to simulate descending order sorting as per our data structure
            const result = ReportActionsUtils.getContinuousReportActionChain(input.reverse(), '8');
            input.pop();
            expect(result).toStrictEqual(expectedResult.reverse());
        });

        it('given an empty input ID and the report only contains pending actions, it will return all actions', () => {
            const input: ReportAction[] = [
                // Given these sortedReportActions
                {
                    reportActionID: '1',
                    previousReportActionID: undefined,
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                {
                    reportActionID: '2',
                    previousReportActionID: '1',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                {
                    reportActionID: '3',
                    previousReportActionID: '2',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                {
                    reportActionID: '4',
                    previousReportActionID: '3',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                {
                    reportActionID: '5',
                    previousReportActionID: '4',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                {
                    reportActionID: '6',
                    previousReportActionID: '5',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                {
                    reportActionID: '7',
                    previousReportActionID: '6',
                    created: '2022-11-13 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    originalMessage: {
                        html: 'Hello world',
                        whisperedTo: [],
                    },
                    message: [
                        {
                            html: 'Hello world',
                            type: 'Action type',
                            text: 'Action text',
                        },
                    ],
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            ];

            const expectedResult = input;
            // Reversing the input array to simulate descending order sorting as per our data structure
            const result = ReportActionsUtils.getContinuousReportActionChain(input.reverse(), '');
            expect(result).toStrictEqual(expectedResult.reverse());
        });
    });

    describe('getLastVisibleAction', () => {
        it('should return the last visible action for a report', () => {
            const report: Report = {
                ...LHNTestUtils.getFakeReport([8401445480599174, 9401445480599174], 3, true),
                reportID: '1',
            };
            const action: ReportAction = {
                ...LHNTestUtils.getFakeReportAction('email1@test.com', 3),
                created: '2023-08-01 16:00:00',
                reportActionID: 'action1',
                actionName: 'ADDCOMMENT',
                originalMessage: {
                    html: 'Hello world',
                    whisperedTo: [],
                },
            };
            const action2: ReportAction = {
                ...LHNTestUtils.getFakeReportAction('email2@test.com', 3),
                created: '2023-08-01 18:00:00',
                reportActionID: 'action2',
                actionName: 'ADDCOMMENT',
                originalMessage: {
                    html: 'Hello world',
                    whisperedTo: [],
                },
            };
            return (
                waitForBatchedUpdates()
                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        // @ts-expect-error Preset necessary values
                        Onyx.multiSet({
                            [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`]: {[action.reportActionID]: action, [action2.reportActionID]: action2},
                        }),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
                                    waitForCollectionCallback: true,
                                    callback: () => {
                                        Onyx.disconnect(connectionID);
                                        const res = ReportActionsUtils.getLastVisibleAction(report.reportID);
                                        expect(res).toEqual(action2);
                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });
    });
});
