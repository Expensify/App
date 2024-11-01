import type {ReportAction, ReportActions} from '@src/types/onyx';
import type ReportActionName from '@src/types/onyx/ReportActionName';
import createRandomReportAction from './collections/reportActions';

const actionNames: ReportActionName[] = ['ADDCOMMENT', 'IOU', 'REPORTPREVIEW', 'CLOSED'];

const getFakeReportAction = (index: number, actionName?: ReportActionName): ReportAction =>
    ({
        actionName,
        actorAccountID: index,
        automatic: false,
        avatar: '',
        created: '2023-09-12 16:27:35.124',
        isAttachmentOnly: true,
        isFirstItem: false,
        lastModified: '2021-07-14T15:00:00Z',
        message: [
            {
                html: 'hey',
                isDeletedParentAction: false,
                isEdited: false,
                text: 'test',
                type: 'TEXT',
                whisperedTo: [],
            },
        ],
        originalMessage: {
            html: 'hey',
            lastModified: '2021-07-14T15:00:00Z',
            // IOUReportID: index,
            linkedReportID: index.toString(),
            whisperedTo: [],
            reason: '',
            violationName: '',
        },
        pendingAction: null,
        person: [
            {
                type: 'TEXT',
                style: 'strong',
                text: 'email@test.com',
            },
        ],
        reportActionID: index.toString(),
        sequenceNumber: 0,
        shouldShow: true,
    } as ReportAction);

const getMockedSortedReportActions = (length = 100): ReportAction[] =>
    Array.from({length}, (element, index): ReportAction => {
        const actionName: ReportActionName = index === 0 ? 'CREATED' : 'ADDCOMMENT';
        return getFakeReportAction(index + 1, actionName);
    }).reverse();

const getMockedReportActionsMap = (length = 100): ReportActions => {
    const mockReports: ReportActions[] = Array.from({length}, (element, index): ReportActions => {
        const reportID = index + 1;
        const actionName: ReportActionName = index === 0 ? 'CREATED' : actionNames.at(index % actionNames.length) ?? 'CREATED';
        const reportAction = {
            ...createRandomReportAction(reportID),
            actionName,
            originalMessage: {
                linkedReportID: reportID.toString(),
            },
        } as ReportAction;

        return {[reportID]: reportAction};
    });
    return Object.assign({}, ...mockReports) as ReportActions;
};

export {getFakeReportAction, getMockedSortedReportActions, getMockedReportActionsMap};
