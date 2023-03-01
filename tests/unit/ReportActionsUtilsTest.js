import CONST from '../../src/CONST';
import * as ReportActionsUtils from '../../src/libs/ReportActionsUtils';

describe('ReportActionsUtils', () => {
    describe('getSortedReportActions', () => {
        const cases = [
            [
                [
                    // This is the highest created timestamp, so should appear last
                    {
                        created: '2022-11-09 22:27:01.825',
                        reportActionID: '8401445780099176',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    },
                    {
                        created: '2022-11-09 22:27:01.600',
                        reportActionID: '6401435781022176',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    },

                    // These reportActions were created in the same millisecond so should appear ordered by reportActionID
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '2962390724708756',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    },
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '1609646094152486',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    },
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '1661970171066218',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    },
                ],
                [
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '1609646094152486',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    },
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '1661970171066218',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    },
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '2962390724708756',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    },
                    {
                        created: '2022-11-09 22:27:01.600',
                        reportActionID: '6401435781022176',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    },
                    {
                        created: '2022-11-09 22:27:01.825',
                        reportActionID: '8401445780099176',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
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
                    },
                    {
                        created: '2023-01-10 22:25:47.132',
                        reportActionID: '2',
                        actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    },
                    {
                        created: '2023-01-10 22:25:47.132',
                        reportActionID: '1',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    },
                ],
                [
                    // The CREATED action should appear first, then we should sort by reportActionID
                    {
                        created: '2023-01-10 22:25:47.132',
                        reportActionID: '2',
                        actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    },
                    {
                        created: '2023-01-10 22:25:47.132',
                        reportActionID: '1',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    },
                    {
                        created: '2023-01-10 22:25:47.132',
                        reportActionID: '3',
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
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
            const input = [
                {
                    created: '2022-11-13 22:27:01.825',
                    reportActionID: '8401445780099176',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    message: [{html: 'Hello world'}],
                },
                {
                    created: '2022-11-12 22:27:01.825',
                    reportActionID: '6401435781022176',
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    message: [{html: 'Hello world'}],
                },
                {
                    created: '2022-11-11 22:27:01.825',
                    reportActionID: '2962390724708756',
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    message: [{html: 'Hello world'}],
                },
                {
                    created: '2022-11-10 22:27:01.825',
                    reportActionID: '1609646094152486',
                    actionName: CONST.REPORT.ACTIONS.TYPE.RENAMED,
                    message: [{html: 'Hello world'}],
                },
                {
                    created: '2022-11-09 22:27:01.825',
                    reportActionID: '1661970171066218',
                    actionName: 'REIMBURSED',
                    message: [{html: 'Hello world'}],
                },
            ];
            const result = ReportActionsUtils.getSortedReportActionsForDisplay(input);
            input.pop();
            expect(result).toStrictEqual(input);
        });
        it('should filter out closed actions', () => {
            const input = [
                {
                    created: '2022-11-13 22:27:01.825',
                    reportActionID: '8401445780099176',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    message: [{html: 'Hello world'}],
                },
                {
                    created: '2022-11-12 22:27:01.825',
                    reportActionID: '6401435781022176',
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    message: [{html: 'Hello world'}],
                },
                {
                    created: '2022-11-11 22:27:01.825',
                    reportActionID: '2962390724708756',
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    message: [{html: 'Hello world'}],
                },
                {
                    created: '2022-11-10 22:27:01.825',
                    reportActionID: '1609646094152486',
                    actionName: CONST.REPORT.ACTIONS.TYPE.RENAMED,
                    message: [{html: 'Hello world'}],
                },
                {
                    created: '2022-11-09 22:27:01.825',
                    reportActionID: '1661970171066218',
                    actionName: CONST.REPORT.ACTIONS.TYPE.CLOSED,
                    message: [{html: 'Hello world'}],
                },
            ];
            const result = ReportActionsUtils.getSortedReportActionsForDisplay(input);
            input.pop();
            expect(result).toStrictEqual(input);
        });

        it('should filter out deleted, non-pending comments', () => {
            const input = [
                {
                    created: '2022-11-13 22:27:01.825',
                    reportActionID: '8401445780099176',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    message: [{html: 'Hello world'}],
                },
                {
                    created: '2022-11-12 22:27:01.825',
                    reportActionID: '8401445780099175',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    message: [{html: ''}],
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
                {
                    created: '2022-11-11 22:27:01.825',
                    reportActionID: '8401445780099174',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    message: [{html: ''}],
                },
            ];
            const result = ReportActionsUtils.getSortedReportActionsForDisplay(input);
            input.pop();
            expect(result).toStrictEqual(input);
        });
    });
});
