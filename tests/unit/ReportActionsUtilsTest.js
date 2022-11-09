import CONST from '../../src/CONST';
import * as ReportActionsUtils from '../../src/libs/ReportActionsUtils';

describe('ReportActionsUtils', () => {
    describe('sortReportActions', () => {
        test('sorts by created, then actionName, then reportActionID', () => {
            const reportActions = [
                // This is the highest created timestamp, so should appear last
                {
                    created: '2022-11-09 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    reportActionID: '8401445780099176',
                },

                // These are all created in the same millisecond, but have different actionName
                {
                    created: '2022-11-09 22:25:48.789',
                    actionName: CONST.REPORT.ACTIONS.TYPE.CLOSED,
                    reportActionID: '6805724708869158',
                },
                {
                    created: '2022-11-09 22:25:48.789',
                    actionName: CONST.REPORT.ACTIONS.TYPE.RENAMED,
                    reportActionID: '4175125197039964',
                },
                {
                    created: '2022-11-09 22:25:48.789',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    reportActionID: '3583459600062524',
                },
                {
                    created: '2022-11-09 22:25:48.789',
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    reportActionID: '7052827918713536',
                },
                {
                    created: '2022-11-09 22:25:48.789',
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    reportActionID: '7004168689538312',
                },

                // Then lastly, some reportActions created in the same millisecond and with the same actionName
                {
                    created: '2022-11-09 22:26:48.789',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    reportActionID: '2962390724708756',
                },
                {
                    created: '2022-11-09 22:26:48.789',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    reportActionID: '1609646094152486',
                },
                {
                    created: '2022-11-09 22:26:48.789',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    reportActionID: '1661970171066218',
                },
            ];

            ReportActionsUtils.sortReportActions(reportActions);

            expect(reportActions).toStrictEqual([
                {
                    created: '2022-11-09 22:25:48.789',
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    reportActionID: '7004168689538312',
                },
                {
                    created: '2022-11-09 22:25:48.789',
                    actionName: CONST.REPORT.ACTIONS.TYPE.RENAMED,
                    reportActionID: '4175125197039964',
                },
                {
                    created: '2022-11-09 22:25:48.789',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    reportActionID: '3583459600062524',
                },
                {
                    created: '2022-11-09 22:25:48.789',
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    reportActionID: '7052827918713536',
                },
                {
                    created: '2022-11-09 22:25:48.789',
                    actionName: CONST.REPORT.ACTIONS.TYPE.CLOSED,
                    reportActionID: '6805724708869158',
                },
                {
                    created: '2022-11-09 22:26:48.789',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    reportActionID: '1609646094152486',
                },
                {
                    created: '2022-11-09 22:26:48.789',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    reportActionID: '1661970171066218',
                },
                {
                    created: '2022-11-09 22:26:48.789',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    reportActionID: '2962390724708756',
                },
                {
                    created: '2022-11-09 22:27:01.825',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    reportActionID: '8401445780099176',
                },
            ]);
        });
    });
});
