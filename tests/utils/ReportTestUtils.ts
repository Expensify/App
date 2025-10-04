import DateUtils from '@libs/DateUtils';
import {rand64} from '@libs/NumberUtils';
import CONST from '@src/CONST';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';
import type ReportActionName from '@src/types/onyx/ReportActionName';
import createRandomReportAction from './collections/reportActions';
import {createExpenseReport, createSelfDM} from './collections/reports';

const actionNames: ReportActionName[] = [CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, CONST.REPORT.ACTIONS.TYPE.IOU, CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW, CONST.REPORT.ACTIONS.TYPE.CLOSED];

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
        ...overrides,
    }) as ReportAction;

const getMockedSortedReportActions = (length = 100): ReportAction[] =>
    Array.from({length}, (element, index): ReportAction => {
        const actionName: ReportActionName = index === 0 ? 'CREATED' : 'ADDCOMMENT';
        return getFakeReportAction(index + 1, {actionName});
    }).reverse();

const getMockedReportActionsMap = (length = 100): ReportActions => {
    const mockReports: ReportActions[] = Array.from({length}, (element, index): ReportActions => {
        const reportID = index + 1;
        const actionName: ReportActionName = index === 0 ? 'CREATED' : (actionNames.at(index % actionNames.length) ?? 'CREATED');
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

const parseIndex = (value: string): number => {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? 1 : parsed;
};

function createExpenseReportForTest(reportID: string, overrides: Partial<Report> = {}): Report {
    const base = createExpenseReport(parseIndex(reportID));
    return {
        ...base,
        reportID,
        type: CONST.REPORT.TYPE.EXPENSE,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        ...overrides,
    };
}

function createSelfDMReportForTest(reportID: string, currentUserAccountID: number, overrides: Partial<Report> = {}): Report {
    const base = createSelfDM(parseIndex(reportID), currentUserAccountID);
    return {
        ...base,
        reportID,
        ownerAccountID: currentUserAccountID,
        ...overrides,
    };
}

type IOUOriginalMessageOverrides = Partial<NonNullable<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>['originalMessage']>>;
type IOUReportActionOverrides = Partial<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>;

function createIOUReportActionForTest({
    reportID,
    transactionID,
    amount,
    currency = CONST.CURRENCY.USD,
    type = CONST.IOU.REPORT_ACTION_TYPE.CREATE,
    actorAccountID = 0,
    reportActionID,
    originalMessageOverrides = {},
    overrides = {},
}: {
    reportID: string;
    transactionID: string;
    amount: number;
    currency?: string;
    type?: string;
    actorAccountID?: number;
    reportActionID?: string;
    originalMessageOverrides?: IOUOriginalMessageOverrides;
    overrides?: IOUReportActionOverrides;
}): ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> {
    const base = createRandomReportAction(parseIndex(transactionID));
    // eslint-disable-next-line deprecation/deprecation
    const {originalMessage, pendingAction, ...restOverrides} = overrides ?? {};

    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        actorAccountID,
        automatic: false,
        avatar: '',
        created: restOverrides.created ?? DateUtils.getDBTime(),
        errors: {},
        isAttachmentOnly: false,
        lastModified: restOverrides.lastModified ?? DateUtils.getDBTime(),
        message: restOverrides.message ?? base.message ?? [],
        originalMessage: {
            IOUReportID: reportID,
            IOUTransactionID: transactionID,
            amount,
            currency,
            type,
            // eslint-disable-next-line deprecation/deprecation
            ...(base.originalMessage ?? {}),
            ...originalMessageOverrides,
            // eslint-disable-next-line deprecation/deprecation
            ...originalMessage,
        },
        person: restOverrides.person ?? base.person ?? [],
        reportActionID: reportActionID ?? restOverrides.reportActionID ?? rand64(),
        // eslint-disable-next-line deprecation/deprecation
        sequenceNumber: restOverrides.sequenceNumber ?? 0,
        shouldShow: restOverrides.shouldShow ?? true,
        pendingAction: pendingAction ?? null,
        ...restOverrides,
    } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>;
}

export {getFakeReportAction, getMockedSortedReportActions, getMockedReportActionsMap, createExpenseReportForTest, createSelfDMReportForTest, createIOUReportActionForTest};
