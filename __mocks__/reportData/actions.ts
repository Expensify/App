import CONST from '@src/CONST';
import type {OriginalMessageIOU, ReportAction} from '@src/types/onyx';

const usersIDs = [15593135, 51760358, 26502375];
const amount = 10402;
const currency = CONST.CURRENCY.USD;

const REPORT_R98765 = {
    IOUReportID: 'IOU_REPORT_ID_R98765',
    IOUTransactionID: 'TRANSACTION_ID_R98765',
    reportActionID: 'REPORT_ACTION_ID_R98765',
    childReportID: 'CHILD_REPORT_ID_R98765',
};

const REPORT_R14932 = {
    IOUReportID: 'IOU_REPORT_ID_R14932',
    IOUTransactionID: 'TRANSACTION_ID_R14932',
    reportActionID: 'REPORT_ACTION_ID_R14932',
    childReportID: 'CHILD_REPORT_ID_R14932',
};

const originalMessageR14932: OriginalMessageIOU = {
    currency,
    amount,
    IOUReportID: REPORT_R14932.IOUReportID,
    IOUTransactionID: REPORT_R14932.IOUTransactionID,
    participantAccountIDs: usersIDs,
    type: CONST.IOU.TYPE.CREATE,
    lastModified: '2025-02-14 08:12:05.165',
    comment: '',
};

const message = [
    {
        type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
        html: '$0.01 expense',
        text: '$0.01 expense',
        isEdited: false,
        whisperedTo: [],
        isDeletedParentAction: false,
        deleted: '',
    },
];

const person = [
    {
        type: 'TEXT',
        style: 'strong',
        text: 'John Smith',
    },
];

const actionR14932: ReportAction = {
    person,
    message,
    reportActionID: REPORT_R14932.reportActionID,
    childReportID: REPORT_R14932.childReportID,
    originalMessage: originalMessageR14932,
    actorAccountID: usersIDs.at(0),
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    childType: CONST.REPORT.TYPE.CHAT,
    childReportName: 'Expense #R14932',
    created: '2025-02-14 08:12:05.165',
};

const originalMessageR98765: OriginalMessageIOU = {
    amount,
    currency,
    IOUReportID: REPORT_R98765.IOUReportID,
    IOUTransactionID: REPORT_R98765.IOUTransactionID,
    participantAccountIDs: usersIDs,
    type: CONST.IOU.TYPE.CREATE,
    comment: '',
    lastModified: '2025-02-20 08:10:05.165',
};

const actionR98765: ReportAction = {
    message,
    person,
    reportActionID: REPORT_R98765.reportActionID,
    childReportID: REPORT_R98765.childReportID,
    originalMessage: originalMessageR98765,
    actorAccountID: usersIDs.at(0),
    childType: CONST.REPORT.TYPE.CHAT,
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    created: '2025-02-14 08:12:05.165',
};

export {actionR14932, actionR98765};
