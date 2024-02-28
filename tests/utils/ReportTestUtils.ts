import {ReportAction, ReportActions} from '@src/types/onyx';
import {ActionName} from '@src/types/onyx/OriginalMessage';
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
        previousReportActionID: '1',
        reportActionID: index.toString(),
        reportActionTimestamp: 1696243169753,
        sequenceNumber: 0,
        shouldShow: true,
        timestamp: 1696243169,
        whisperedToAccountIDs: [],
    } as ReportAction);

const getMockedSortedReportActions = (length = 100): ReportAction[] => Array.from({length}, (__, i): ReportAction => getFakeReportAction(i));

const getMockedReportActionsMap = (length = 100): ReportActions => {
    const mockReports: ReportActions[] = Array.from({length}, (__, i): ReportActions => {
        const reportID = i + 1;
        const actionName: ActionName = i === 0 ? 'CREATED' : actionNames[i % actionNames.length];
        const reportAction = {
            ...createRandomReportAction(reportID),
            actionName,
            originalMessage: {
                linkedReportID: reportID.toString(),
            },
        } as ReportAction;

        return {[reportID]: reportAction};
    });
    return Object.assign({}, ...mockReports);
};

export {getFakeReportAction, getMockedSortedReportActions, getMockedReportActionsMap};
