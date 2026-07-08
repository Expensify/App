import CONST from '@src/CONST';
import type {Report, ReportAction, Transaction} from '@src/types/onyx';
import type ReportActionName from '@src/types/onyx/ReportActionName';

import type {OnyxCollection} from 'react-native-onyx';

const getFakeReportAction = (index: number, overrides: Partial<ReportAction> = {}): ReportAction =>
    ({
        actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
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
        ...overrides,
    }) as ReportAction;

const getMockedSortedReportActions = (length = 100): ReportAction[] =>
    Array.from({length}, (element, index): ReportAction => {
        const actionName: ReportActionName = index === 0 ? 'CREATED' : 'ADDCOMMENT';
        return getFakeReportAction(index + 1, {actionName});
    }).reverse();

const createMockReport = (overrides: Partial<Report> = {}): Report =>
    ({
        reportID: '1',
        reportName: 'Test Report',
        type: CONST.REPORT.TYPE.CHAT,
        ...overrides,
    }) as Report;

function groupTransactionsByReportID(transactions?: OnyxCollection<Transaction>): Record<string, Transaction[]> {
    const grouped: Record<string, Transaction[]> = {};
    for (const transaction of Object.values(transactions ?? {})) {
        if (!transaction?.reportID) {
            continue;
        }
        grouped[transaction.reportID] ??= [];
        grouped[transaction.reportID].push(transaction);
    }
    return grouped;
}

export {getFakeReportAction, getMockedSortedReportActions, createMockReport, groupTransactionsByReportID};
