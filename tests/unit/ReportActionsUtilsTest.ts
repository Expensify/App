import Onyx from 'react-native-onyx';
import type {KeyValueMapping} from 'react-native-onyx';
import CONST from '../../src/CONST';
import * as ReportActionsUtils from '../../src/libs/ReportActionsUtils';
import ONYXKEYS from '../../src/ONYXKEYS';
import type {Report, ReportAction, ReportActionsPages} from '../../src/types/onyx';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

function createReportAction(id: string) {
    return {
        reportActionID: id,
        created: '2022-11-13 22:27:01.825',
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
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
    };
}

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
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:27:01.600',
                        reportActionID: '6401435781022176',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },

                    // These reportActions were created in the same millisecond so should appear ordered by reportActionID
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '2962390724708756',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '1609646094152486',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '1661970171066218',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
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
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '1661970171066218',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '2962390724708756',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:27:01.600',
                        reportActionID: '6401435781022176',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2022-11-09 22:27:01.825',
                        reportActionID: '8401445780099176',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
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
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
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
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
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
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        originalMessage: {
                            html: 'Hello world',
                            whisperedTo: [],
                        },
                    },
                    {
                        created: '2023-01-10 22:25:47.132',
                        reportActionID: '3',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
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
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
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
                    actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FIELD,
                    originalMessage: {},
                    message: [{html: 'updated the Approval Mode from "Submit and Approve" to "Submit and Close"', type: 'Action type', text: 'Action text'}],
                },
                {
                    created: '2022-11-08 22:27:06.825',
                    reportActionID: '1661970171066216',
                    actionName: CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED,
                    originalMessage: {
                        paymentType: 'ACH',
                    },
                    message: [{html: 'Waiting for the bank account', type: 'Action type', text: 'Action text'}],
                },
                {
                    created: '2022-11-06 22:27:08.825',
                    reportActionID: '1661970171066220',
                    actionName: CONST.REPORT.ACTIONS.TYPE.TASK_EDITED,
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
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
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
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
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
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
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
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
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
                createReportAction('17'),
                createReportAction('16'),
                createReportAction('15'),
                createReportAction('14'),
                // Gap
                createReportAction('12'),
                createReportAction('11'),
                createReportAction('10'),
                createReportAction('9'),
                // Gap
                createReportAction('7'),
                createReportAction('6'),
                createReportAction('5'),
                createReportAction('4'),
                createReportAction('3'),
                createReportAction('2'),
                createReportAction('1'),
            ];

            const pages: ReportActionsPages = [
                // Given these pages
                ['17', '16', '15', '14'],
                ['12', '11', '10', '9'],
                ['7', '6', '5', '4', '3', '2', '1'],
            ];

            const expectedResult = [
                // Expect these sortedReportActions
                createReportAction('7'),
                createReportAction('6'),
                createReportAction('5'),
                createReportAction('4'),
                createReportAction('3'),
                createReportAction('2'),
                createReportAction('1'),
            ];
            const result = ReportActionsUtils.getContinuousReportActionChain(input, pages, '3');
            expect(result).toStrictEqual(expectedResult);
        });

        it('given an input ID of 9, ..., 12 it will return the report actions with id 9 - 12', () => {
            const input: ReportAction[] = [
                // Given these sortedReportActions
                createReportAction('17'),
                createReportAction('16'),
                createReportAction('15'),
                createReportAction('14'),
                // Gap
                createReportAction('12'),
                createReportAction('11'),
                createReportAction('10'),
                createReportAction('9'),
                // Gap
                createReportAction('7'),
                createReportAction('6'),
                createReportAction('5'),
                createReportAction('4'),
                createReportAction('3'),
                createReportAction('2'),
                createReportAction('1'),
            ];

            const pages: ReportActionsPages = [
                // Given these pages
                ['17', '16', '15', '14'],
                ['12', '11', '10', '9'],
                ['7', '6', '5', '4', '3', '2', '1'],
            ];

            const expectedResult = [
                // Expect these sortedReportActions
                createReportAction('12'),
                createReportAction('11'),
                createReportAction('10'),
                createReportAction('9'),
            ];
            const result = ReportActionsUtils.getContinuousReportActionChain(input, pages, '10');
            expect(result).toStrictEqual(expectedResult);
        });

        it('given an input ID of 14, ..., 17 it will return the report actions with id 14 - 17', () => {
            const input: ReportAction[] = [
                // Given these sortedReportActions
                createReportAction('17'),
                createReportAction('16'),
                createReportAction('15'),
                createReportAction('14'),
                // Gap
                createReportAction('12'),
                createReportAction('11'),
                createReportAction('10'),
                createReportAction('9'),
                // Gap
                createReportAction('7'),
                createReportAction('6'),
                createReportAction('5'),
                createReportAction('4'),
                createReportAction('3'),
                createReportAction('2'),
                createReportAction('1'),
            ];

            const pages: ReportActionsPages = [
                // Given these pages
                ['17', '16', '15', '14'],
                ['12', '11', '10', '9'],
                ['7', '6', '5', '4', '3', '2', '1'],
            ];

            const expectedResult = [
                // Expect these sortedReportActions
                createReportAction('17'),
                createReportAction('16'),
                createReportAction('15'),
                createReportAction('14'),
            ];
            const result = ReportActionsUtils.getContinuousReportActionChain(input, pages, '16');
            expect(result).toStrictEqual(expectedResult);
        });

        it('given an input ID of 8 or 13 which do not exist in Onyx it will return an empty array', () => {
            const input: ReportAction[] = [
                // Given these sortedReportActions
                createReportAction('17'),
                createReportAction('16'),
                createReportAction('15'),
                createReportAction('14'),
                // Gap
                createReportAction('12'),
                createReportAction('11'),
                createReportAction('10'),
                createReportAction('9'),
                // Gap
                createReportAction('7'),
                createReportAction('6'),
                createReportAction('5'),
                createReportAction('4'),
                createReportAction('3'),
                createReportAction('2'),
                createReportAction('1'),
            ];

            const pages: ReportActionsPages = [
                // Given these pages
                ['17', '16', '15', '14'],
                ['12', '11', '10', '9'],
                ['7', '6', '5', '4', '3', '2', '1'],
            ];

            // Expect these sortedReportActions
            const expectedResult: ReportAction[] = [];
            const result = ReportActionsUtils.getContinuousReportActionChain(input, pages, '8');
            expect(result).toStrictEqual(expectedResult);
        });

        it('given an input ID of an action in a gap it will return only that action', () => {
            const input: ReportAction[] = [
                // Given these sortedReportActions
                createReportAction('17'),
                createReportAction('16'),
                createReportAction('15'),
                createReportAction('14'),
                createReportAction('13'),
                createReportAction('12'),
                createReportAction('11'),
                createReportAction('10'),
                createReportAction('9'),
                createReportAction('8'),
                createReportAction('7'),
                createReportAction('6'),
                createReportAction('5'),
                createReportAction('4'),
                createReportAction('3'),
                createReportAction('2'),
                createReportAction('1'),
            ];

            const pages: ReportActionsPages = [
                // Given these pages
                ['17', '16', '15', '14'],
                ['12', '11', '10', '9'],
                ['7', '6', '5', '4', '3', '2', '1'],
            ];

            const expectedResult: ReportAction[] = [
                // Expect these sortedReportActions
                createReportAction('8'),
            ];
            const result = ReportActionsUtils.getContinuousReportActionChain(input, pages, '8');
            expect(result).toStrictEqual(expectedResult);
        });

        it('given an empty input ID and the report only contains pending actions, it will return all actions', () => {
            const input: ReportAction[] = [
                // Given these sortedReportActions
                createReportAction('7'),
                createReportAction('6'),
                createReportAction('5'),
                createReportAction('4'),
                createReportAction('3'),
                createReportAction('2'),
                createReportAction('1'),
            ];

            const pages: ReportActionsPages = [];

            // Expect these sortedReportActions
            const expectedResult = [...input];
            const result = ReportActionsUtils.getContinuousReportActionChain(input, pages, '');
            expect(result).toStrictEqual(expectedResult);
        });

        it('given an empty input ID and the report only contains pending actions, it will return an empty array', () => {
            const input: ReportAction[] = [
                // Given these sortedReportActions
                createReportAction('7'),
                createReportAction('6'),
                createReportAction('5'),
                createReportAction('4'),
                createReportAction('3'),
                createReportAction('2'),
                createReportAction('1'),
            ];

            const pages: ReportActionsPages = [];

            // Expect these sortedReportActions
            const expectedResult: ReportAction[] = [];
            const result = ReportActionsUtils.getContinuousReportActionChain(input, pages, '4');
            expect(result).toStrictEqual(expectedResult);
        });

        it('does not include actions outside of pages', () => {
            const input: ReportAction[] = [
                // Given these sortedReportActions
                createReportAction('17'),
                createReportAction('16'),
                createReportAction('15'),
                createReportAction('14'),
                createReportAction('13'),
                createReportAction('12'),
                createReportAction('11'),
                createReportAction('10'),
                createReportAction('9'),
                createReportAction('8'),
                createReportAction('7'),
                createReportAction('6'),
                createReportAction('5'),
                createReportAction('4'),
                createReportAction('3'),
                createReportAction('2'),
                createReportAction('1'),
            ];

            const pages: ReportActionsPages = [
                // Given these pages
                ['17', '16', '15', '14'],
                ['12', '11', '10', '9'],
                ['7', '6', '5', '4', '3', '2'],
            ];

            const expectedResult = [
                // Expect these sortedReportActions
                createReportAction('12'),
                createReportAction('11'),
                createReportAction('10'),
                createReportAction('9'),
            ];
            const result = ReportActionsUtils.getContinuousReportActionChain(input, pages, '10');
            expect(result).toStrictEqual(expectedResult);
        });

        it('given a page with null firstReportActionID include actions from the start', () => {
            const input: ReportAction[] = [
                // Given these sortedReportActions
                createReportAction('17'),
                createReportAction('16'),
                createReportAction('15'),
                createReportAction('14'),
            ];

            const pages: ReportActionsPages = [
                // Given these pages
                [CONST.PAGINATION_START_ID, '15', '14'],
            ];

            const expectedResult = [
                // Expect these sortedReportActions
                createReportAction('17'),
                createReportAction('16'),
                createReportAction('15'),
                createReportAction('14'),
            ];
            const result = ReportActionsUtils.getContinuousReportActionChain(input, pages, '');
            expect(result).toStrictEqual(expectedResult);
        });

        it('given a page with null lastReportActionID include actions to the end', () => {
            const input: ReportAction[] = [
                // Given these sortedReportActions
                createReportAction('17'),
                createReportAction('16'),
                createReportAction('15'),
                createReportAction('14'),
            ];

            const pages: ReportActionsPages = [
                // Given these pages
                ['17', '16', CONST.PAGINATION_END_ID],
            ];

            const expectedResult = [
                // Expect these sortedReportActions
                createReportAction('17'),
                createReportAction('16'),
                createReportAction('15'),
                createReportAction('14'),
            ];
            const result = ReportActionsUtils.getContinuousReportActionChain(input, pages, '');
            expect(result).toStrictEqual(expectedResult);
        });
    });

    describe('mergeContinuousPages', () => {
        it('merges continuous pages', () => {
            const sortedReportActions = [
                // Given these sortedReportActions
                createReportAction('5'),
                createReportAction('4'),
                createReportAction('3'),
                createReportAction('2'),
                createReportAction('1'),
            ];
            const pages: ReportActionsPages = [
                // Given these pages
                ['5', '4', '3'],
                ['3', '2', '1'],
            ];
            const expectedResult: ReportActionsPages = [
                // Expect these pages
                ['5', '4', '3', '2', '1'],
            ];
            const result = ReportActionsUtils.mergeContinuousPages(sortedReportActions, pages);
            expect(result).toStrictEqual(expectedResult);
        });

        it('merges overlapping pages', () => {
            const sortedReportActions = [
                // Given these sortedReportActions
                createReportAction('5'),
                createReportAction('4'),
                createReportAction('3'),
                createReportAction('2'),
                createReportAction('1'),
            ];
            const pages: ReportActionsPages = [
                // Given these pages
                ['4', '3', '2'],
                ['3', '2', '1'],
            ];
            const expectedResult: ReportActionsPages = [
                // Expect these pages
                ['4', '3', '2', '1'],
            ];
            const result = ReportActionsUtils.mergeContinuousPages(sortedReportActions, pages);
            expect(result).toStrictEqual(expectedResult);
        });

        it('merges included pages', () => {
            const sortedReportActions = [
                // Given these sortedReportActions
                createReportAction('5'),
                createReportAction('4'),
                createReportAction('3'),
                createReportAction('2'),
                createReportAction('1'),
            ];
            const pages: ReportActionsPages = [
                // Given these pages
                ['5', '4', '3', '2', '1'],
                ['5', '4', '3', '2'],
            ];
            const expectedResult: ReportActionsPages = [
                // Expect these pages
                ['5', '4', '3', '2', '1'],
            ];
            const result = ReportActionsUtils.mergeContinuousPages(sortedReportActions, pages);
            expect(result).toStrictEqual(expectedResult);
        });

        it('do not merge separate pages', () => {
            const sortedReportActions = [
                // Given these sortedReportActions
                createReportAction('5'),
                createReportAction('4'),
                // Gap
                createReportAction('2'),
                createReportAction('1'),
            ];
            const pages: ReportActionsPages = [
                // Given these pages
                ['5', '4'],
                ['2', '1'],
            ];
            const expectedResult: ReportActionsPages = [
                // Expect these pages
                ['5', '4'],
                ['2', '1'],
            ];
            const result = ReportActionsUtils.mergeContinuousPages(sortedReportActions, pages);
            expect(result).toStrictEqual(expectedResult);
        });

        it('sorts pages', () => {
            const sortedReportActions = [
                // Given these sortedReportActions
                createReportAction('9'),
                createReportAction('8'),
                // Gap
                createReportAction('6'),
                createReportAction('5'),
                // Gap
                createReportAction('3'),
                createReportAction('2'),
                createReportAction('1'),
            ];
            const pages: ReportActionsPages = [
                // Given these pages
                ['3', '2', '1'],
                ['3', '2'],
                ['6', '5'],
                ['9', '8'],
            ];
            const expectedResult: ReportActionsPages = [
                // Expect these pages
                ['9', '8'],
                ['6', '5'],
                ['3', '2', '1'],
            ];
            const result = ReportActionsUtils.mergeContinuousPages(sortedReportActions, pages);
            expect(result).toStrictEqual(expectedResult);
        });

        it('handles actions that no longer exist', () => {
            const sortedReportActions = [
                // Given these sortedReportActions
                createReportAction('4'),
                createReportAction('3'),
            ];
            const pages: ReportActionsPages = [
                // Given these pages
                ['6', '5', '4', '3', '2', '1'],
            ];
            const expectedResult: ReportActionsPages = [
                // Expect these pages
                ['4', '3'],
            ];
            const result = ReportActionsUtils.mergeContinuousPages(sortedReportActions, pages);
            expect(result).toStrictEqual(expectedResult);
        });

        it('removes pages that are empty', () => {
            const sortedReportActions = [
                // Given these sortedReportActions
                createReportAction('4'),
            ];
            const pages: ReportActionsPages = [
                // Given these pages
                ['6', '5'],
                ['3', '2', '1'],
            ];

            // Expect these pages
            const expectedResult: ReportActionsPages = [];
            const result = ReportActionsUtils.mergeContinuousPages(sortedReportActions, pages);
            expect(result).toStrictEqual(expectedResult);
        });

        it('handles pages with a single action', () => {
            const sortedReportActions = [
                // Given these sortedReportActions
                createReportAction('4'),
                createReportAction('2'),
            ];
            const pages: ReportActionsPages = [
                // Given these pages
                ['4'],
                ['2'],
                ['2'],
            ];
            const expectedResult: ReportActionsPages = [
                // Expect these pages
                ['4'],
                ['2'],
            ];
            const result = ReportActionsUtils.mergeContinuousPages(sortedReportActions, pages);
            expect(result).toStrictEqual(expectedResult);
        });

        it('handles out of order ids', () => {
            const sortedReportActions = [
                // Given these sortedReportActions
                createReportAction('2'),
                createReportAction('1'),
                createReportAction('3'),
                createReportAction('4'),
            ];
            const pages: ReportActionsPages = [
                // Given these pages
                ['2', '1'],
                ['1', '3'],
                ['4'],
            ];
            const expectedResult: ReportActionsPages = [
                // Expect these pages
                ['2', '1', '3'],
                ['4'],
            ];
            const result = ReportActionsUtils.mergeContinuousPages(sortedReportActions, pages);
            expect(result).toStrictEqual(expectedResult);
        });

        it('handles basic reordering', () => {
            const sortedReportActions = [
                // Given these sortedReportActions
                createReportAction('1'),
                createReportAction('2'),
                createReportAction('4'),
                createReportAction('5'),
            ];
            const pages: ReportActionsPages = [
                // Given these pages
                ['5', '4'],
                ['2', '1'],
            ];
            const expectedResult: ReportActionsPages = [
                // Expect these pages
                ['1', '2'],
                ['4', '5'],
            ];
            const result = ReportActionsUtils.mergeContinuousPages(sortedReportActions, pages);
            expect(result).toStrictEqual(expectedResult);
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
                        Onyx.multiSet({
                            [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`]: {[action.reportActionID]: action, [action2.reportActionID]: action2},
                        } as unknown as KeyValueMapping),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
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
