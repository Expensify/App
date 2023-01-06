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
                    },
                    {
                        created: '2022-11-09 22:27:01.600',
                        reportActionID: '6401435781022176',
                    },

                    // These reportActions were created in the same millisecond so should appear ordered by reportActionID
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '2962390724708756',
                    },
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '1609646094152486',
                    },
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '1661970171066218',
                    },
                ],
                [
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '1609646094152486',
                    },
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '1661970171066218',
                    },
                    {
                        created: '2022-11-09 22:26:48.789',
                        reportActionID: '2962390724708756',
                    },
                    {
                        created: '2022-11-09 22:27:01.600',
                        reportActionID: '6401435781022176',
                    },
                    {
                        created: '2022-11-09 22:27:01.825',
                        reportActionID: '8401445780099176',
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

    describe('filterReportActionsForDisplay', () => {
        it('should filter out non-whitelisted actions', () => {
            const input = [
                {
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    message: [{html: 'Hello world'}],
                },
                {
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    message: [{html: 'Hello world'}],
                },
                {
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    message: [{html: 'Hello world'}],
                },
                {
                    actionName: CONST.REPORT.ACTIONS.TYPE.RENAMED,
                    message: [{html: 'Hello world'}],
                },
                {
                    actionName: 'REIMBURSED',
                    message: [{html: 'Hello world'}],
                },
            ];
            const result = ReportActionsUtils.filterReportActionsForDisplay(input);
            input.pop();
            expect(result).toStrictEqual(input);
        });

        it('should filter out closed actions', () => {
            const input = [
                {
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    message: [{html: 'Hello world'}],
                },
                {
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    message: [{html: 'Hello world'}],
                },
                {
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    message: [{html: 'Hello world'}],
                },
                {
                    actionName: CONST.REPORT.ACTIONS.TYPE.RENAMED,
                    message: [{html: 'Hello world'}],
                },
                {
                    actionName: CONST.REPORT.ACTIONS.TYPE.CLOSED,
                    message: [{html: 'Hello world'}],
                },
            ];
            const result = ReportActionsUtils.filterReportActionsForDisplay(input);
            input.pop();
            expect(result).toStrictEqual(input);
        });

        it('should filter out deleted, non-pending comments', () => {
            const input = [
                {
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    message: [{html: 'Hello world'}],
                },
                {
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    message: [{html: ''}],
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
                {
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    message: [{html: ''}],
                },
            ];
            const result = ReportActionsUtils.filterReportActionsForDisplay(input);
            input.pop();
            expect(result).toStrictEqual(input);
        });
    });
});
