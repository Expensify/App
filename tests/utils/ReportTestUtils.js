import _ from 'underscore';

const actionNames = ['ADDCOMMENT', 'IOU', 'REPORTPREVIEW'];

const getFakeReportAction = (index, actionName) => ({
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
            isDelatedParentAction: false,
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
});

const getMockedSortedReportActions = (length = 100) => Array.from({length}, (__, i) => getFakeReportAction(i));

const getMockedReportsMap = (length = 100) => {
    const mockReports = Array.from({length}, (__, i) => {
        const reportID = i + 1;
        const actionName = i === 0 ? 'CREATED' : actionNames[i % actionNames.length];
        const reportAction = getFakeReportAction(reportID, actionName);

        return {[reportID]: reportAction};
    });
    return _.assign({}, ...mockReports);
};

export {getFakeReportAction, getMockedSortedReportActions, getMockedReportsMap};
