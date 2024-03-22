import type {ReportAction, ReportActions} from '@src/types/onyx';
import type {ActionName} from '@src/types/onyx/OriginalMessage';
import createRandomReportAction from './collections/reportActions';

const actionNames: ActionName[] = ['ADDCOMMENT', 'IOU', 'REPORTPREVIEW', 'CLOSED'];

const getFakeReportAction = (index: number, actionName?: ActionName): ReportAction =>
    ({
        actionName,
        actorAccountID: index,
        automatic: false,
        avatar: '',
        created: '2023-09-12 16:27:35.124',
        isAttachment: true,
        isFirstItem: false,
        lastModified: '2021-07-14T15:00:00Z',
        message: [
            {
                html: 'hey',
                isDeletedParentAction: false,
                isEdited: false,
                reactions: [],
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
        previousReportActionID: (index === 0 ? 0 : index - 1).toString(),
        reportActionTimestamp: 1696243169753,
        sequenceNumber: 0,
        shouldShow: true,
        timestamp: 1696243169,
        whisperedToAccountIDs: [],
    } as ReportAction);

const getMockedSortedReportActions = (length = 100): ReportAction[] =>
    Array.from({length}, (element, index): ReportAction => {
        const actionName: ActionName = index === 0 ? 'CREATED' : 'ADDCOMMENT';
        return getFakeReportAction(index + 1, actionName);
    }).reverse();

const getMockedReportActionsMap = (length = 100): ReportActions => {
    const mockReports: ReportActions[] = Array.from({length}, (element, index): ReportActions => {
        const reportID = index + 1;
        const actionName: ActionName = index === 0 ? 'CREATED' : actionNames[index % actionNames.length];
        const reportAction = {
            ...createRandomReportAction(reportID),
            actionName,
            originalMessage: {
                linkedReportID: reportID.toString(),
            },
            previousReportActionID: index.toString(),
        } as ReportAction;

        return {[reportID]: reportAction};
    });
    return Object.assign({}, ...mockReports) as ReportActions;
};

export {getFakeReportAction, getMockedSortedReportActions, getMockedReportActionsMap};
